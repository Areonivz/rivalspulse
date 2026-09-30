"""
Gold layer — agg_hero_meta_by_rank table.

Pre-aggregated hero performance metrics grouped by hero × patch × rank band.
This table is the primary data source for:
  - GET /api/v1/meta/heroes?rank=&patch=   (HeroMetaTable page)
  - GET /api/v1/meta/heroes/{hero_id}       (stat cards on hero detail page)

Refresh cadence: rebuilt after every silver ingestion cycle (every 6 hours).
The ``aggregated_at`` column records when the row was last recomputed.

The ``tier`` column is pre-computed (S/A/B/C) and stored here so API reads
never need to recalculate it at query time.

Foreign keys
------------
- hero_id  → dim_heroes.id
- patch_id → dim_patches.id
"""
from __future__ import annotations

from datetime import datetime

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin
from app.database.enums import RankBandEnum, TierEnum


class AggHeroMetaByRank(TimestampMixin, Base):
    """ORM model for ``agg_hero_meta_by_rank`` (gold layer)."""

    __tablename__ = "agg_hero_meta_by_rank"

    __table_args__ = (
        sa.UniqueConstraint(
            "hero_id", "patch_id", "rank_band",
            name="uq_agg_meta_by_rank_natural_key",
        ),
        # Individual indexes for each filter dimension the /meta endpoint uses.
        sa.Index("ix_agg_meta_by_rank_patch_id", "patch_id"),
        sa.Index("ix_agg_meta_by_rank_rank_band", "rank_band"),
        sa.Index("ix_agg_meta_by_rank_hero_id", "hero_id"),
        # Composite covering index for the most common multi-filter query:
        #   WHERE patch_id = ? AND rank_band = ?  ORDER BY avg_win_rate DESC
        sa.Index(
            "ix_agg_meta_by_rank_patch_rank_covering",
            "patch_id", "rank_band", "hero_id",
        ),
        {
            "comment": (
                "Gold aggregate: hero meta stats grouped by rank band per patch. "
                "Primary source for /meta/heroes endpoint."
            )
        },
    )

    # ── Primary key ───────────────────────────────────────────────────────────
    id: Mapped[int] = mapped_column(
        sa.BigInteger, primary_key=True, autoincrement=True,
        comment="Surrogate primary key.",
    )

    # ── Dimension foreign keys ────────────────────────────────────────────────
    hero_id: Mapped[str] = mapped_column(
        sa.String(60),
        sa.ForeignKey("dim_heroes.id", ondelete="RESTRICT", name="fk_agg_rank_hero_id"),
        nullable=False,
        comment="References dim_heroes.id.",
    )

    patch_id: Mapped[str] = mapped_column(
        sa.String(20),
        sa.ForeignKey("dim_patches.id", ondelete="RESTRICT", name="fk_agg_rank_patch_id"),
        nullable=False,
        comment="References dim_patches.id.",
    )

    rank_band: Mapped[RankBandEnum] = mapped_column(
        sa.Enum(RankBandEnum, name="rank_band_enum", create_type=False),
        nullable=False,
        comment="Rank bracket this aggregate row covers.",
    )

    # ── Aggregate measures ────────────────────────────────────────────────────
    avg_win_rate: Mapped[float] = mapped_column(
        sa.Numeric(5, 4), nullable=False,
        comment="Average win rate across all stat_date rows for this hero/patch/rank combination.",
    )

    avg_pick_rate: Mapped[float] = mapped_column(
        sa.Numeric(5, 4), nullable=False,
        comment="Average pick rate.",
    )

    avg_ban_rate: Mapped[float] = mapped_column(
        sa.Numeric(5, 4), nullable=False,
        comment="Average ban rate.",
    )

    avg_kda: Mapped[float] = mapped_column(
        sa.Numeric(6, 3), nullable=False,
        comment="Average KDA ratio.",
    )

    total_sample_size: Mapped[int] = mapped_column(
        sa.Integer, nullable=False,
        comment="Sum of sample_size across all contributing fact rows.",
    )

    # ── Pre-computed tier ─────────────────────────────────────────────────────
    tier: Mapped[TierEnum] = mapped_column(
        sa.Enum(TierEnum, name="tier_enum", create_type=True),
        nullable=False,
        comment=(
            "Performance tier (S/A/B/C) pre-computed by the aggregation job "
            "so the API never needs to derive it at query time."
        ),
    )

    # ── Freshness ─────────────────────────────────────────────────────────────
    aggregated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False,
        server_default=sa.func.now(),
        comment="UTC timestamp when this aggregate row was last recomputed.",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<AggHeroMetaByRank hero={self.hero_id!r} "
            f"patch={self.patch_id!r} rank={self.rank_band.value} "
            f"win={self.avg_win_rate} tier={self.tier.value}>"
        )
