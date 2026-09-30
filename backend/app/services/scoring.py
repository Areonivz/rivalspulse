"""
Recommendation scoring engine — Python implementation.

Formula (spec §10, extended with playstyle component):
    score = (0.45 * norm_win_rate)
          + (0.20 * norm_pick_rate)
          + (0.15 * norm_trend)
          + (0.10 * norm_map_fit)
          + (0.10 * norm_playstyle)

All five signals are min-max normalised relative to the candidate pool before
weighting, so the final score is always in [0, 1].

Only heroes with sample_size >= MIN_SAMPLE_SIZE are eligible (spec §10).
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field
from typing import Literal

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

MIN_SAMPLE_SIZE = 500

WEIGHTS = {
    "win_rate": 0.45,
    "pick_rate": 0.20,
    "trend": 0.15,
    "map_fit": 0.10,
    "playstyle": 0.10,
}

Playstyle = Literal["Aggressive", "Defensive", "Balanced"]

# ---------------------------------------------------------------------------
# Map affinity table (hero-id -> delta win-rate boost on that map)
# ---------------------------------------------------------------------------

MAP_AFFINITIES: dict[str, dict[str, float]] = {
    "yggsgard": {
        "storm": 0.062, "iron-man": 0.054, "hawkeye": 0.048,
        "black-widow": 0.038, "thor": 0.031, "moon-knight": 0.025,
        "doctor-strange": 0.012, "captain-america": 0.008,
        "hulk": -0.018, "groot": -0.024, "peni-parker": -0.031,
        "venom": -0.015, "magneto": -0.012, "spider-man": 0.022,
        "psylocke": 0.019, "iron-fist": -0.028, "wolverine": -0.022,
        "luna-snow": 0.014, "cloak-and-dagger": 0.009, "loki": 0.006,
        "mantis": 0.004, "adam-warlock": 0.002, "jeff-the-land-shark": -0.008,
    },
    "wakanda": {
        "black-panther": 0.067, "wolverine": 0.058, "iron-fist": 0.052,
        "venom": 0.044, "hulk": 0.038, "cloak-and-dagger": 0.041,
        "captain-america": 0.028, "thor": 0.021, "spider-man": 0.031,
        "storm": -0.031, "iron-man": -0.026, "hawkeye": -0.018,
        "black-widow": -0.014, "moon-knight": -0.009, "doctor-strange": 0.018,
        "groot": 0.022, "namor": -0.012, "luna-snow": 0.016,
        "adam-warlock": 0.012, "loki": 0.008, "mantis": 0.006,
        "peni-parker": 0.014, "magneto": 0.009,
    },
    "symbiotic-surface": {
        "venom": 0.071, "hulk": 0.059, "groot": 0.048,
        "captain-america": 0.038, "thor": 0.031, "iron-fist": 0.041,
        "doctor-strange": 0.034, "wolverine": 0.027, "magneto": 0.022,
        "peni-parker": 0.019, "storm": -0.038, "iron-man": -0.031,
        "hawkeye": -0.024, "black-widow": -0.019, "black-panther": 0.012,
        "spider-man": 0.008, "cloak-and-dagger": 0.028, "adam-warlock": 0.018,
        "luna-snow": 0.012, "namor": -0.016, "scarlet-witch": 0.014,
        "mantis": 0.008, "jeff-the-land-shark": 0.011,
    },
    "tokyo-2099": {
        "psylocke": 0.064, "spider-man": 0.058, "loki": 0.047,
        "black-panther": 0.038, "iron-fist": 0.034, "storm": 0.029,
        "wolverine": 0.022, "venom": 0.018, "iron-man": 0.016,
        "captain-america": 0.012, "cloak-and-dagger": 0.021, "mantis": 0.014,
        "hawkeye": -0.012, "black-widow": -0.008, "hulk": -0.019,
        "groot": -0.024, "peni-parker": -0.014, "doctor-strange": 0.008,
        "namor": 0.012, "luna-snow": 0.018, "adam-warlock": 0.009,
        "magneto": -0.006, "squirrel-girl": 0.014,
    },
    "spider-islands": {
        "luna-snow": 0.061, "loki": 0.054, "spider-man": 0.048,
        "storm": 0.041, "black-widow": 0.036, "iron-man": 0.031,
        "hawkeye": 0.024, "cloak-and-dagger": 0.028, "jeff-the-land-shark": 0.018,
        "mantis": 0.016, "doctor-strange": -0.008, "groot": -0.022,
        "venom": -0.014, "hulk": -0.019, "magneto": -0.016,
        "captain-america": -0.006, "peni-parker": -0.018, "thor": 0.008,
        "psylocke": 0.019, "adam-warlock": 0.014, "wolverine": 0.011,
        "black-panther": 0.009, "scarlet-witch": 0.016,
    },
    "hydra-charteris-base": {
        "doctor-strange": 0.068, "groot": 0.056, "magneto": 0.044,
        "captain-america": 0.038, "peni-parker": 0.031, "thor": 0.026,
        "venom": 0.022, "hulk": 0.018, "wolverine": 0.014, "iron-fist": 0.012,
        "storm": -0.046, "iron-man": -0.038, "hawkeye": -0.028,
        "black-widow": -0.022, "psylocke": 0.009, "luna-snow": 0.016,
        "cloak-and-dagger": 0.024, "loki": -0.004, "adam-warlock": 0.012,
        "namor": 0.008, "mantis": 0.009, "moon-knight": -0.014,
        "jeff-the-land-shark": 0.006,
    },
    "royal-palace": {
        "hawkeye": 0.066, "moon-knight": 0.058, "black-widow": 0.048,
        "iron-man": 0.038, "namor": 0.034, "star-lord": 0.028,
        "storm": 0.021, "winter-soldier": 0.024, "doctor-strange": 0.016,
        "luna-snow": 0.018, "mantis": 0.014, "iron-fist": -0.032,
        "black-panther": -0.024, "wolverine": -0.019, "spider-man": -0.014,
        "venom": -0.018, "hulk": -0.022, "groot": -0.028,
        "captain-america": 0.008, "thor": 0.011, "cloak-and-dagger": 0.014,
        "loki": 0.012, "adam-warlock": 0.009,
    },
    "hall-of-djalia": {
        "storm": 0.059, "iron-man": 0.051, "luna-snow": 0.044,
        "cloak-and-dagger": 0.038, "loki": 0.031, "adam-warlock": 0.028,
        "doctor-strange": 0.024, "thor": 0.019, "hawkeye": 0.016,
        "mantis": 0.022, "jeff-the-land-shark": 0.018, "groot": -0.014,
        "peni-parker": -0.018, "hulk": -0.012, "venom": -0.009,
        "iron-fist": -0.024, "wolverine": -0.016, "black-panther": -0.008,
        "captain-america": 0.006, "psylocke": 0.014, "spider-man": 0.012,
        "scarlet-witch": 0.021, "magneto": 0.008,
    },
}

# ---------------------------------------------------------------------------
# Playstyle affinity table
# ---------------------------------------------------------------------------

PLAYSTYLE_AFFINITIES: dict[str, dict[str, float]] = {
    "Aggressive": {
        "black-panther": 0.90, "psylocke": 0.88, "iron-fist": 0.85,
        "wolverine": 0.82, "spider-man": 0.80, "storm": 0.78, "venom": 0.76,
        "thor": 0.72, "hulk": 0.70, "iron-man": 0.68, "star-lord": 0.65,
        "winter-soldier": 0.62, "hawkeye": 0.60, "moon-knight": 0.58,
        "captain-america": 0.55, "black-widow": 0.52, "groot": 0.40,
        "doctor-strange": 0.42, "namor": 0.48, "magneto": 0.38,
        "peni-parker": 0.30, "scarlet-witch": 0.58, "squirrel-girl": 0.45,
        "mister-fantastic": 0.44, "luna-snow": 0.30, "cloak-and-dagger": 0.28,
        "loki": 0.35, "jeff-the-land-shark": 0.32, "mantis": 0.28,
        "adam-warlock": 0.25,
    },
    "Defensive": {
        "doctor-strange": 0.92, "groot": 0.88, "magneto": 0.85,
        "peni-parker": 0.82, "captain-america": 0.78, "thor": 0.72,
        "venom": 0.68, "hulk": 0.65, "adam-warlock": 0.90,
        "cloak-and-dagger": 0.88, "luna-snow": 0.86, "jeff-the-land-shark": 0.82,
        "loki": 0.78, "mantis": 0.75, "iron-fist": 0.30, "black-panther": 0.25,
        "psylocke": 0.28, "wolverine": 0.30, "spider-man": 0.32, "storm": 0.35,
        "hawkeye": 0.38, "black-widow": 0.36, "moon-knight": 0.35,
        "iron-man": 0.40, "star-lord": 0.38, "winter-soldier": 0.36,
        "namor": 0.45, "scarlet-witch": 0.42, "squirrel-girl": 0.50,
        "mister-fantastic": 0.48,
    },
    "Balanced": {},
}

# ---------------------------------------------------------------------------
# Data structures
# ---------------------------------------------------------------------------


@dataclass
class HeroCandidate:
    """Raw data for one hero pulled from DB / mock data, before normalisation."""
    hero_id: str
    name: str
    role: str                # "Vanguard" | "Duelist" | "Strategist"
    win_rate: float          # 0..1
    pick_rate: float         # 0..1
    ban_rate: float          # 0..1
    avg_kda: float
    sample_size: int
    # Prior-patch win rate for trend; None if first patch seen
    prev_win_rate: float | None = None


@dataclass
class ScoreBreakdown:
    """Per-signal normalised scores (0..1 each)."""
    win_rate: float
    pick_rate: float
    trend: float
    map_fit: float
    playstyle: float


@dataclass
class ScoredCandidate:
    """HeroCandidate enriched with score and derived metadata."""
    hero_id: str
    name: str
    role: str
    win_rate: float
    pick_rate: float
    ban_rate: float
    avg_kda: float
    score: float
    tier: str                # "S" | "A" | "B" | "C"
    breakdown: ScoreBreakdown
    synergies: list[str] = field(default_factory=list)
    counters: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Signal extractors (raw, un-normalised values)
# ---------------------------------------------------------------------------

def _raw_trend(hero_id: str, c: HeroCandidate) -> float:
    """Trend = delta win rate vs previous patch, clamped to [-0.15, +0.15]."""
    if c.prev_win_rate is None:
        return 0.0
    return max(-0.15, min(0.15, c.win_rate - c.prev_win_rate))


def _raw_map_fit(hero_id: str, map_id: str | None) -> float:
    """Map-fit = affinity bonus from MAP_AFFINITIES, or 0 if map unknown."""
    if not map_id:
        return 0.0
    return MAP_AFFINITIES.get(map_id, {}).get(hero_id, 0.0)


def _raw_playstyle(hero_id: str, playstyle: str | None) -> float:
    """Playstyle affinity in [0, 1]; 0.5 for Balanced or unknown hero."""
    if not playstyle or playstyle == "Balanced":
        return 0.5
    return PLAYSTYLE_AFFINITIES.get(playstyle, {}).get(hero_id, 0.5)


# ---------------------------------------------------------------------------
# Min-max normalisation
# ---------------------------------------------------------------------------

def _min_max_normalise(values: list[float]) -> list[float]:
    """Normalise a list of floats into [0, 1].  Flat lists → all 0.5."""
    lo, hi = min(values), max(values)
    spread = hi - lo
    if spread < 1e-9:
        return [0.5] * len(values)
    return [(v - lo) / spread for v in values]


# ---------------------------------------------------------------------------
# Tier assignment
# ---------------------------------------------------------------------------

def compute_tier(score: float) -> str:
    """Map a [0,1] composite score to a tier label."""
    if score >= 0.80:
        return "S"
    if score >= 0.65:
        return "A"
    if score >= 0.50:
        return "B"
    return "C"


# ---------------------------------------------------------------------------
# Main scoring function
# ---------------------------------------------------------------------------

def score_heroes(
    candidates: list[HeroCandidate],
    *,
    role: str | None = None,
    map_id: str | None = None,
    playstyle: str | None = None,
    top_n: int = 3,
) -> list[ScoredCandidate]:
    """
    Score *candidates* against the five-signal formula and return the top-N.

    Filtering by role and minimum sample size is applied first.
    All five signal vectors are min-max normalised within the filtered pool.
    """
    # 1. Filter: role + minimum sample size
    pool = [
        c for c in candidates
        if c.sample_size >= MIN_SAMPLE_SIZE
        and (role is None or c.role.lower() == role.lower())
    ]
    if not pool:
        return []

    # 2. Compute raw signal vectors
    raw_wr   = [c.win_rate                          for c in pool]
    raw_pr   = [c.pick_rate                         for c in pool]
    raw_tr   = [_raw_trend(c.hero_id, c)            for c in pool]
    raw_mf   = [_raw_map_fit(c.hero_id, map_id)     for c in pool]
    raw_ps   = [_raw_playstyle(c.hero_id, playstyle) for c in pool]

    # 3. Normalise each vector
    norm_wr = _min_max_normalise(raw_wr)
    norm_pr = _min_max_normalise(raw_pr)
    norm_tr = _min_max_normalise(raw_tr)
    norm_mf = _min_max_normalise(raw_mf)
    norm_ps = _min_max_normalise(raw_ps)

    # 4. Weight and sum
    scored: list[ScoredCandidate] = []
    for i, c in enumerate(pool):
        composite = (
            WEIGHTS["win_rate"]  * norm_wr[i]
            + WEIGHTS["pick_rate"] * norm_pr[i]
            + WEIGHTS["trend"]     * norm_tr[i]
            + WEIGHTS["map_fit"]   * norm_mf[i]
            + WEIGHTS["playstyle"] * norm_ps[i]
        )
        scored.append(ScoredCandidate(
            hero_id=c.hero_id, name=c.name, role=c.role,
            win_rate=c.win_rate, pick_rate=c.pick_rate,
            ban_rate=c.ban_rate, avg_kda=c.avg_kda,
            score=round(composite, 4),
            tier=compute_tier(composite),
            breakdown=ScoreBreakdown(
                win_rate=round(norm_wr[i], 4),
                pick_rate=round(norm_pr[i], 4),
                trend=round(norm_tr[i], 4),
                map_fit=round(norm_mf[i], 4),
                playstyle=round(norm_ps[i], 4),
            ),
        ))

    scored.sort(key=lambda s: s.score, reverse=True)
    return scored[:top_n]


# ---------------------------------------------------------------------------
# Role-level stats helper
# ---------------------------------------------------------------------------

def compute_role_stats(
    candidates: list[HeroCandidate],
) -> dict[str, dict[str, float]]:
    """
    Compute average win_rate and pick_rate per role.

    Returns: {"Vanguard": {"avg_win_rate": ..., "avg_pick_rate": ..., "count": ...}, ...}
    """
    buckets: dict[str, list[HeroCandidate]] = {}
    for c in candidates:
        buckets.setdefault(c.role, []).append(c)
    out: dict[str, dict[str, float]] = {}
    for role, group in buckets.items():
        out[role] = {
            "avg_win_rate": sum(c.win_rate for c in group) / len(group),
            "avg_pick_rate": sum(c.pick_rate for c in group) / len(group),
            "count": float(len(group)),
        }
    return out
