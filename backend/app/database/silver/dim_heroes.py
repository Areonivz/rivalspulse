"""
Silver layer — dim_heroes dimension table.

One row per hero in the game.  The primary key is the slug-style ID
(e.g. ``doctor-strange``) which matches the IDs used throughout the
mock data and frontend routing (``/heroes/[heroId]``).

Soft-delete via ``is_active``: heroes that are removed from the game
are flagged rather than deleted to preserve historical fact-table rows.
"""
from __future__ import annotations

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin
from app.database.enums import RoleEnum


class DimHero(TimestampMixin, Base):
    """
    ORM model for the ``dim_heroes`` table (silver layer).

    Dimension table — changes infrequently.  New heroes are inserted by
    the ingestion worker on first encounter; existing rows are updated
    if metadata (portrait URL, role reclassification) changes.
    """

    __tablename__ = "dim_heroes"

    __table_args__ = (
        # Role is the most common filter column on the /meta endpoint.
        sa.Index("ix_dim_heroes_role", "role"),
        # Soft-delete queries filter on is_active.
        sa.Index("ix_dim_heroes_is_active", "is_active"),
        {
            "comment": (
                "Silver dimension: one row per playable hero. "
                "Slug PKs match frontend routing and mock data IDs."
            )
        },
    )

    # ── Primary key ──────────────────────────────────────────────────────────
    id: Mapped[str] = mapped_column(
        sa.String(60),
        primary_key=True,
        comment=(
            "URL-safe slug identifier, e.g. 'doctor-strange'. "
            "Matches /heroes/[heroId] routing and mock data IDs."
        ),
    )

    # ── Descriptive attributes ───────────────────────────────────────────────
    name: Mapped[str] = mapped_column(
        sa.String(100),
        nullable=False,
        comment="Display name as shown in-game, e.g. 'Doctor Strange'.",
    )

    role: Mapped[RoleEnum] = mapped_column(
        sa.Enum(RoleEnum, name="role_enum", create_type=True),
        nullable=False,
        comment="Combat role: Vanguard, Duelist, or Strategist.",
    )

    portrait_url: Mapped[str | None] = mapped_column(
        sa.Text,
        nullable=True,
        comment=(
            "URL to the hero portrait image.  NULL during MVP 1-2; "
            "populated by the ingestion worker in MVP 3+."
        ),
    )

    # ── Lifecycle ─────────────────────────────────────────────────────────────
    is_active: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        default=True,
        server_default=sa.text("true"),
        comment=(
            "Soft-delete flag.  Set to false if a hero is removed from the "
            "game; historical fact rows are preserved."
        ),
    )

    # ── Relationships (back-populated from fact/agg tables) ──────────────────
    # Declared lazily to avoid circular import issues at module load time.
    # Uncomment these as the corresponding models are in place.
    #
    # daily_stats: Mapped[list["FactHeroDailyStat"]] = relationship(back_populates="hero")
    # meta_by_rank: Mapped[list["AggHeroMetaByRank"]] = relationship(back_populates="hero")
    # meta_by_map: Mapped[list["AggHeroMetaByMap"]] = relationship(back_populates="hero")
    # meta_by_patch: Mapped[list["AggHeroMetaByPatch"]] = relationship(back_populates="hero")
    # recommendations: Mapped[list["AggRecommendationDaily"]] = relationship(back_populates="hero")

    def __repr__(self) -> str:  # pragma: no cover
        return f"<DimHero id={self.id!r} name={self.name!r} role={self.role.value}>"
