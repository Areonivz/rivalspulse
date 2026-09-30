"""
In-memory mock repository for hero data.
Mirrors /src/lib/mock/heroes.ts exactly, plus enriched mapStats per hero.
This is the sole data source for MVP 2.  Replace with DB repo in MVP 3+.
"""
from __future__ import annotations

from app.schemas.hero import HeroMapStat, HeroPatchHistory, HeroStats


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _ph(data: list[tuple[str, float, float]]) -> list[HeroPatchHistory]:
    return [HeroPatchHistory(patch=p, winRate=wr, pickRate=pr) for p, wr, pr in data]


_MAPS = [
    ("yggsgard",             "Yggsgard"),
    ("wakanda",              "Wakanda"),
    ("symbiotic-surface",    "Symbiotic Surface"),
    ("tokyo-2099",           "Tokyo 2099"),
    ("spider-islands",       "Spider-Islands"),
    ("hydra-charteris-base", "Hydra Charteris Base"),
    ("royal-palace",         "Royal Palace"),
    ("hall-of-djalia",       "Hall of Djalia"),
]


def _ms(base_wr: float, base_pr: float, adj: dict[str, float]) -> list[HeroMapStat]:
    """Build per-map HeroMapStat list with lightweight win-rate adjustments."""
    result: list[HeroMapStat] = []
    for map_id, map_name in _MAPS:
        delta = adj.get(map_id, 0.0)
        result.append(HeroMapStat(
            mapId=map_id,
            mapName=map_name,
            winRate=round(min(max(base_wr + delta, 0.35), 0.75), 3),
            pickRate=round(base_pr * (1.0 + delta * 0.5), 3),
            sampleSize=int(1800 + delta * 300),
        ))
    return result


# ---------------------------------------------------------------------------
# Vanguards (8)
# ---------------------------------------------------------------------------

