"""
Ingestion service — async pipeline from MarvelRivalsAPI.com.

Pipeline stages
---------------
1. Fetch raw JSON from the upstream API using httpx (x-api-key header).
2. Compute SHA-256 checksum; skip storage if payload already exists (idempotent).
3. Store raw payload in raw_api_responses (bronze layer).
4. Normalise into dim_heroes / dim_maps / dim_patches (silver dimensions).
5. Upsert per-hero daily stats into fact_hero_daily_stats (silver fact).
6. Mark the bronze row as processed.

Privacy guarantee (spec §11)
-----------------------------
- Only aggregate endpoints are called.  No player-UID endpoints.
- Payloads are scanned for known UID-like keys before storage; any found fields
  are masked with "<REDACTED>" before the row is written to raw_api_responses.
"""
from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import re
from datetime import date, datetime, timezone
from typing import Any

import httpx
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database.bronze.raw_api_responses import RawApiResponse
from app.database.enums import GameModeEnum, RankBandEnum, RoleEnum
from app.database.silver.dim_heroes import DimHero
from app.database.silver.dim_maps import DimMap
from app.database.silver.dim_patches import DimPatch
from app.database.silver.fact_hero_daily_stats import FactHeroDailyStat

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Privacy — UID scrubbing
# ---------------------------------------------------------------------------

_UID_KEY_PATTERNS: list[re.Pattern[str]] = [
    re.compile(r"player[_-]?id", re.IGNORECASE),
    re.compile(r"user[_-]?id", re.IGNORECASE),
    re.compile(r"\buid\b", re.IGNORECASE),
    re.compile(r"account[_-]?id", re.IGNORECASE),
    re.compile(r"profile[_-]?id", re.IGNORECASE),
    re.compile(r"steam[_-]?id", re.IGNORECASE),
]


def _mask_private_fields(obj: Any) -> Any:
    """Recursively redact any player-identifier fields from a JSON-decoded object."""
    if isinstance(obj, dict):
        return {
            k: ("<REDACTED>" if any(p.search(k) for p in _UID_KEY_PATTERNS)
                else _mask_private_fields(v))
            for k, v in obj.items()
        }
    if isinstance(obj, list):
        return [_mask_private_fields(item) for item in obj]
    return obj


def _sha256(payload: dict) -> str:
    """Return the SHA-256 hex digest of the canonical JSON serialisation."""
    canonical = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=True)
    return hashlib.sha256(canonical.encode()).hexdigest()


def _build_client() -> httpx.AsyncClient:
    return httpx.AsyncClient(
        base_url=settings.marvel_rivals_api_base_url,
        headers={"x-api-key": settings.marvel_rivals_api_key, "Accept": "application/json"},
        timeout=httpx.Timeout(settings.ingestion_request_timeout),
        follow_redirects=True,
    )


async def _fetch_with_retry(client: httpx.AsyncClient, path: str) -> dict:
    """Fetch *path* with exponential back-off on 429 / 5xx responses."""
    delay = settings.ingestion_rate_limit_delay
    last_exc: Exception | None = None
    for attempt in range(1, settings.ingestion_max_retries + 1):
        try:
            resp = await client.get(path)
            if resp.status_code in (429, 503):
                logger.warning("Rate-limited (%s) on %s attempt %d — %.1fs back-off",
                               resp.status_code, path, attempt, delay)
                await asyncio.sleep(delay)
                delay *= 2
                continue
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPStatusError as exc:
            last_exc = exc
            if exc.response.status_code < 500:
                raise
            await asyncio.sleep(delay)
            delay *= 2
        except httpx.RequestError as exc:
            last_exc = exc
            await asyncio.sleep(delay)
            delay *= 2
    raise RuntimeError(
        f"All {settings.ingestion_max_retries} attempts failed for {path}"
    ) from last_exc


# ---------------------------------------------------------------------------
# Bronze — store raw payload
# ---------------------------------------------------------------------------

async def _store_raw(
    session: AsyncSession, endpoint: str, payload: dict, patch_label: str | None,
) -> int | None:
    """Idempotent write to raw_api_responses. Returns row id or None if duplicate."""
    checksum = _sha256(payload)
    existing = await session.scalar(
        select(RawApiResponse.id).where(RawApiResponse.checksum == checksum)
    )
    if existing is not None:
        return None
    row = RawApiResponse(
        source_endpoint=endpoint, api_patch_label=patch_label,
        payload=payload, checksum=checksum, processed=False,
    )
    session.add(row)
    await session.flush()
    return row.id


