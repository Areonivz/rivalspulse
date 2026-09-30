"""
Silver layer — dim_maps dimension table.

One row per playable map.  The primary key is the slug-style ID
(e.g. ``tokyo-2099``) matching the mock data IDs used across the codebase.

The ``game_mode`` column captures the objective type (Domination / Convoy /
Convergence) from the DB spec §8 to support future map-pool rotation tracking
(roadmap v4).
"""
from __future__ import annotations

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base, TimestampMixin
from app.database.enums import GameModeEnum


class DimMap(TimestampMixin, Base):
    """
    ORM model for the ``dim_maps`` table (silver layer).

    Dimension table — very low churn; new maps are inserted when the game
    adds them.  Deprecated maps are soft-deleted via ``is_active``.
    """

    __tablename__ = "dim_maps"

    __table_args__ = (
        # game_mode is used as a filter on map-selection UIs.
        sa.Index("ix_dim_maps_game_mode", "game_mode"),
        # Soft-delete queries filter on is_active.
        sa.Index("ix_dim_maps_is_active", "is_active"),
        {
            "comment": (
                "Silver dimension: one row per playable map. "
                "Slug PKs match mock data and API map IDs."
            )
        },
    )

    # ── Primary key ──────────────────────────────────────────────────────────
    id: Mapped[str] = mapped_column(
        sa.String(60),
        primary_key=True,
        comment=(
            "URL-safe slug identifier, e.g. 'tokyo-2099'. "
            "Matches mock data map IDs used across frontend and backend."
        ),
    )

    # ── Descriptive attributes ───────────────────────────────────────────────
    name: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="Display name as shown in-game, e.g. 'Tokyo 2099'.",
    )

    game_mode: Mapped[GameModeEnum] = mapped_column(
        sa.Enum(GameModeEnum, name="game_mode_enum", create_type=True),
        nullable=False,
        comment="Objective type: Domination, Convoy, or Convergence.",
    )

    # ── Lifecycle ─────────────────────────────────────────────────────────────
    is_active: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        default=True,
        server_default=sa.text("true"),
        comment=(
            "Soft-delete flag.  Set to false when a map is rotated out of "
            "the competitive pool; historical agg rows are preserved."
        ),
    )

    # ── Relationships ────────────────────────────────────────────────────────
    # meta_by_map: Mapped[list["AggHeroMetaByMap"]] = relationship(back_populates="map")
    # recommendations: Mapped[list["AggRecommendationDaily"]] = relationship(back_populates="map")

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<DimMap id={self.id!r} name={self.name!r} "
            f"game_mode={self.game_mode.value}>"
        )
