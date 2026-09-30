"""
In-memory mock repository for patch data.
Mirrors /src/lib/mock/patches.ts exactly.
"""
from __future__ import annotations

from app.schemas.patch import Patch, PatchHeroChange, PatchImpact

MOCK_PATCHES: list[Patch] = [
    Patch(
        id="1.5", label="Patch 1.5", releasedAt="2024-11-15",
        summary="The Symbiote Surge", isMajor=True,
        notes=[
            "Venom receives a significant defensive buff, raising his win rate by ~4%.",
            "Storm kit reworked — aerial mobility increased, ultimate cooldown reduced.",
            "Iron Man nerfed: repulsor damage reduced 8%.",
            "Cloak & Dagger healing radius increased 15%.",
            "Map geometry adjustments to Yggsgard and Wakanda.",
        ],
        heroChanges=[
            PatchHeroChange(heroId="venom", heroName="Venom", changeType="buff",
                description="Bonus armor increased. Lethal Protector cooldown -2s.", winRateDelta=0.04),
            PatchHeroChange(heroId="storm", heroName="Storm", changeType="rework",
                description="New air dash ability. Omega Hurricane cooldown -20%.", winRateDelta=0.018),
            PatchHeroChange(heroId="iron-man", heroName="Iron Man", changeType="nerf",
                description="Repulsor damage -8%. Hover speed -10%.", winRateDelta=-0.024),
            PatchHeroChange(heroId="cloak-and-dagger", heroName="Cloak & Dagger", changeType="buff",
                description="Light of Hope healing radius +15%.", winRateDelta=0.004),
        ],
    ),
    Patch(
        id="1.4", label="Patch 1.4", releasedAt="2024-10-01",
        summary="Balance Pass — Supports & Tanks", isMajor=False,
        notes=[
            "Luna Snow ultimate duration increased 6s to 8s.",
            "Doctor Strange shield regeneration rate up.",
            "Hulk rage meter decays slower out of combat.",
            "Squirrel Girl damage reduced.",
            "Jeff the Land Shark gets faster repositioning passive.",
        ],
        heroChanges=[
            PatchHeroChange(heroId="luna-snow", heroName="Luna Snow", changeType="buff",
                description="Absolute Zero duration 6s -> 8s.", winRateDelta=0.014),
            PatchHeroChange(heroId="doctor-strange", heroName="Doctor Strange", changeType="buff",
                description="Shield regen rate +20%.", winRateDelta=0.003),
            PatchHeroChange(heroId="hulk", heroName="Hulk", changeType="buff",
                description="Rage decay out of combat -30%.", winRateDelta=0.002),
            PatchHeroChange(heroId="squirrel-girl", heroName="Squirrel Girl", changeType="nerf",
                description="All damage reduced 10%.", winRateDelta=-0.008),
            PatchHeroChange(heroId="jeff-the-land-shark", heroName="Jeff the Land Shark",
                changeType="buff", description="+15% speed while submerged.", winRateDelta=0.002),
        ],
    ),
    Patch(
        id="1.3", label="Patch 1.3", releasedAt="2024-08-20",
        summary="Duelist Meta Shake-Up", isMajor=True,
        notes=[
            "Psylocke psi-blade damage increased; ultimate tracking improved.",
            "Spider-Man wall-cling duration reduced.",
            "Moon Knight crescent dart spread tightened.",
            "Hawkeye arrow velocity increased.",
            "New map: Hall of Djalia (Domination).",
        ],
        heroChanges=[
            PatchHeroChange(heroId="psylocke", heroName="Psylocke", changeType="buff",
                description="Psi-blade +12%. Ultimate tracks after dash.", winRateDelta=0.016),
            PatchHeroChange(heroId="spider-man", heroName="Spider-Man", changeType="nerf",
                description="Wall-cling 3s -> 1.5s.", winRateDelta=-0.009),
            PatchHeroChange(heroId="moon-knight", heroName="Moon Knight", changeType="buff",
                description="Crescent dart spread -25%.", winRateDelta=0.006),
            PatchHeroChange(heroId="hawkeye", heroName="Hawkeye", changeType="buff",
                description="Arrow velocity +20%.", winRateDelta=0.01),
        ],
    ),
]

_PATCHES_CONT: list[Patch] = [
    Patch(
        id="1.2", label="Patch 1.2", releasedAt="2024-07-05",
        summary="Season 1 Mid-Season Tuning", isMajor=False,
        notes=[
            "Wolverine regen increased out of combat.",
            "Adam Warlock soul revive 0.5s faster.",
            "Black Panther daggers cooldown increased.",
            "Magneto metal shield speed increased.",
        ],
        heroChanges=[
            PatchHeroChange(heroId="wolverine", heroName="Wolverine", changeType="buff",
                description="Out-of-combat regen +25%.", winRateDelta=0.007),
            PatchHeroChange(heroId="adam-warlock", heroName="Adam Warlock", changeType="buff",
                description="Soul Bond revive delay -0.5s.", winRateDelta=0.006),
            PatchHeroChange(heroId="black-panther", heroName="Black Panther", changeType="nerf",
                description="Vibranium Daggers cooldown 6s -> 8s.", winRateDelta=-0.005),
            PatchHeroChange(heroId="magneto", heroName="Magneto", changeType="buff",
                description="Metal Barrage projectile speed +15%.", winRateDelta=0.001),
        ],
    ),
    Patch(
        id="1.1", label="Patch 1.1", releasedAt="2024-05-22",
        summary="Launch Hotfix & Early Balance", isMajor=False,
        notes=[
            "Bug fix: Doctor Strange portal boundary exploit.",
            "Cloak & Dagger dagger stab tuned down.",
            "Groot wall placement cooldown added.",
            "Performance improvements on Symbiotic Surface.",
        ],
        heroChanges=[
            PatchHeroChange(heroId="doctor-strange", heroName="Doctor Strange", changeType="nerf",
                description="Portal boundary exploit removed.", winRateDelta=0.007),
            PatchHeroChange(heroId="cloak-and-dagger", heroName="Cloak & Dagger", changeType="nerf",
                description="Dagger Stab damage -6%.", winRateDelta=-0.004),
            PatchHeroChange(heroId="groot", heroName="Groot", changeType="nerf",
                description="Wall re-placement cooldown 2s added.", winRateDelta=-0.003),
        ],
    ),
    Patch(
        id="1.0", label="Patch 1.0", releasedAt="2024-04-10",
        summary="Season 1 Launch", isMajor=True,
        notes=[
            "Marvel Rivals Season 1 launched with 30 heroes.",
            "8 maps available at launch.",
            "Ranked mode unlocked at account level 10.",
            "Initial roster balanced for 2-2-2 composition.",
        ],
        heroChanges=[],
    ),
]

MOCK_PATCHES.extend(_PATCHES_CONT)

_PATCHES_BY_ID: dict[str, Patch] = {p.id: p for p in MOCK_PATCHES}


def get_all_patches() -> list[Patch]:
    return MOCK_PATCHES


def get_patch_by_id(patch_id: str) -> Patch | None:
    return _PATCHES_BY_ID.get(patch_id)


def get_patch_impact(patch_id: str) -> PatchImpact | None:
    patch = _PATCHES_BY_ID.get(patch_id)
    if patch is None:
        return None
    return PatchImpact(
        patchId=patch.id,
        patchLabel=patch.label,
        releasedAt=patch.releasedAt,
        heroChanges=patch.heroChanges,
    )