# ---------------------------------------------------------------------------
# Silver — dimension upserts
# ---------------------------------------------------------------------------

_ROLE_MAP: dict[str, RoleEnum] = {
    "vanguard": RoleEnum.vanguard, "tank": RoleEnum.vanguard,
    "duelist": RoleEnum.duelist,   "damage": RoleEnum.duelist,
    "strategist": RoleEnum.strategist, "support": RoleEnum.strategist,
}
_MODE_MAP: dict[str, GameModeEnum] = {
    "domination": GameModeEnum.domination,
    "convoy": GameModeEnum.convoy,
    "convergence": GameModeEnum.convergence,
}


async def _upsert_hero(session: AsyncSession, d: dict) -> None:
    hero_id = d.get("id") or d.get("hero_id") or ""
    if not hero_id:
        return
    role = _ROLE_MAP.get(str(d.get("role", "duelist")).lower(), RoleEnum.duelist)
    await session.execute(
        pg_insert(DimHero)
        .values(id=hero_id, name=d.get("name", hero_id), role=role,
                portrait_url=d.get("portrait_url") or d.get("icon_url"), is_active=True)
        .on_conflict_do_update(index_elements=["id"],
            set_={"name": d.get("name", hero_id), "role": role,
                  "portrait_url": d.get("portrait_url") or d.get("icon_url"), "is_active": True})
    )


async def _upsert_map(session: AsyncSession, d: dict) -> None:
    map_id = d.get("id") or d.get("map_id") or ""
    if not map_id:
        return
    mode = _MODE_MAP.get(str(d.get("game_mode", "domination")).lower(), GameModeEnum.domination)
    await session.execute(
        pg_insert(DimMap)
        .values(id=map_id, name=d.get("name", map_id), game_mode=mode, is_active=True)
        .on_conflict_do_update(index_elements=["id"],
            set_={"name": d.get("name", map_id), "game_mode": mode, "is_active": True})
    )


async def _upsert_patch(session: AsyncSession, d: dict) -> None:
    patch_id = str(d.get("id") or d.get("patch_id") or "")
    if not patch_id:
        return
    try:
        released = date.fromisoformat(str(d.get("released_at") or d.get("release_date") or "")[:10])
    except (ValueError, TypeError):
        released = date.today()
    label = d.get("label") or d.get("name") or f"Patch {patch_id}"
    await session.execute(
        pg_insert(DimPatch)
        .values(id=patch_id, label=label, released_at=released,
                is_major=bool(d.get("is_major", False)),
                notes=d.get("notes") or d.get("description"))
        .on_conflict_do_update(index_elements=["id"],
            set_={"label": label, "released_at": released,
                  "is_major": bool(d.get("is_major", False)),
                  "notes": d.get("notes") or d.get("description")})
    )


# ---------------------------------------------------------------------------
# Silver — fact upsert helpers
# ---------------------------------------------------------------------------

def _f(v: Any, default: float = 0.0) -> float:
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def _i(v: Any, default: int = 0) -> int:
    try:
        return int(v)
    except (TypeError, ValueError):
        return default


async def _upsert_daily_stat(
    session: AsyncSession, hero_id: str, patch_id: str,
    rank_band: RankBandEnum, stat_date: date, d: dict, raw_id: int | None,
) -> None:
    vals: dict[str, Any] = dict(
        hero_id=hero_id, patch_id=patch_id, rank_band=rank_band, stat_date=stat_date,
        win_rate=_f(d.get("win_rate")), pick_rate=_f(d.get("pick_rate")),
        ban_rate=_f(d.get("ban_rate")), avg_kda=_f(d.get("avg_kda") or d.get("kda")),
        sample_size=_i(d.get("sample_size") or d.get("matches")), raw_response_id=raw_id,
    )
    await session.execute(
        pg_insert(FactHeroDailyStat).values(**vals)
        .on_conflict_do_update(
            constraint="uq_fact_hero_daily_stats_natural_key",
            set_={k: vals[k] for k in
                  ("win_rate", "pick_rate", "ban_rate", "avg_kda",
                   "sample_size", "raw_response_id")},
        )
    )


