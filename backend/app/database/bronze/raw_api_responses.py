"""
Bronze layer — raw_api_responses table.

Stores every raw JSON payload received from MarvelRivalsAPI.com without any
transformation.  Nothing is ever deleted from this table; it is the permanent
audit log and re-processing source for the silver transform pipeline.

Privacy guarantee
-----------------
The ingestion worker MUST aggregate away all player-level UIDs before writing
to this table.  Only aggregate endpoint payloads (hero win/pick rates, map
stats, patch data) should be captured here.  See spec §11.

Lineage flow
------------
    MarvelRivalsAPI.com
        → ingestion worker (aggregate endpoints only, no player UIDs)
        → raw_api_responses  (bronze)
        → fact_hero_daily_stats  (silver)  [raw_response_id FK]
        → agg_* tables  (gold)
"""
from __future__ import annotations

from datetime import datetime

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.database.enums import LayerNameEnum


class RawApiResponse(Base):
    """
    ORM model for the ``raw_api_responses`` table (bronze layer).

    One row per API response payload ingested from MarvelRivalsAPI.com.
    The ``checksum`` column (SHA-256 of the raw ``payload``) enforces
    idempotency so re-running an ingestion job never duplicates rows.
    """

    __tablename__ = "raw_api_responses"

    __table_args__ = (
        # Idempotency: the same payload bytes must never be stored twice.
        sa.UniqueConstraint("checksum", name="uq_raw_api_responses_checksum"),
        # Composite index for the silver-transform worker query:
        #   WHERE processed = false AND source_endpoint = ?
        sa.Index(
            "ix_raw_api_responses_endpoint_processed",
            "source_endpoint",
            "processed",
        ),
        # Index for patch-scoped queries (re-processing a specific patch).
        sa.Index(
            "ix_raw_api_responses_patch_label",
            "api_patch_label",
        ),
        # Index for the ingested_at column for time-range scans.
        sa.Index(
            "ix_raw_api_responses_ingested_at",
            "ingested_at",
        ),
        {
            "comment": (
                "Bronze layer: immutable log of every raw API response ingested "
                "from MarvelRivalsAPI.com.  Aggregate payloads only — no player UIDs."
            )
        },
    )

    # ── Primary key ──────────────────────────────────────────────────────────
    id: Mapped[int] = mapped_column(
        sa.BigInteger,
        primary_key=True,
        autoincrement=True,
        comment="Surrogate primary key (auto-increment BigInt for bulk-insert efficiency).",
    )

    # ── Source metadata ──────────────────────────────────────────────────────
    source_endpoint: Mapped[str] = mapped_column(
        sa.String(255),
        nullable=False,
        comment=(
            "The API endpoint path that produced this payload, "
            "e.g. '/v1/stats/heroes' or '/v1/maps/stats'."
        ),
    )

    api_patch_label: Mapped[str | None] = mapped_column(
        sa.String(20),
        nullable=True,
        comment=(
            "Patch label extracted from the API response before normalisation, "
            "e.g. '1.5'.  NULL if the endpoint does not carry patch context."
        ),
    )

    layer: Mapped[LayerNameEnum] = mapped_column(
        sa.Enum(LayerNameEnum, name="layer_name_enum", create_type=True),
        nullable=False,
        default=LayerNameEnum.bronze,
        server_default=sa.text("'bronze'"),
        comment="Medallion layer that produced this record — always 'bronze' for this table.",
    )

    # ── Payload ───────────────────────────────────────────────────────────────
    payload: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        comment="Full raw API response body stored as JSONB for efficient querying.",
    )

    checksum: Mapped[str] = mapped_column(
        sa.String(64),
        nullable=False,
        comment=(
            "SHA-256 hex digest of the serialised payload bytes. "
            "Used for idempotent ingestion — duplicate payloads are rejected."
        ),
    )

    # ── Processing state ─────────────────────────────────────────────────────
    processed: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        default=False,
        server_default=sa.text("false"),
        comment=(
            "False until the silver transform worker has successfully consumed "
            "this row and written to fact_hero_daily_stats."
        ),
    )

    processing_error: Mapped[str | None] = mapped_column(
        sa.Text,
        nullable=True,
        comment=(
            "Stores the exception message / traceback if the silver transform "
            "fails for this row.  NULL means no error."
        ),
    )

    # ── Timestamps ───────────────────────────────────────────────────────────
    ingested_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now(),
        comment="UTC timestamp at which this row was inserted by the ingestion worker.",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return (
            f"<RawApiResponse id={self.id} "
            f"endpoint={self.source_endpoint!r} "
            f"patch={self.api_patch_label!r} "
            f"processed={self.processed}>"
        )
