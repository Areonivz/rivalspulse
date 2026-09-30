"""
Pydantic v2 schemas for patch-related responses.
Mirrors TypeScript interfaces in /src/lib/types/patch.ts.
"""
from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, ConfigDict


ChangeType = Literal["buff", "nerf", "rework", "new"]


class PatchHeroChange(BaseModel):
    """Mirrors TypeScript PatchHeroChange."""

    model_config = ConfigDict(populate_by_name=True)

    heroId: str
    heroName: str
    changeType: ChangeType
    description: str
    winRateDelta: float


class Patch(BaseModel):
    """Mirrors TypeScript Patch."""

    model_config = ConfigDict(populate_by_name=True)

    id: str
    label: str
    releasedAt: str          # ISO date string, e.g. "2024-11-15"
    summary: str
    notes: list[str]
    isMajor: bool
    heroChanges: list[PatchHeroChange]


class PatchImpact(BaseModel):
    """
    Convenience response shape for GET /api/v1/patches/{patch_id}/impact.
    Returns the patch header together with an explicit impact list that
    the front-end PatchImpactBarChart can consume directly.
    """

    model_config = ConfigDict(populate_by_name=True)

    patchId: str
    patchLabel: str
    releasedAt: str
    heroChanges: list[PatchHeroChange]
