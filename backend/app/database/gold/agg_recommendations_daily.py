"""
Gold layer — agg_recommendations_daily table.

Pre-scored and pre-ranked hero recommendations, recomputed daily.
This table is the primary data source for:
  - GET /api/v1/recommendations?role=&rank=&mapId=   (/recommendations page)

Scoring formula (spec §10):
    score = (win_rate  × 0.45)
           + (pick_rate × 0.20)
           + (map_win_rate × 0.25)
           + (patch_delta  × 0.10)

Only heroes with total_sample_size ≥ 500 are eligible (spec §10).
The top 3 by score within each (role, rank_band, map_id) combination are
stored with rank_position 1-3.  map_id = NULL represents an all-maps
recommendation (no map filter applied).

Foreign keys
------------
- hero_id  → dim_heroes.id
- patch_id → dim_patches.id
- map_id   → dim_maps.id  (nullable — NULL means all-maps)
"""
from __future__ import annotations

from datetime import date, datetime

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin
from app.database.enums import RankBandEnum


class AggRecommendationDaily(TimestampMixin, Base):
    """ORM model for ``agg_recommendations_daily`` (gold layer)."""

    __tablename__ = "agg_recommendations_daily"

    __table_args__ = (
        sa.UniqueConstraint(
            "hero_id", "patch_id", "map_id", "rank_band", "rec_date",
            name="uq_agg_recs_daily_natural_key",
        ),
        # Indexes for the exact filter combo used by the /recommendations endpoint.
        sa.Index("ix_agg_recs_daily_patch_id", "patch_id"),
        sa.Index("ix_agg_recs_daily_rank_band", "rank_band"),
        sa.Index("ix_agg_recs_daily_map_id", "map_id"),
        sa.Index(
            "ix_agg_recs_daily_rec_date_desc",
            sa.text("rec_date DESC"),
        ),
        # Composite covering index for the full API filter query:
        #   WHERE patch_id = ? AND rank_band = ? AND (map_id = ? OR map_id IS NULL)
        #   ORDER BY rank_position
        sa.Index(
            "ix_agg_recs_daily_filter_covering",
            "patch_id", "rank_band", "map_id", "rank_position",
        ),
        {
            "comment": (
                "Gold aggregate: pre-scored hero recommendations computed daily. "
                "Scoring formula from spec §10; only sample_size >= 500 heroes eligible."
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
        sa.ForeignKey("dim_heroes.id", ondelete="RESTRICT", name="fk_agg_recs_hero_id"),
        nullable=False,
        comment="References dim_heroes.id.",
    )

    patch_id: Mapped[str] = mapped_column(
        sa.String(20),
        sa.ForeignKey("dim_patches.id", ondelete="RESTRICT", name="fk_agg_recs_patch_id"),
        nullable=False,
        comment="References dim_patches.id — the patch this recommendation applies to.",
    )

    map_id: Mapped[str | None] = mapped_column(
        sa.String(60),
        sa.ForeignKey("dim_maps.id", ondelete="RESTRICT", name="fk_agg_recs_map_id"),
        nullable=True,
        comment=(
            "References dim_maps.id.  NULL indicates an all-maps recommendation "
            "(no specific map filter was applied during scoring)."
        ),
    )

    rank_band: Mapped[RankBandEnum] = mapped_column(
        sa.Enum(RankBandEnum, name="rank_band_enum", create_type=False),
        nullable=False,
        comment="Rank bracket this recommendation targets.",
    )

    # ── Scoring ───────────────────────────────────────────────────────────────
    score: Mapped[float] = mapped_column(
        sa.Numeric(8, 6), nullable=False,
        comment=(
            "Composite recommendation score (spec §10 formula). "
            "score = win_rate*0.45 + pick_rate*0.20 + map_win_rate*0.25 + patch_delta*0.10"
        ),
    )

    rank_position: Mapped[int] = mapped_column(
        sa.SmallInteger, nullable=False,
        comment=(
            "Ordinal rank within the (patch, rank_band, map_id) group. "
            "1 = highest score, 3 = third-highest.  Only positions 1-3 are stored."
        ),
    )

    # ── Generated text ────────────────────────────────────────────────────────
    reasoning: Mapped[str] = mapped_column(
        sa.Text, nullable=False,
        comment="Template-generated reasoning text explaining why this hero is recommended.",
    )

    synergy_tip: Mapped[str] = mapped_column(
        sa.Text, nullable=False,
        comment="Short tip about synergies for this hero in the current meta.",
    )

    counter_tip: Mapped[str] = mapped_column(
        sa.Text, nullable=False,
        comment="Short tip about heroes that counter this pick.",
    )

    # ── Time dimension ────────────────────────────────────────────────────────
    rec_date: Mapped[date] = mapped_column(
        sa.Date, nullable=False,
        comment="Calendar date (UTC) when this recommendation was computed.",
    )

    # ── Freshness ─────────────────────────────────────────────────────────────
    aggregated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False,
        server_default=sa.func.now(),
        comment="UTC timestamp when this row was last recomputed.",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<AggRecommendationDaily hero={self.hero_id!r} "
            f"patch={self.patch_id!r} rank={self.rank_band.value} "
            f"map={self.map_id!r} pos={self.rank_position} score={self.score}>"
        )
