"""
Database-level Python enums.

These mirror the Pydantic Literal types defined in app/schemas/ but are
declared as proper Python enums so SQLAlchemy can use them as native
PostgreSQL ENUM types via sa.Enum(MyEnum).

Import from here — never re-declare these in individual model files.
"""
from __future__ import annotations

import enum


class RoleEnum(str, enum.Enum):
    """Hero combat role — matches Pydantic Role literal."""
    vanguard   = "Vanguard"
    duelist    = "Duelist"
    strategist = "Strategist"


class RankBandEnum(str, enum.Enum):
    """Rank bracket used for stat segmentation — matches Pydantic RankBand literal."""
    all_ranks           = "All Ranks"
    bronze_silver       = "Bronze-Silver"
    gold_platinum       = "Gold-Platinum"
    diamond_grandmaster = "Diamond-Grandmaster"
    celestial_plus      = "Celestial+"


class TierEnum(str, enum.Enum):
    """Performance tier label — matches Pydantic Tier literal."""
    s = "S"
    a = "A"
    b = "B"
    c = "C"


class ChangeTypeEnum(str, enum.Enum):
    """Patch hero-change category — matches Pydantic ChangeType literal."""
    buff   = "buff"
    nerf   = "nerf"
    rework = "rework"
    new    = "new"


class GameModeEnum(str, enum.Enum):
    """Map game mode — matches DB spec §8."""
    domination  = "Domination"
    convoy      = "Convoy"
    convergence = "Convergence"


class LayerNameEnum(str, enum.Enum):
    """Medallion architecture layer — used in raw_api_responses for lineage tracing."""
    bronze = "bronze"
    silver = "silver"
    gold   = "gold"
