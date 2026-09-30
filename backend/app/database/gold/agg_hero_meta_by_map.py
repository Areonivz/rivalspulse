"""
Gold layer — agg_hero_meta_by_map table.

Pre-aggregated hero performance metrics grouped by hero × map × patch.
This table is the primary data source for:
  - Map Performance table on /heroes/[heroId] detail page
  - Map-filtered recommendation scoring (map_win_rate term, spec §10)

Refresh cadence: rebuilt after every silver ingestion cycle (every 6 hours).

Foreign keys
------------
- hero_id  → dim_heroes.id
- map_id   → dim_maps.id
- patch_id → dim_patches.id
"""
from __future__ import annotations

from datetime import datetime

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin


class AggHeroMetaByMap(TimestampMixin, Base):
    """ORM model for ``agg_hero_meta_by_map`` (gold layer)."""

    __tablename__ = "agg_hero_meta_by_map"

    __table_args__ = (
        sa.UniqueConstraint(
            "hero_id", "map_id", "patch_id",
            name="uq_agg_meta_by_map_natural_key",
        ),
        sa.Index("ix_agg_meta_by_map_hero_id", "hero_id"),
        sa.Index("ix_agg_meta_by_map_map_id", "map_id"),
        sa.Index("ix_agg_meta_by_map_patch_id", "patch_id"),
        # Composite index for the hero-detail page query:
        #   WHERE hero_id = ? AND patch_id = ?  ORDER BY avg_win_rate DESC
        sa.Index(
            "ix_agg_meta_by_map_hero_patch_covering",
            "hero_id", "patch_id", "map_id",
        ),
        {
            "comment": (
                "Gold aggregate: hero performance per map per patch. "
                "Feeds the map-stats table on the hero detail page and "
                "the map_win_rate term in the recommendation scoring formula."
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
        sa.ForeignKey("dim_heroes.id", ondelete="RESTRICT", name="fk_agg_map_hero_id"),
        nullable=False,
        comment="References dim_heroes.id.",
    )

    map_id: Mapped[str] = mapped_column(
        sa.String(60),
        sa.ForeignKey("dim_maps.id", ondelete="RESTRICT", name="fk_agg_map_map_id"),
        nullable=False,
        comment="References dim_maps.id.",
    )

    patch_id: Mapped[str] = mapped_column(
        sa.String(20),
        sa.ForeignKey("dim_patches.id", ondelete="RESTRICT", name="fk_agg_map_patch_id"),
        nullable=False,
        comment="References dim_patches.id.",
    )

    # ── Aggregate measures ────────────────────────────────────────────────────
    avg_win_rate: Mapped[float] = mapped_column(
        sa.Numeric(5, 4), nullable=False,
        comment="Average win rate for this hero on this map during this patch.",
    )

    avg_pick_rate: Mapped[float] = mapped_column(
        sa.Numeric(5, 4), nullable=False,
        comment="Average pick rate for this hero on this map.",
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
            f"<AggHeroMetaByMap hero={self.hero_id!r} "
            f"map={self.map_id!r} patch={self.patch_id!r} "
            f"win={self.avg_win_rate}>"
        )
