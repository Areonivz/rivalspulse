"""
Router: /api/v1/recommendations
Returns top-N hero recommendations, optionally filtered.
"""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Query

from app.repositories.mock_recommendations import get_all_recommendations
from app.schemas.hero import RankBand, Role
from app.schemas.recommendation import Recommendation

router = APIRouter(prefix="/api/v1/recommendations", tags=["recommendations"])


@router.get(
    "",
    response_model=list[Recommendation],
    summary="Get top hero recommendations (default top 3)",
)
def list_recommendations(
    role: Annotated[Role | None, Query(description="Filter by role")] = None,
    rank: Annotated[RankBand | None, Query(description="Filter by rank band")] = None,
    map_id: Annotated[str | None, Query(alias="mapId", description="Filter by map ID")] = None,
    limit: Annotated[int, Query(ge=1, le=10, description="Number of results to return")] = 3,
) -> list[Recommendation]:
    return get_all_recommendations(role=role, rank=rank, map_id=map_id, limit=limit)
