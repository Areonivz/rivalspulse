"""
SQLAlchemy declarative base and shared mixins.

All ORM model classes across bronze / silver / gold layers inherit from:
  - Base          : the shared DeclarativeBase (single MetaData instance)
  - TimestampMixin: auto-managed created_at / updated_at columns

Usage
-----
    from app.database.base import Base, TimestampMixin

    class MyModel(TimestampMixin, Base):
        __tablename__ = "my_table"
        ...
"""
from __future__ import annotations

from datetime import datetime, timezone

import sqlalchemy as sa
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


# ---------------------------------------------------------------------------
# Single shared metadata / declarative base
# ---------------------------------------------------------------------------

class Base(DeclarativeBase):
    """
    Project-wide SQLAlchemy declarative base.

    A single Base (and therefore a single MetaData) ensures Alembic can
    discover all tables via `target_metadata = Base.metadata` without
    any manual imports.
    """
    pass


# ---------------------------------------------------------------------------
# Reusable timestamp mixin
# ---------------------------------------------------------------------------

class TimestampMixin:
    """
    Adds created_at and updated_at columns to any model that inherits it.

    - created_at: set once at INSERT time via server_default.
    - updated_at: set at INSERT and refreshed on every UPDATE via
      server_default + onupdate.  Both use TIMESTAMPTZ (timezone-aware).
    """

    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        nullable=False,
        comment="Row creation timestamp (UTC, set by the database).",
    )

    updated_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        server_default=sa.func.now(),
        onupdate=sa.func.now(),
        nullable=False,
        comment="Row last-modified timestamp (UTC, refreshed on every UPDATE).",
    )