async def _process_hero_stats(
    session: AsyncSession, payload: dict, raw_id: int | None,
    patch_id: str, rank_band: RankBandEnum, today: date,
) -> int:
    heroes: list[dict] = payload.get("heroes") or payload.get("data") or []
    if isinstance(payload.get("hero_id"), str):
        heroes = [payload]
    count = 0
    for hd in heroes:
        hid = hd.get("id") or hd.get("hero_id") or ""
        if not hid:
            continue
        await _upsert_hero(session, hd)
        await _upsert_daily_stat(session, hid, patch_id, rank_band, today, hd, raw_id)
        count += 1
    return count


async def _mark_processed(
    session: AsyncSession, raw_id: int, error: str | None = None,
) -> None:
    row = await session.get(RawApiResponse, raw_id)
    if row is not None:
        row.processed = error is None
        row.processing_error = error


# ---------------------------------------------------------------------------
# Public entry point
# ---------------------------------------------------------------------------

async def run_ingestion(session: AsyncSession) -> dict[str, Any]:
    """
    Execute one full ingestion cycle: patches → maps → hero stats per rank band.
    Returns a summary dict.  Skips gracefully when the API key is absent.
    """
    if not settings.marvel_rivals_api_key:
        logger.warning("MARVEL_RIVALS_API_KEY not set — ingestion skipped.")
        return {"skipped": True, "reason": "API key not configured"}

    today = datetime.now(tz=timezone.utc).date()
    summary: dict[str, Any] = {
        "started_at": datetime.now(tz=timezone.utc).isoformat(),
        "endpoints": {},
    }

    async with _build_client() as client:
        # 1. Patches dimension
        try:
            pl = _mask_private_fields(await _fetch_with_retry(client, "/patches"))
            rid = await _store_raw(session, "/patches", pl, None)
            rows = pl.get("patches") or pl.get("data") or ([pl] if pl.get("id") else [])
            for p in rows:
                await _upsert_patch(session, p)
            if rid:
                await _mark_processed(session, rid)
            summary["endpoints"]["/patches"] = {"status": "ok", "rows": len(rows)}
        except Exception as exc:
            logger.error("Patch ingestion failed: %s", exc)
            summary["endpoints"]["/patches"] = {"status": "error", "detail": str(exc)}

        result = await session.execute(
            select(DimPatch.id).order_by(DimPatch.released_at.desc()).limit(1)
        )
        current_patch_id: str = result.scalar_one_or_none() or "unknown"

        # 2. Maps dimension
        try:
            pl = _mask_private_fields(await _fetch_with_retry(client, "/maps"))
            rid = await _store_raw(session, "/maps", pl, None)
            rows = pl.get("maps") or pl.get("data") or ([pl] if pl.get("id") else [])
            for m in rows:
                await _upsert_map(session, m)
            if rid:
                await _mark_processed(session, rid)
            summary["endpoints"]["/maps"] = {"status": "ok", "rows": len(rows)}
        except Exception as exc:
            logger.error("Map ingestion failed: %s", exc)
            summary["endpoints"]["/maps"] = {"status": "error", "detail": str(exc)}

        # 3. Hero stats per rank band
        rank_endpoints: list[tuple[str, RankBandEnum]] = [
            ("/stats/heroes",                    RankBandEnum.all_ranks),
            ("/stats/heroes?rank=bronze-silver", RankBandEnum.bronze_silver),
            ("/stats/heroes?rank=gold-platinum", RankBandEnum.gold_platinum),
            ("/stats/heroes?rank=diamond-gm",    RankBandEnum.diamond_grandmaster),
            ("/stats/heroes?rank=celestial",     RankBandEnum.celestial_plus),
        ]
        for endpoint, rank_band in rank_endpoints:
            await asyncio.sleep(settings.ingestion_rate_limit_delay)
            try:
                pl = _mask_private_fields(await _fetch_with_retry(client, endpoint))
                rid = await _store_raw(session, endpoint, pl, current_patch_id)
                count = await _process_hero_stats(
                    session, pl, rid, current_patch_id, rank_band, today
                )
                if rid:
                    await _mark_processed(session, rid)
                summary["endpoints"][endpoint] = {"status": "ok", "rows": count}
            except Exception as exc:
                logger.error("Hero stats ingestion failed %s: %s", endpoint, exc)
                summary["endpoints"][endpoint] = {"status": "error", "detail": str(exc)}

    summary["finished_at"] = datetime.now(tz=timezone.utc).isoformat()
    logger.info("Ingestion cycle complete: %s", summary)
    return summary