_VANGUARDS: list[HeroStats] = [
    HeroStats(
        id="captain-america", name="Captain America", role="Vanguard", tier="A",
        winRate=0.523, pickRate=0.142, banRate=0.031, avgKda=2.41,
        patch="1.5", rankBand="All Ranks",
        synergies=["Iron Man", "Storm"],
        counters=["Wolverine", "Black Panther"],
        patchHistory=_ph([
            ("1.0",0.498,0.121),("1.1",0.507,0.128),("1.2",0.512,0.135),
            ("1.3",0.518,0.139),("1.4",0.520,0.141),("1.5",0.523,0.142),
        ]),
        mapStats=_ms(0.523,0.142,{"symbiotic-surface":0.031,"hydra-charteris-base":0.018,"yggsgard":-0.012,"royal-palace":0.005}),
    ),
    HeroStats(
        id="doctor-strange", name="Doctor Strange", role="Vanguard", tier="S",
        winRate=0.556, pickRate=0.198, banRate=0.112, avgKda=2.87,
        patch="1.5", rankBand="All Ranks",
        synergies=["Luna Snow", "Mantis"],
        counters=["Hawkeye", "Namor"],
        patchHistory=_ph([
            ("1.0",0.531,0.172),("1.1",0.538,0.179),("1.2",0.544,0.185),
            ("1.3",0.549,0.191),("1.4",0.552,0.195),("1.5",0.556,0.198),
        ]),
        mapStats=_ms(0.556,0.198,{"hydra-charteris-base":0.045,"symbiotic-surface":0.028,"yggsgard":-0.008,"spider-islands":0.011}),
    ),
    HeroStats(
        id="groot", name="Groot", role="Vanguard", tier="B",
        winRate=0.493, pickRate=0.089, banRate=0.018, avgKda=1.94,
        patch="1.5", rankBand="All Ranks",
        synergies=["Cloak & Dagger"],
        counters=["Iron Man", "Storm"],
        patchHistory=_ph([
            ("1.0",0.501,0.105),("1.1",0.498,0.099),("1.2",0.496,0.095),
            ("1.3",0.494,0.092),("1.4",0.493,0.090),("1.5",0.493,0.089),
        ]),
        mapStats=_ms(0.493,0.089,{"hydra-charteris-base":0.035,"symbiotic-surface":0.022,"yggsgard":-0.021,"hall-of-djalia":-0.018}),
    ),
    HeroStats(
        id="hulk", name="Hulk", role="Vanguard", tier="A",
        winRate=0.531, pickRate=0.163, banRate=0.045, avgKda=2.12,
        patch="1.5", rankBand="All Ranks",
        synergies=["Adam Warlock", "Loki"],
        counters=["Psylocke", "Moon Knight"],
        patchHistory=_ph([
            ("1.0",0.514,0.148),("1.1",0.518,0.152),("1.2",0.522,0.156),
            ("1.3",0.526,0.159),("1.4",0.529,0.161),("1.5",0.531,0.163),
        ]),
        mapStats=_ms(0.531,0.163,{"symbiotic-surface":0.048,"wakanda":0.019,"yggsgard":-0.015,"royal-palace":-0.022}),
    ),
    HeroStats(
        id="magneto", name="Magneto", role="Vanguard", tier="B",
        winRate=0.504, pickRate=0.112, banRate=0.027, avgKda=2.23,
        patch="1.5", rankBand="All Ranks",
        synergies=["Scarlet Witch", "Storm"],
        counters=["Iron Man", "Hawkeye"],
        patchHistory=_ph([
            ("1.0",0.499,0.108),("1.1",0.501,0.109),("1.2",0.502,0.110),
            ("1.3",0.503,0.111),("1.4",0.504,0.112),("1.5",0.504,0.112),
        ]),
        mapStats=_ms(0.504,0.112,{"royal-palace":0.024,"spider-islands":0.016,"hydra-charteris-base":-0.014,"symbiotic-surface":-0.009}),
    ),
    HeroStats(
        id="peni-parker", name="Peni Parker", role="Vanguard", tier="B",
        winRate=0.487, pickRate=0.073, banRate=0.012, avgKda=1.78,
        patch="1.5", rankBand="All Ranks",
        synergies=["Spider-Man", "Cloak & Dagger"],
        counters=["Iron Man", "Scarlet Witch"],
        patchHistory=_ph([
            ("1.0",0.492,0.079),("1.1",0.491,0.078),("1.2",0.490,0.077),
            ("1.3",0.489,0.075),("1.4",0.488,0.074),("1.5",0.487,0.073),
        ]),
        mapStats=_ms(0.487,0.073,{"tokyo-2099":0.038,"symbiotic-surface":0.021,"yggsgard":-0.019,"hall-of-djalia":-0.011}),
    ),
    HeroStats(
        id="thor", name="Thor", role="Vanguard", tier="A",
        winRate=0.527, pickRate=0.154, banRate=0.038, avgKda=2.34,
        patch="1.5", rankBand="All Ranks",
        synergies=["Loki", "Storm"],
        counters=["Iron Man", "Hawkeye"],
        patchHistory=_ph([
            ("1.0",0.509,0.138),("1.1",0.513,0.142),("1.2",0.517,0.146),
            ("1.3",0.521,0.149),("1.4",0.524,0.152),("1.5",0.527,0.154),
        ]),
        mapStats=_ms(0.527,0.154,{"yggsgard":0.041,"hall-of-djalia":0.028,"symbiotic-surface":-0.010,"hydra-charteris-base":-0.017}),
    ),
    HeroStats(
        id="venom", name="Venom", role="Vanguard", tier="S",
        winRate=0.558, pickRate=0.221, banRate=0.134, avgKda=2.96,
        patch="1.5", rankBand="All Ranks",
        synergies=["Cloak & Dagger", "Luna Snow"],
        counters=["Hawkeye", "Black Widow"],
        patchHistory=_ph([
            ("1.0",0.499,0.102),("1.1",0.508,0.119),("1.2",0.516,0.139),
            ("1.3",0.527,0.168),("1.4",0.518,0.189),("1.5",0.558,0.221),
        ]),
        mapStats=_ms(0.558,0.221,{"symbiotic-surface":0.071,"wakanda":0.033,"royal-palace":-0.018,"yggsgard":-0.024}),
    ),
]

# ---------------------------------------------------------------------------
# Duelists (16) — part 1: black-panther → moon-knight
# ---------------------------------------------------------------------------

