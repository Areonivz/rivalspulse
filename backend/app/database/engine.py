"""
Async SQLAlchemy engine and session factory.

Usage
-----
Inject `get_async_session` as a FastAPI dependency:

    from app.database.engine import get_async_session
    from sqlalchemy.ext.asyncio import AsyncSession

    @router.get("/example")
    async def example(session: AsyncSession = Depends(get_async_session)):
        result = await session.execute(select(DimHero))
        ...

Direct usage (e.g. in background tasks / scripts):

    from app.database.engine import async_session_factory
    async with async_session_factory() as session:
        ...
"""
from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import settings

# ---------------------------------------------------------------------------
# Engine
# ---------------------------------------------------------------------------

engine = create_async_engine(
    settings.database_url,
    # Pool settings tuned for a single-instance API server.
    # Adjust pool_size / max_overflow for higher concurrency in MVP 4+.
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,          # reconnect on stale connections
    pool_recycle=3600,           # recycle connections after 1 hour
    echo=settings.app_env == "development",  # SQL logging in dev only
    future=True,
)

# ---------------------------------------------------------------------------
# Session factory
# ---------------------------------------------------------------------------

async_session_factory: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,  # avoids lazy-load errors after commit in async context
    autoflush=False,
    autocommit=False,
)


# ---------------------------------------------------------------------------
# FastAPI dependency
# ---------------------------------------------------------------------------

async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Async context-managed session for use as a FastAPI dependency.

    Yields a single AsyncSession per request and ensures it is closed
    (and rolled back on exception) when the request finishes.
    """
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
