"""
Silver layer — fact_hero_daily_stats fact table.

Each row captures a single hero's aggregate performance metrics for one
(hero, patch, rank band, date) combination.

Privacy guarantee: all metrics are purely aggregate.  The recommendation
scoring model (spec §10) excludes rows where sample_size < 500.

Foreign keys
------------
- hero_id  → dim_heroes.id
- patch_id → dim_patches.id
- raw_response_id → raw_api_responses.id  (nullable lineage back-reference)
"""
from __future__ import annotations

from datetime import date, datetime

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.database.enums import RankBandEnum


class FactHeroDailyStat(Base):
    """ORM model for ``fact_hero_daily_stats`` (silver layer)."""

    __tablename__ = "fact_hero_daily_stats"

    __table_args__ = (
        sa.UniqueConstraint(
            "hero_id", "patch_id", "rank_band", "stat_date",
            name="uq_fact_hero_daily_stats_natural_key",
        ),
        sa.Index("ix_fact_hero_daily_stats_hero_id", "hero_id"),
        sa.Index("ix_fact_hero_daily_stats_patch_id", "patch_id"),
        sa.Index("ix_fact_hero_daily_stats_rank_band", "rank_band"),
        sa.Index(
            "ix_fact_hero_daily_stats_stat_date_desc",
            sa.text("stat_date DESC"),
        ),
        sa.Index(
            "ix_fact_hero_daily_stats_agg_covering",
            "hero_id", "patch_id", "rank_band",
        ),
        {
            "comment": (
                "Silver fact: one row per hero × patch × rank-band × calendar date. "
                "Aggregate metrics only — no player-level data stored."
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
        sa.ForeignKey("dim_heroes.id", ondelete="RESTRICT", name="fk_fact_daily_hero_id"),
        nullable=False,
        comment="References dim_heroes.id.",
    )

    patch_id: Mapped[str] = mapped_column(
        sa.String(20),
        sa.ForeignKey("dim_patches.id", ondelete="RESTRICT", name="fk_fact_daily_patch_id"),
        nullable=False,
        comment="References dim_patches.id.",
    )

    rank_band: Mapped[RankBandEnum] = mapped_column(
        sa.Enum(RankBandEnum, name="rank_band_enum", create_type=True),
        nullable=False,
        comment="Rank bracket for this stat row.",
    )

    stat_date: Mapped[date] = mapped_column(
        sa.Date, nullable=False,
        comment="Calendar date (UTC) of the ingestion snapshot.",
    )

    # ── Measures ──────────────────────────────────────────────────────────────
    win_rate: Mapped[float] = mapped_column(
        sa.Numeric(5, 4), nullable=False,
        comment="Hero win rate as decimal fraction, e.g. 0.5563 = 55.63%.",
    )

    pick_rate: Mapped[float] = mapped_column(
        sa.Numeric(5, 4), nullable=False,
        comment="Hero pick rate as decimal fraction.",
    )

    ban_rate: Mapped[float] = mapped_column(
        sa.Numeric(5, 4), nullable=False,
        comment="Hero ban rate as decimal fraction.",
    )

    avg_kda: Mapped[float] = mapped_column(
        sa.Numeric(6, 3), nullable=False,
        comment="Average kills-deaths-assists ratio, e.g. 2.870.",
    )

    sample_size: Mapped[int] = mapped_column(
        sa.Integer, nullable=False,
        comment=(
            "Match count for this snapshot. "
            "Rows with sample_size < 500 are excluded from gold aggregation (spec §10)."
        ),
    )

    # ── Lineage back-reference ────────────────────────────────────────────────
    raw_response_id: Mapped[int | None] = mapped_column(
        sa.BigInteger,
        sa.ForeignKey(
            "raw_api_responses.id",
            ondelete="SET NULL",
            name="fk_fact_daily_raw_response_id",
        ),
        nullable=True,
        comment="Bronze row that produced this fact row.  NULL for seeded/migrated data.",
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True), nullable=False,
        server_default=sa.func.now(),
        comment="Row creation timestamp (UTC).",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<FactHeroDailyStat hero={self.hero_id!r} "
            f"patch={self.patch_id!r} rank={self.rank_band.value} "
            f"date={self.stat_date} win_rate={self.win_rate}>"
        )