_DUELISTS_1: list[HeroStats] = [
    HeroStats(
        id="black-panther", name="Black Panther", role="Duelist", tier="A",
        winRate=0.534, pickRate=0.148, banRate=0.067, avgKda=3.21,
        patch="1.5", rankBand="All Ranks",
        synergies=["Mantis", "Luna Snow"],
        counters=["Doctor Strange", "Peni Parker"],
        patchHistory=_ph([
            ("1.0",0.519,0.133),("1.1",0.523,0.137),("1.2",0.526,0.141),
            ("1.3",0.529,0.144),("1.4",0.531,0.146),("1.5",0.534,0.148),
        ]),
        mapStats=_ms(0.534,0.148,{"wakanda":0.052,"tokyo-2099":0.031,"spider-islands":-0.013,"royal-palace":-0.021}),
    ),
    HeroStats(
        id="black-widow", name="Black Widow", role="Duelist", tier="B",
        winRate=0.497, pickRate=0.081, banRate=0.014, avgKda=2.87,
        patch="1.5", rankBand="All Ranks",
        synergies=["Hawkeye", "Cloak & Dagger"],
        counters=["Doctor Strange", "Groot"],
        patchHistory=_ph([
            ("1.0",0.503,0.094),("1.1",0.501,0.091),("1.2",0.500,0.088),
            ("1.3",0.499,0.085),("1.4",0.498,0.083),("1.5",0.497,0.081),
        ]),
        mapStats=_ms(0.497,0.081,{"royal-palace":0.033,"yggsgard":0.022,"symbiotic-surface":-0.027,"hydra-charteris-base":-0.019}),
    ),
    HeroStats(
        id="hawkeye", name="Hawkeye", role="Duelist", tier="A",
        winRate=0.541, pickRate=0.172, banRate=0.089, avgKda=3.44,
        patch="1.5", rankBand="All Ranks",
        synergies=["Luna Snow", "Mantis"],
        counters=["Doctor Strange", "Magneto"],
        patchHistory=_ph([
            ("1.0",0.527,0.155),("1.1",0.531,0.159),("1.2",0.534,0.163),
            ("1.3",0.537,0.167),("1.4",0.539,0.170),("1.5",0.541,0.172),
        ]),
        mapStats=_ms(0.541,0.172,{"royal-palace":0.058,"yggsgard":0.044,"symbiotic-surface":-0.039,"hydra-charteris-base":-0.032}),
    ),
    HeroStats(
        id="iron-fist", name="Iron Fist", role="Duelist", tier="B",
        winRate=0.506, pickRate=0.094, banRate=0.021, avgKda=2.94,
        patch="1.5", rankBand="All Ranks",
        synergies=["Cloak & Dagger", "Adam Warlock"],
        counters=["Thor", "Hulk"],
        patchHistory=_ph([
            ("1.0",0.502,0.088),("1.1",0.503,0.090),("1.2",0.504,0.091),
            ("1.3",0.505,0.092),("1.4",0.505,0.093),("1.5",0.506,0.094),
        ]),
        mapStats=_ms(0.506,0.094,{"wakanda":0.034,"tokyo-2099":0.019,"royal-palace":-0.016,"spider-islands":-0.011}),
    ),
    HeroStats(
        id="iron-man", name="Iron Man", role="Duelist", tier="B",
        winRate=0.499, pickRate=0.136, banRate=0.058, avgKda=3.02,
        patch="1.5", rankBand="All Ranks",
        synergies=["Captain America", "Thor"],
        counters=["Magneto", "Storm"],
        patchHistory=_ph([
            ("1.0",0.524,0.162),("1.1",0.519,0.155),("1.2",0.515,0.149),
            ("1.3",0.510,0.144),("1.4",0.505,0.140),("1.5",0.499,0.136),
        ]),
        mapStats=_ms(0.499,0.136,{"yggsgard":0.051,"hall-of-djalia":0.039,"hydra-charteris-base":-0.044,"symbiotic-surface":-0.038}),
    ),
    HeroStats(
        id="mister-fantastic", name="Mister Fantastic", role="Duelist", tier="B",
        winRate=0.502, pickRate=0.087, banRate=0.016, avgKda=2.66,
        patch="1.5", rankBand="All Ranks",
        synergies=["Invisible Woman", "Doctor Strange"],
        counters=["Hawkeye", "Black Widow"],
        patchHistory=_ph([
            ("1.0",0.498,0.081),("1.1",0.499,0.083),("1.2",0.500,0.084),
            ("1.3",0.501,0.085),("1.4",0.502,0.086),("1.5",0.502,0.087),
        ]),
        mapStats=_ms(0.502,0.087,{"hydra-charteris-base":0.027,"symbiotic-surface":0.018,"yggsgard":-0.013,"spider-islands":-0.008}),
    ),
    HeroStats(
        id="moon-knight", name="Moon Knight", role="Duelist", tier="A",
        winRate=0.529, pickRate=0.147, banRate=0.054, avgKda=3.18,
        patch="1.5", rankBand="All Ranks",
        synergies=["Mantis", "Cloak & Dagger"],
        counters=["Doctor Strange", "Groot"],
        patchHistory=_ph([
            ("1.0",0.514,0.131),("1.1",0.517,0.134),("1.2",0.520,0.137),
            ("1.3",0.524,0.141),("1.4",0.527,0.144),("1.5",0.529,0.147),
        ]),
        mapStats=_ms(0.529,0.147,{"royal-palace":0.048,"spider-islands":0.031,"hydra-charteris-base":-0.028,"wakanda":-0.016}),
    ),
]

