"""
Pydantic v2 schemas for recommendation responses.
Mirrors TypeScript interface in /src/lib/types/recommendation.ts.
"""
from __future__ import annotations

from pydantic import BaseModel, ConfigDict

from app.schemas.hero import Role, Tier, RankBand


class Recommendation(BaseModel):
    """Mirrors TypeScript Recommendation."""

    model_config = ConfigDict(populate_by_name=True)

    heroId: str
    heroName: str
    role: Role
    tier: Tier
    winRate: float
    pickRate: float
    mapWinRate: float
    score: float
    reasoning: str
    synergyTip: str
    counterTip: str
    rank: RankBand
    mapId: str
    mapName: str
