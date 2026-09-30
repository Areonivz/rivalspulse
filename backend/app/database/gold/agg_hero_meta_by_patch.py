"""
Gold layer — agg_hero_meta_by_patch table.

Pre-aggregated hero performance metrics grouped by hero × patch.
This table is the primary data source for:
  - Win Rate Over Time line chart on /heroes/[heroId]  (last 6 patches)
  - Hero Impact bar chart on /patches page             (win_rate_delta)
  - patch_delta term in the recommendation scoring formula (spec §10)

The ``win_rate_delta`` and ``pick_rate_delta`` columns store the difference
versus the immediately preceding patch.  NULL on the first patch for a hero.

Refresh cadence: rebuilt after every silver ingestion cycle.

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


class AggHeroMetaByPatch(TimestampMixin, Base):
    """ORM model for ``agg_hero_meta_by_patch`` (gold layer)."""

    __tablename__ = "agg_hero_meta_by_patch"

    __table_args__ = (
        sa.UniqueConstraint(
            "hero_id", "patch_id",
            name="uq_agg_meta_by_patch_natural_key",
        ),
        sa.Index("ix_agg_meta_by_patch_hero_id", "hero_id"),
        sa.Index("ix_agg_meta_by_patch_patch_id", "patch_id"),
        # Composite covering index for patch-impact queries:
        #   WHERE patch_id = ?  ORDER BY win_rate_delta DESC
        sa.Index(
            "ix_agg_meta_by_patch_patch_delta_covering",
            "patch_id", "hero_id",
        ),
        {
            "comment": (
                "Gold aggregate: hero meta stats rolled up per patch. "
                "Includes win_rate_delta vs previous patch for the patch-impact chart."
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
        sa.ForeignKey("dim_heroes.id", ondelete="RESTRICT", name="fk_agg_patch_hero_id"),
        nullable=False,
        comment="References dim_heroes.id.",
    )

    patch_id: Mapped[str] = mapped_column(
        sa.String(20),
        sa.ForeignKey("dim_patches.id", ondelete="RESTRICT", name="fk_agg_patch_patch_id"),
        nullable=False,
        comment="References dim_patches.id.",
    )

    # ── Aggregate measures ────────────────────────────────────────────────────
    avg_win_rate: Mapped[float] = mapped_column(
        sa.Numeric(5, 4), nullable=False,
        comment="Average win rate across all rank bands for this hero during this patch.",
    )

    avg_pick_rate: Mapped[float] = mapped_column(
        sa.Numeric(5, 4), nullable=False,
        comment="Average pick rate across all rank bands.",
    )

    # ── Patch-over-patch deltas ───────────────────────────────────────────────
    win_rate_delta: Mapped[float | None] = mapped_column(
        sa.Numeric(5, 4), nullable=True,
        comment=(
            "Win rate change versus the immediately preceding patch. "
            "Positive = buff, negative = nerf, NULL = first recorded patch for this hero."
        ),
    )

    pick_rate_delta: Mapped[float | None] = mapped_column(
        sa.Numeric(5, 4), nullable=True,
        comment="Pick rate change versus the preceding patch.  NULL on first patch.",
    )

    total_sample_size: Mapped[int] = mapped_column(
        sa.Integer, nullable=False,
        comment="Sum of sample_size across all contributing fact rows.",
    )

    # ── Freshness ─────────────────────────────────────────────────────────────
    aggregated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False,
        server_default=sa.func.now(),
        comment="UTC timestamp when this aggregate row was last recomputed.",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<AggHeroMetaByPatch hero={self.hero_id!r} "
            f"patch={self.patch_id!r} win={self.avg_win_rate} "
            f"delta={self.win_rate_delta}>"
        )