# ---------------------------------------------------------------------------
# Duelists (16) — part 2: namor → wolverine
# ---------------------------------------------------------------------------

_DUELISTS_2: list[HeroStats] = [
    HeroStats(
        id="namor", name="Namor", role="Duelist", tier="B",
        winRate=0.511, pickRate=0.098, banRate=0.029, avgKda=2.91,
        patch="1.5", rankBand="All Ranks",
        synergies=["Luna Snow", "Adam Warlock"],
        counters=["Thor", "Iron Man"],
        patchHistory=_ph([
            ("1.0",0.507,0.091),("1.1",0.508,0.093),("1.2",0.509,0.095),
            ("1.3",0.510,0.096),("1.4",0.511,0.097),("1.5",0.511,0.098),
        ]),
        mapStats=_ms(0.511,0.098,{"spider-islands":0.042,"symbiotic-surface":0.024,"yggsgard":-0.017,"hall-of-djalia":-0.009}),
    ),
    HeroStats(
        id="psylocke", name="Psylocke", role="Duelist", tier="A",
        winRate=0.537, pickRate=0.159, banRate=0.071, avgKda=3.37,
        patch="1.5", rankBand="All Ranks",
        synergies=["Cloak & Dagger", "Mantis"],
        counters=["Captain America", "Peni Parker"],
        patchHistory=_ph([
            ("1.0",0.514,0.131),("1.1",0.518,0.136),("1.2",0.522,0.141),
            ("1.3",0.531,0.151),("1.4",0.534,0.155),("1.5",0.537,0.159),
        ]),
        mapStats=_ms(0.537,0.159,{"tokyo-2099":0.055,"wakanda":0.029,"royal-palace":-0.018,"spider-islands":-0.012}),
    ),
    HeroStats(
        id="scarlet-witch", name="Scarlet Witch", role="Duelist", tier="B",
        winRate=0.509, pickRate=0.103, banRate=0.034, avgKda=2.78,
        patch="1.5", rankBand="All Ranks",
        synergies=["Magneto", "Doctor Strange"],
        counters=["Hawkeye", "Black Widow"],
        patchHistory=_ph([
            ("1.0",0.505,0.098),("1.1",0.506,0.100),("1.2",0.507,0.101),
            ("1.3",0.508,0.102),("1.4",0.508,0.102),("1.5",0.509,0.103),
        ]),
        mapStats=_ms(0.509,0.103,{"hall-of-djalia":0.033,"yggsgard":0.021,"symbiotic-surface":-0.019,"hydra-charteris-base":-0.014}),
    ),
    HeroStats(
        id="spider-man", name="Spider-Man", role="Duelist", tier="B",
        winRate=0.503, pickRate=0.117, banRate=0.043, avgKda=2.99,
        patch="1.5", rankBand="All Ranks",
        synergies=["Peni Parker", "Cloak & Dagger"],
        counters=["Hulk", "Captain America"],
        patchHistory=_ph([
            ("1.0",0.519,0.139),("1.1",0.515,0.133),("1.2",0.511,0.127),
            ("1.3",0.508,0.122),("1.4",0.505,0.119),("1.5",0.503,0.117),
        ]),
        mapStats=_ms(0.503,0.117,{"tokyo-2099":0.049,"spider-islands":0.037,"royal-palace":-0.014,"yggsgard":-0.009}),
    ),
    HeroStats(
        id="squirrel-girl", name="Squirrel Girl", role="Duelist", tier="C",
        winRate=0.481, pickRate=0.062, banRate=0.009, avgKda=2.44,
        patch="1.5", rankBand="All Ranks",
        synergies=["Loki", "Jeff the Land Shark"],
        counters=["Iron Man", "Storm"],
        patchHistory=_ph([
            ("1.0",0.496,0.077),("1.1",0.493,0.073),("1.2",0.490,0.070),
            ("1.3",0.488,0.068),("1.4",0.485,0.065),("1.5",0.481,0.062),
        ]),
        mapStats=_ms(0.481,0.062,{"spider-islands":0.029,"hydra-charteris-base":0.015,"yggsgard":-0.023,"hall-of-djalia":-0.017}),
    ),
    HeroStats(
        id="star-lord", name="Star-Lord", role="Duelist", tier="B",
        winRate=0.513, pickRate=0.119, banRate=0.037, avgKda=2.83,
        patch="1.5", rankBand="All Ranks",
        synergies=["Mantis", "Adam Warlock"],
        counters=["Doctor Strange", "Magneto"],
        patchHistory=_ph([
            ("1.0",0.508,0.113),("1.1",0.509,0.115),("1.2",0.510,0.116),
            ("1.3",0.511,0.117),("1.4",0.512,0.118),("1.5",0.513,0.119),
        ]),
        mapStats=_ms(0.513,0.119,{"yggsgard":0.038,"hall-of-djalia":0.023,"hydra-charteris-base":-0.022,"symbiotic-surface":-0.016}),
    ),
    HeroStats(
        id="storm", name="Storm", role="Duelist", tier="S",
        winRate=0.551, pickRate=0.187, banRate=0.097, avgKda=3.28,
        patch="1.5", rankBand="All Ranks",
        synergies=["Thor", "Magneto"],
        counters=["Hawkeye", "Black Widow"],
        patchHistory=_ph([
            ("1.0",0.498,0.103),("1.1",0.505,0.117),("1.2",0.514,0.139),
            ("1.3",0.533,0.161),("1.4",0.544,0.175),("1.5",0.551,0.187),
        ]),
        mapStats=_ms(0.551,0.187,{"yggsgard":0.063,"hall-of-djalia":0.048,"hydra-charteris-base":-0.045,"symbiotic-surface":-0.038}),
    ),
    HeroStats(
        id="winter-soldier", name="Winter Soldier", role="Duelist", tier="B",
        winRate=0.508, pickRate=0.101, banRate=0.022, avgKda=2.94,
        patch="1.5", rankBand="All Ranks",
        synergies=["Hawkeye", "Luna Snow"],
        counters=["Doctor Strange", "Hulk"],
        patchHistory=_ph([
            ("1.0",0.504,0.095),("1.1",0.505,0.097),("1.2",0.506,0.098),
            ("1.3",0.507,0.099),("1.4",0.507,0.100),("1.5",0.508,0.101),
        ]),
        mapStats=_ms(0.508,0.101,{"royal-palace":0.031,"wakanda":0.018,"tokyo-2099":-0.013,"spider-islands":-0.009}),
    ),
    HeroStats(
        id="wolverine", name="Wolverine", role="Duelist", tier="A",
        winRate=0.533, pickRate=0.144, banRate=0.063, avgKda=3.11,
        patch="1.5", rankBand="All Ranks",
        synergies=["Cloak & Dagger", "Mantis"],
        counters=["Thor", "Hulk"],
        patchHistory=_ph([
            ("1.0",0.518,0.128),("1.1",0.522,0.132),("1.2",0.525,0.136),
            ("1.3",0.528,0.139),("1.4",0.531,0.142),("1.5",0.533,0.144),
        ]),
        mapStats=_ms(0.533,0.144,{"wakanda":0.047,"symbiotic-surface":0.033,"yggsgard":-0.019,"royal-palace":-0.025}),
    ),
]


