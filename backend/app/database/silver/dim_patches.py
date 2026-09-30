"""
Silver layer — dim_patches dimension table.

One row per game patch.  The primary key is the version string used
throughout the codebase (e.g. ``1.5``).

The ``notes`` column stores the full patch-notes blob as free text;
structured per-hero change data lives in the gold layer
``agg_hero_meta_by_patch`` (win_rate_delta) and will be extended to a
dedicated ``patch_hero_changes`` table in a future migration.
"""
from __future__ import annotations

from datetime import date

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin


class DimPatch(TimestampMixin, Base):
    """
    ORM model for the ``dim_patches`` table (silver layer).

    Dimension table — append-only in practice; a new row is inserted
    for each game patch that the ingestion pipeline detects.
    """

    __tablename__ = "dim_patches"

    __table_args__ = (
        # Descending index on released_at: the /patches page orders newest-first.
        sa.Index("ix_dim_patches_released_at_desc", sa.text("released_at DESC")),
        # Boolean index for quick lookup of major patches.
        sa.Index("ix_dim_patches_is_major", "is_major"),
        {
            "comment": (
                "Silver dimension: one row per game patch. "
                "Version-string PKs (e.g. '1.5') match all mock data and API references."
            )
        },
    )

    # ── Primary key ──────────────────────────────────────────────────────────
    id: Mapped[str] = mapped_column(
        sa.String(20),
        primary_key=True,
        comment=(
            "Patch version string used as the natural key, e.g. '1.5'. "
            "Must match the patch labels used in fact and agg tables."
        ),
    )

    # ── Descriptive attributes ───────────────────────────────────────────────
    label: Mapped[str] = mapped_column(
        sa.String(60),
        nullable=False,
        comment="Human-readable patch name, e.g. 'The Symbiote Surge'.",
    )

    released_at: Mapped[date] = mapped_column(
        sa.Date,
        nullable=False,
        comment="Date the patch went live (UTC date, not datetime).",
    )

    is_major: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        default=False,
        server_default=sa.text("false"),
        comment=(
            "True for major version patches (balance overhauls, new heroes). "
            "Used to highlight significant events on the patch timeline."
        ),
    )

    notes: Mapped[str | None] = mapped_column(
        sa.Text,
        nullable=True,
        comment=(
            "Full patch notes text blob.  May be NULL if notes are not yet "
            "available at ingestion time."
        ),
    )

    # ── Relationships ────────────────────────────────────────────────────────
    # daily_stats: Mapped[list["FactHeroDailyStat"]] = relationship(back_populates="patch")
    # meta_by_rank: Mapped[list["AggHeroMetaByRank"]] = relationship(back_populates="patch")
    # meta_by_patch: Mapped[list["AggHeroMetaByPatch"]] = relationship(back_populates="patch")
    # recommendations: Mapped[list["AggRecommendationDaily"]] = relationship(back_populates="patch")

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<DimPatch id={self.id!r} label={self.label!r} "
            f"released_at={self.released_at} is_major={self.is_major}>"
        )
