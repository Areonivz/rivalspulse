"""
app.database — RivalsPulse data warehouse layer (medallion architecture).

Public surface
--------------
Import the objects you need directly from this package:

    from app.database import Base, engine, get_async_session
    from app.database import DimHero, DimMap, DimPatch
    from app.database import FactHeroDailyStat
    from app.database import (
        AggHeroMetaByRank,
        AggHeroMetaByMap,
        AggHeroMetaByPatch,
        AggRecommendationDaily,
    )
    from app.database import RawApiResponse

Layer layout
------------
  bronze/  raw_api_responses     — immutable raw API payloads (JSONB)
  silver/  dim_heroes            — hero dimension
           dim_maps              — map dimension
           dim_patches           — patch dimension
           fact_hero_daily_stats — core aggregate fact table
  gold/    agg_hero_meta_by_rank    — pre-agg by rank band  → /meta endpoint
           agg_hero_meta_by_map     — pre-agg by map        → hero detail page
           agg_hero_meta_by_patch   — pre-agg by patch      → patch history charts
           agg_recommendations_daily — scored recs          → /recommendations endpoint

All models inherit from Base (single shared MetaData) so Alembic can
auto-discover every table via `target_metadata = Base.metadata`.
"""
from __future__ import annotations

# ── Infrastructure ────────────────────────────────────────────────────────────
from app.database.base import Base, TimestampMixin
from app.database.engine import async_session_factory, engine, get_async_session
from app.database.enums import (
    ChangeTypeEnum,
    GameModeEnum,
    LayerNameEnum,
    RankBandEnum,
    RoleEnum,
    TierEnum,
)

# ── Bronze layer ──────────────────────────────────────────────────────────────
from app.database.bronze import RawApiResponse

# ── Silver layer ──────────────────────────────────────────────────────────────
from app.database.silver import DimHero, DimMap, DimPatch, FactHeroDailyStat

# ── Gold layer ────────────────────────────────────────────────────────────────
from app.database.gold import (
    AggHeroMetaByMap,
    AggHeroMetaByPatch,
    AggHeroMetaByRank,
    AggRecommendationDaily,
)

__all__ = [
    # Infrastructure
    "Base",
    "TimestampMixin",
    "engine",
    "async_session_factory",
    "get_async_session",
    # Enums
    "RoleEnum",
    "RankBandEnum",
    "TierEnum",
    "ChangeTypeEnum",
    "GameModeEnum",
    "LayerNameEnum",
    # Bronze
    "RawApiResponse",
    # Silver
    "DimHero",
    "DimMap",
    "DimPatch",
    "FactHeroDailyStat",
    # Gold
    "AggHeroMetaByRank",
    "AggHeroMetaByMap",
    "AggHeroMetaByPatch",
    "AggRecommendationDaily",
]
