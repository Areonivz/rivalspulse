"""
Router: /api/v1/meta
Provides aggregated hero-meta endpoints.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from typing import Annotated

from app.repositories.mock_heroes import get_all_heroes, get_hero_by_id
from app.schemas.hero import HeroStats, Role, RankBand

router = APIRouter(prefix="/api/v1/meta", tags=["meta"])


@router.get(
    "/heroes",
    response_model=list[HeroStats],
    summary="List all heroes with current meta stats",
)
def list_heroes(
    role: Annotated[Role | None, Query(description="Filter by role")] = None,
    rank: Annotated[RankBand | None, Query(description="Filter by rank band")] = None,
    patch: Annotated[str | None, Query(description="Filter by patch, e.g. '1.5'")] = None,
) -> list[HeroStats]:
    heroes = get_all_heroes()
    if role:
        heroes = [h for h in heroes if h.role == role]
    if rank:
        heroes = [h for h in heroes if h.rankBand == rank or h.rankBand == "All Ranks"]
    if patch:
        heroes = [h for h in heroes if h.patch == patch]
    return heroes


@router.get(
    "/heroes/{hero_id}",
    response_model=HeroStats,
    summary="Get a single hero with full detail (map stats, patch history)",
)
def get_hero(hero_id: str) -> HeroStats:
    hero = get_hero_by_id(hero_id)
    if hero is None:
        raise HTTPException(status_code=404, detail=f"Hero '{hero_id}' not found.")
    return hero
