"""
Router: /api/v1/patches
Provides patch history and per-patch hero impact data.
"""
from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.repositories.mock_patches import get_all_patches, get_patch_by_id, get_patch_impact
from app.schemas.patch import Patch, PatchImpact

router = APIRouter(prefix="/api/v1/patches", tags=["patches"])


@router.get(
    "",
    response_model=list[Patch],
    summary="List all patches newest-first",
)
def list_patches() -> list[Patch]:
    return get_all_patches()


@router.get(
    "/{patch_id}",
    response_model=Patch,
    summary="Get a single patch by ID",
)
def get_patch(patch_id: str) -> Patch:
    patch = get_patch_by_id(patch_id)
    if patch is None:
        raise HTTPException(status_code=404, detail=f"Patch '{patch_id}' not found.")
    return patch


@router.get(
    "/{patch_id}/impact",
    response_model=PatchImpact,
    summary="Get hero win-rate impact data for a specific patch (for PatchImpactBarChart)",
)
def get_impact(patch_id: str) -> PatchImpact:
    impact = get_patch_impact(patch_id)
    if impact is None:
        raise HTTPException(status_code=404, detail=f"Patch '{patch_id}' not found.")
    return impact
