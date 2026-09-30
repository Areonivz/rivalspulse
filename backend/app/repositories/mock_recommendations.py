"""
In-memory mock repository for recommendation data.
Mirrors /src/lib/mock/recommendations.ts exactly.
"""
from __future__ import annotations

from app.schemas.recommendation import Recommendation

MOCK_RECOMMENDATIONS: list[Recommendation] = [
    Recommendation(
        heroId="venom", heroName="Venom", role="Vanguard", tier="S",
        winRate=0.558, pickRate=0.221, mapWinRate=0.571, score=0.912,
        reasoning="Venom is the strongest Vanguard in patch 1.5 after his defensive buff. On Symbiotic Surface his win rate spikes to 57.1%.",
        synergyTip="Pair with Cloak & Dagger — Light of Hope keeps Venom in extended brawls.",
        counterTip="Watch for Hawkeye. Position behind cover on open sightlines.",
        rank="All Ranks", mapId="symbiotic-surface", mapName="Symbiotic Surface",
    ),
    Recommendation(
        heroId="doctor-strange", heroName="Doctor Strange", role="Vanguard", tier="S",
        winRate=0.556, pickRate=0.198, mapWinRate=0.561, score=0.897,
        reasoning="Doctor Strange dominates chokepoint maps at all rank bands. Portals enable rapid repositioning and his shield passive makes him hard to burst down.",
        synergyTip="Place portals to shortcut Luna Snow or Loki back to the front line.",
        counterTip="Namor and Hawkeye can burst through his shield. Prioritise cover.",
        rank="All Ranks", mapId="hydra-charteris-base", mapName="Hydra Charteris Base",
    ),
    Recommendation(
        heroId="hulk", heroName="Hulk", role="Vanguard", tier="A",
        winRate=0.531, pickRate=0.163, mapWinRate=0.548, score=0.849,
        reasoning="Hulk's rage mechanic rewards aggressive play. Tight corridors on Symbiotic Surface prevent kiting.",
        synergyTip="Adam Warlock's Soul Bond gives Hulk a free revive during a critical engage.",
        counterTip="Psylocke and Moon Knight kite Hulk in open spaces. Keep to corridors.",
        rank="All Ranks", mapId="symbiotic-surface", mapName="Symbiotic Surface",
    ),
    Recommendation(
        heroId="storm", heroName="Storm", role="Duelist", tier="S",
        winRate=0.551, pickRate=0.187, mapWinRate=0.563, score=0.908,
        reasoning="Storm's 1.5 rework made her the premier aerial Duelist. Yggsgard vertical mobility enables high-ground control and objective zoning.",
        synergyTip="Pair with Thor for Mjolnir+Lightning team-up zoning potential.",
        counterTip="Vulnerable to hitscan heroes when airborne. Save ult for grouped enemies.",
        rank="Diamond-Grandmaster", mapId="yggsgard", mapName="Yggsgard",
    ),
    Recommendation(
        heroId="hawkeye", heroName="Hawkeye", role="Duelist", tier="A",
        winRate=0.541, pickRate=0.172, mapWinRate=0.558, score=0.881,
        reasoning="Hawkeye is the most reliable Duelist on open maps. Royal Palace gives nearly uncontested sightlines.",
        synergyTip="Luna Snow's Absolute Zero slows enemies, giving Hawkeye easier precision shots.",
        counterTip="Doctor Strange and Magneto absorb arrows. Wait for their shields to drop.",
        rank="Diamond-Grandmaster", mapId="royal-palace", mapName="Royal Palace",
    ),
    Recommendation(
        heroId="psylocke", heroName="Psylocke", role="Duelist", tier="A",
        winRate=0.537, pickRate=0.159, mapWinRate=0.552, score=0.869,
        reasoning="Psylocke's 1.3 buff pushed her into A-tier. Tokyo 2099's vertical routes let her reach backline Strategists.",
        synergyTip="Cloak & Dagger provides poke support while Psylocke dives the backline.",
        counterTip="Captain America and Peni Parker disrupt her dive. Play around their CC cooldowns.",
        rank="Gold-Platinum", mapId="tokyo-2099", mapName="Tokyo 2099",
    ),
    Recommendation(
        heroId="luna-snow", heroName="Luna Snow", role="Strategist", tier="S",
        winRate=0.553, pickRate=0.214, mapWinRate=0.561, score=0.921,
        reasoning="Luna Snow is the best Strategist in the current meta. Absolute Zero stalls entire pushes while providing consistent healing.",
        synergyTip="Pair with Hawkeye or Storm — freeze the enemy and let your Duelists clean up.",
        counterTip="Hawkeye and Psylocke burst through her HP. Stay close to your tank.",
        rank="All Ranks", mapId="spider-islands", mapName="Spider-Islands",
    ),
    Recommendation(
        heroId="cloak-and-dagger", heroName="Cloak & Dagger", role="Strategist", tier="S",
        winRate=0.547, pickRate=0.201, mapWinRate=0.555, score=0.906,
        reasoning="Cloak & Dagger offer unmatched healing flexibility. On Wakanda they sustain a brawling composition indefinitely.",
        synergyTip="Pair with Venom for a near-unkillable frontline.",
        counterTip="Moon Knight area damage punishes Dagger in open spaces. Stay mobile.",
        rank="All Ranks", mapId="wakanda", mapName="Wakanda",
    ),
    Recommendation(
        heroId="loki", heroName="Loki", role="Strategist", tier="A",
        winRate=0.522, pickRate=0.133, mapWinRate=0.538, score=0.841,
        reasoning="Loki's decoy mechanics reward map awareness. Tokyo 2099 clones at side entrances force enemies to split focus.",
        synergyTip="Combine Loki's Astral Projection with Thor's Mjolnir for split-push pressure.",
        counterTip="Experienced enemies identify the real Loki quickly. Vary your positioning.",
        rank="Gold-Platinum", mapId="tokyo-2099", mapName="Tokyo 2099",
    ),
]


def get_all_recommendations(
    role: str | None = None,
    rank: str | None = None,
    map_id: str | None = None,
    limit: int = 3,
) -> list[Recommendation]:
    results = list(MOCK_RECOMMENDATIONS)
    if role:
        results = [r for r in results if r.role.lower() == role.lower()]
    if rank:
        results = [r for r in results if r.rank.lower() == rank.lower() or r.rank == "All Ranks"]
    if map_id:
        results = [r for r in results if r.mapId == map_id]
    results.sort(key=lambda r: r.score, reverse=True)
    return results[:limit]