# ---------------------------------------------------------------------------
# Strategists (6)
# ---------------------------------------------------------------------------

_STRATEGISTS: list[HeroStats] = [
    HeroStats(
        id="adam-warlock", name="Adam Warlock", role="Strategist", tier="A",
        winRate=0.526, pickRate=0.139, banRate=0.047, avgKda=2.44,
        patch="1.5", rankBand="All Ranks",
        synergies=["Hulk", "Thor"],
        counters=["Hawkeye", "Black Widow"],
        patchHistory=_ph([
            ("1.0",0.511,0.124),("1.1",0.514,0.127),("1.2",0.517,0.131),
            ("1.3",0.520,0.134),("1.4",0.523,0.137),("1.5",0.526,0.139),
        ]),
        mapStats=_ms(0.526,0.139,{"spider-islands":0.034,"hall-of-djalia":0.021,"wakanda":-0.012,"symbiotic-surface":-0.008}),
    ),
    HeroStats(
        id="cloak-and-dagger", name="Cloak & Dagger", role="Strategist", tier="S",
        winRate=0.547, pickRate=0.201, banRate=0.119, avgKda=2.67,
        patch="1.5", rankBand="All Ranks",
        synergies=["Venom", "Spider-Man"],
        counters=["Hawkeye", "Moon Knight"],
        patchHistory=_ph([
            ("1.0",0.529,0.178),("1.1",0.533,0.183),("1.2",0.537,0.188),
            ("1.3",0.540,0.193),("1.4",0.543,0.197),("1.5",0.547,0.201),
        ]),
        mapStats=_ms(0.547,0.201,{"wakanda":0.041,"symbiotic-surface":0.028,"royal-palace":-0.017,"yggsgard":-0.013}),
    ),
    HeroStats(
        id="jeff-the-land-shark", name="Jeff the Land Shark", role="Strategist", tier="A",
        winRate=0.519, pickRate=0.127, banRate=0.041, avgKda=2.31,
        patch="1.5", rankBand="All Ranks",
        synergies=["Venom", "Hulk"],
        counters=["Hawkeye", "Psylocke"],
        patchHistory=_ph([
            ("1.0",0.504,0.111),("1.1",0.507,0.114),("1.2",0.511,0.118),
            ("1.3",0.514,0.121),("1.4",0.517,0.124),("1.5",0.519,0.127),
        ]),
        mapStats=_ms(0.519,0.127,{"symbiotic-surface":0.038,"hydra-charteris-base":0.022,"yggsgard":-0.016,"royal-palace":-0.011}),
    ),
    HeroStats(
        id="loki", name="Loki", role="Strategist", tier="A",
        winRate=0.522, pickRate=0.133, banRate=0.049, avgKda=2.58,
        patch="1.5", rankBand="All Ranks",
        synergies=["Thor", "Doctor Strange"],
        counters=["Psylocke", "Black Panther"],
        patchHistory=_ph([
            ("1.0",0.508,0.118),("1.1",0.511,0.121),("1.2",0.514,0.124),
            ("1.3",0.517,0.128),("1.4",0.519,0.131),("1.5",0.522,0.133),
        ]),
        mapStats=_ms(0.522,0.133,{"tokyo-2099":0.044,"spider-islands":0.027,"symbiotic-surface":-0.018,"wakanda":-0.012}),
    ),
    HeroStats(
        id="luna-snow", name="Luna Snow", role="Strategist", tier="S",
        winRate=0.553, pickRate=0.214, banRate=0.128, avgKda=2.79,
        patch="1.5", rankBand="All Ranks",
        synergies=["Doctor Strange", "Venom"],
        counters=["Hawkeye", "Psylocke"],
        patchHistory=_ph([
            ("1.0",0.535,0.192),("1.1",0.538,0.196),("1.2",0.542,0.201),
            ("1.3",0.545,0.206),("1.4",0.549,0.210),("1.5",0.553,0.214),
        ]),
        mapStats=_ms(0.553,0.214,{"spider-islands":0.056,"royal-palace":0.033,"wakanda":-0.014,"symbiotic-surface":-0.019}),
    ),
    HeroStats(
        id="mantis", name="Mantis", role="Strategist", tier="B",
        winRate=0.508, pickRate=0.108, banRate=0.028, avgKda=2.12,
        patch="1.5", rankBand="All Ranks",
        synergies=["Black Panther", "Hawkeye"],
        counters=["Psylocke", "Storm"],
        patchHistory=_ph([
            ("1.0",0.504,0.103),("1.1",0.505,0.104),("1.2",0.506,0.105),
            ("1.3",0.507,0.106),("1.4",0.507,0.107),("1.5",0.508,0.108),
        ]),
        mapStats=_ms(0.508,0.108,{"hall-of-djalia":0.029,"yggsgard":0.017,"symbiotic-surface":-0.016,"hydra-charteris-base":-0.011}),
    ),
]

# ---------------------------------------------------------------------------
# Combined roster + lookup index
# ---------------------------------------------------------------------------

MOCK_HEROES: list[HeroStats] = _VANGUARDS + _DUELISTS_1 + _DUELISTS_2 + _STRATEGISTS

_HEROES_BY_ID: dict[str, HeroStats] = {h.id: h for h in MOCK_HEROES}


def get_all_heroes() -> list[HeroStats]:
    return MOCK_HEROES


def get_hero_by_id(hero_id: str) -> HeroStats | None:
    return _HEROES_BY_ID.get(hero_id)


