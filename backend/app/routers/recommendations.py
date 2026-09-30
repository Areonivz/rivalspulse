"""
Router: /api/v1/recommendations

Strategy
--------
1. Try to build HeroCandidate objects from fact_hero_daily_stats in the DB.
2. If the DB is unavailable or returns no rows, fall back to the in-memory
   mock repository so the endpoint works in all MVP stages.
"""
from __future__ import annotations

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.engine import get_async_session
from app.database.enums import RankBandEnum
from app.database.silver.dim_heroes import DimHero
from app.database.silver.fact_hero_daily_stats import FactHeroDailyStat
from app.repositories.mock_recommendations import get_all_recommendations
from app.schemas.hero import RankBand, Role
from app.schemas.recommendation import Recommendation
from app.services.scoring import HeroCandidate, score_heroes

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/recommendations", tags=["recommendations"])

# ---------------------------------------------------------------------------
# Static map-name lookup (avoids an extra DB round-trip per request)
# ---------------------------------------------------------------------------

_MAP_NAMES: dict[str, str] = {
    "yggsgard":             "Yggsgard",
    "wakanda":              "Wakanda",
    "symbiotic-surface":    "Symbiotic Surface",
    "tokyo-2099":           "Tokyo 2099",
    "spider-islands":       "Spider-Islands",
    "hydra-charteris-base": "Hydra Charteris Base",
    "royal-palace":         "Royal Palace",
    "hall-of-djalia":       "Hall of Djalia",
}

_MAP_NOTES: dict[str, str] = {
    "yggsgard":             "Yggsgard's vertical layout amplifies aerial mobility.",
    "wakanda":              "Wakanda's dense cover rewards melee brawlers.",
    "symbiotic-surface":    "Symbiotic Surface corridors suppress long-range poke.",
    "tokyo-2099":           "Tokyo 2099's flanking routes enable dive compositions.",
    "spider-islands":       "Spider-Islands open mid favours mobile heroes.",
    "hydra-charteris-base": "Hydra Charteris Base corridors minimise aerial counters.",
    "royal-palace":         "Royal Palace clear sightlines reward long-range picks.",
    "hall-of-djalia":       "Hall of Djalia high ceilings boost aerial Duelists.",
}

_REASONING: dict[str, str] = {
    "S": "{name} is top-tier (S) this patch with consistently high win rates. {map_note}",
    "A": "{name} is a strong A-tier choice, above average across most match-ups. {map_note}",
    "B": "{name} is a reliable B-tier option that rewards game knowledge. {map_note}",
    "C": "{name} is situational (C-tier). Only pick into specific comps. {map_note}",
}


def _build_reasoning(name: str, tier: str, map_id: str | None) -> str:
    note = _MAP_NOTES.get(map_id or "", "Effective across most map types.")
    return _REASONING.get(tier, _REASONING["B"]).format(name=name, map_note=note)


# ---------------------------------------------------------------------------
# DB → HeroCandidate loader
# ---------------------------------------------------------------------------

async def _load_candidates(
    session: AsyncSession, rank: str | None,
) -> list[HeroCandidate]:
    rank_band: RankBandEnum | None = None
    if rank:
        for member in RankBandEnum:
            if member.value.lower() == rank.lower():
                rank_band = member
                break

    # Latest stat_date per (hero_id, rank_band)
    inner = (
        select(
            FactHeroDailyStat.hero_id,
            FactHeroDailyStat.rank_band,
            func.max(FactHeroDailyStat.stat_date).label("latest"),
        )
        .group_by(FactHeroDailyStat.hero_id, FactHeroDailyStat.rank_band)
        .subquery()
    )
    stmt = (
        select(FactHeroDailyStat, DimHero.name, DimHero.role)
        .join(DimHero, DimHero.id == FactHeroDailyStat.hero_id)
        .join(
            inner,
            (inner.c.hero_id == FactHeroDailyStat.hero_id)
            & (inner.c.rank_band == FactHeroDailyStat.rank_band)
            & (inner.c.latest == FactHeroDailyStat.stat_date),
        )
        .where(
            FactHeroDailyStat.rank_band == (rank_band or RankBandEnum.all_ranks)
        )
    )
    rows = (await session.execute(stmt)).all()
    return [
        HeroCandidate(
            hero_id=stat.hero_id,
            name=name,
            role=role.value,
            win_rate=float(stat.win_rate),
            pick_rate=float(stat.pick_rate),
            ban_rate=float(stat.ban_rate),
            avg_kda=float(stat.avg_kda),
            sample_size=stat.sample_size,
        )
        for stat, name, role in rows
    ]


# ---------------------------------------------------------------------------
# Route
# ---------------------------------------------------------------------------

@router.get(
    "",
    response_model=list[Recommendation],
    summary="Get top hero recommendations (default top 3)",
)
async def list_recommendations(
    role: Annotated[Role | None, Query(description="Filter by role")] = None,
    rank: Annotated[RankBand | None, Query(description="Filter by rank band")] = None,
    map_id: Annotated[str | None, Query(alias="mapId", description="Filter by map ID")] = None,
    playstyle: Annotated[str | None, Query(description="Playstyle: Aggressive|Defensive|Balanced")] = None,
    limit: Annotated[int, Query(ge=1, le=10, description="Number of results")] = 3,
    session: AsyncSession = Depends(get_async_session),
) -> list[Recommendation]:
    # 1. Live DB path
    try:
        candidates = await _load_candidates(session, rank)
        if candidates:
            scored = score_heroes(
                candidates, role=role, map_id=map_id, playstyle=playstyle, top_n=limit,
            )
            return [
                Recommendation(
                    heroId=s.hero_id,
                    heroName=s.name,
                    role=s.role,              # type: ignore[arg-type]
                    tier=s.tier,              # type: ignore[arg-type]
                    winRate=s.win_rate,
                    pickRate=s.pick_rate,
                    mapWinRate=round(s.win_rate + (s.breakdown.map_fit - 0.5) * 0.1, 4),
                    score=s.score,
                    reasoning=_build_reasoning(s.name, s.tier, map_id),
                    synergyTip="Check the hero detail page for full synergy tips.",
                    counterTip="Check the hero detail page for full counter tips.",
                    rank=rank or "All Ranks",  # type: ignore[arg-type]
                    mapId=map_id or "",
                    mapName=_MAP_NAMES.get(map_id or "", ""),
                )
                for s in scored
            ]
    except Exception as exc:
        logger.warning("DB recommendations failed, using mock fallback: %s", exc)

    # 2. Mock fallback
    return get_all_recommendations(role=role, rank=rank, map_id=map_id, limit=limit)
