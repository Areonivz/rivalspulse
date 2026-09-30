"""
Pydantic v2 schemas for hero-related responses.
Field names (aliases) are intentionally camelCase to mirror the
TypeScript interfaces in /src/lib/types/hero.ts exactly.
"""
from __future__ import annotations

from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict


# ── Shared literals ────────────────────────────────────────────────────────────
Role = Literal["Vanguard", "Duelist", "Strategist"]
Tier = Literal["S", "A", "B", "C"]
RankBand = Literal[
    "All Ranks",
    "Bronze-Silver",
    "Gold-Platinum",
    "Diamond-Grandmaster",
    "Celestial+",
]


# ── Sub-models ─────────────────────────────────────────────────────────────────
class HeroMapStat(BaseModel):
    """Mirrors TypeScript HeroMapStat."""

    model_config = ConfigDict(populate_by_name=True)

    mapId: str
    mapName: str
    winRate: float
    pickRate: float
    sampleSize: int


class HeroPatchHistory(BaseModel):
    """Mirrors TypeScript HeroPatchHistory."""

    model_config = ConfigDict(populate_by_name=True)

    patch: str
    winRate: float
    pickRate: float


# ── Primary response model ─────────────────────────────────────────────────────
class HeroStats(BaseModel):
    """Mirrors TypeScript HeroStats — used for both list and detail responses."""

    model_config = ConfigDict(populate_by_name=True)

    id: str
    name: str
    role: Role
    tier: Tier
    winRate: float
    pickRate: float
    banRate: float
    avgKda: float
    patch: str
    rankBand: RankBand
    synergies: list[str]
    counters: list[str]
    mapStats: Optional[list[HeroMapStat]] = None
    patchHistory: Optional[list[HeroPatchHistory]] = None
