import type { HeroStats, Role } from "@/lib/types/hero";
import { MAP_HERO_AFFINITIES } from "@/lib/mock/mapHeroAffinities";

export type Playstyle = "Aggressive" | "Defensive" | "Balanced";

/** Weights must sum to 1.0 */
export const SCORE_WEIGHTS = {
  winRate: 0.45,
  pickRate: 0.20,
  trendScore: 0.15,
  mapScore: 0.10,
  roleBalanceScore: 0.10,
} as const;

export interface ScoreBreakdown {
  rawWinRate: number;
  rawPickRate: number;
  rawTrendScore: number;
  rawMapScore: number;
  rawRoleBalanceScore: number;
  normWinRate: number;
  normPickRate: number;
  normTrendScore: number;
  normMapScore: number;
  normRoleBalanceScore: number;
  weightedWinRate: number;
  weightedPickRate: number;
  weightedTrendScore: number;
  weightedMapScore: number;
  weightedRoleBalanceScore: number;
  finalScore: number;
}

export interface ScoredHero {
  hero: HeroStats;
  score: number;
  breakdown: ScoreBreakdown;
  confidence: "High" | "Medium" | "Low";
  reasons: string[];
}

function computeTrendScore(hero: HeroStats): number {
  const history = hero.patchHistory;
  if (!history || history.length < 2) return 0.5;
  const latest = history[history.length - 1].winRate;
  const prev = history[history.length - 2].winRate;
  const delta = latest - prev;
  return Math.min(1, Math.max(0, (delta + 0.05) / 0.1));
}

function computeMapScore(heroId: string, mapId: string): number {
  if (!mapId) return 0.5;
  const affinities = MAP_HERO_AFFINITIES[mapId];
  if (!affinities) return 0.5;
  const modifier = affinities[heroId] ?? 0;
  return Math.min(1, Math.max(0, (modifier + 0.07) / 0.14));
}

const PLAYSTYLE_AFFINITIES: Record<Playstyle, Partial<Record<string, number>>> = {
  Aggressive: {
    "black-panther": 0.9, "psylocke": 0.88, "iron-fist": 0.85, "wolverine": 0.82,
    "spider-man": 0.80, "storm": 0.78, "venom": 0.76, "thor": 0.72, "hulk": 0.70,
    "iron-man": 0.68, "star-lord": 0.65, "winter-soldier": 0.62, "hawkeye": 0.60,
    "moon-knight": 0.58, "captain-america": 0.55, "black-widow": 0.52,
    "groot": 0.40, "doctor-strange": 0.42, "namor": 0.48, "magneto": 0.38,
    "peni-parker": 0.30, "scarlet-witch": 0.58, "squirrel-girl": 0.45,
    "mister-fantastic": 0.44, "luna-snow": 0.30, "cloak-and-dagger": 0.28,
    "loki": 0.35, "jeff-the-land-shark": 0.32, "mantis": 0.28, "adam-warlock": 0.25,
  },
  Defensive: {
    "doctor-strange": 0.92, "groot": 0.88, "magneto": 0.85, "peni-parker": 0.82,
    "captain-america": 0.78, "thor": 0.72, "venom": 0.68, "hulk": 0.65,
    "adam-warlock": 0.90, "cloak-and-dagger": 0.88, "luna-snow": 0.86,
    "jeff-the-land-shark": 0.82, "loki": 0.78, "mantis": 0.75,
    "iron-fist": 0.30, "black-panther": 0.25, "psylocke": 0.28,
    "wolverine": 0.30, "spider-man": 0.32, "storm": 0.35, "hawkeye": 0.38,
    "black-widow": 0.36, "moon-knight": 0.35, "iron-man": 0.40,
    "star-lord": 0.38, "winter-soldier": 0.36, "namor": 0.45,
    "scarlet-witch": 0.42, "squirrel-girl": 0.50, "mister-fantastic": 0.48,
  },
  Balanced: {},
};

function computeRoleBalanceScore(heroId: string, playstyle: Playstyle): number {
  if (playstyle === "Balanced") return 0.5;
  return PLAYSTYLE_AFFINITIES[playstyle][heroId] ?? 0.5;
}

function minMaxNormalise(values: number[]): number[] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  if (range === 0) return values.map(() => 0.5);
  return values.map((v) => (v - min) / range);
}

function buildReasons(
  hero: HeroStats,
  breakdown: ScoreBreakdown,
  mapId: string,
  playstyle: Playstyle
): string[] {
  const reasons: string[] = [];
  const wrPct = (hero.winRate * 100).toFixed(1);
  if (breakdown.normWinRate >= 0.75) reasons.push(`${wrPct}% win rate — top-tier in current meta`);
  else if (breakdown.normWinRate >= 0.5) reasons.push(`${wrPct}% win rate — above average this patch`);
  else reasons.push(`${wrPct}% win rate — stable performer`);
  const prPct = (hero.pickRate * 100).toFixed(1);
  if (breakdown.normPickRate >= 0.75) reasons.push(`${prPct}% pick rate — high popularity confirms viability`);
  else if (breakdown.normPickRate >= 0.5) reasons.push(`${prPct}% pick rate — well-represented in ranked play`);
  const history = hero.patchHistory;
  if (history && history.length >= 2) {
    const delta = history[history.length - 1].winRate - history[history.length - 2].winRate;
    const dPct = (delta * 100).toFixed(1);
    if (delta > 0.005) reasons.push(`+${dPct}% win rate improvement over last patch — trending up`);
    else if (delta < -0.005) reasons.push(`${dPct}% win rate drop last patch — slight downward trend`);
    else reasons.push(`Win rate stable across last 2 patches`);
  }
  if (mapId) {
    const modifier = MAP_HERO_AFFINITIES[mapId]?.[hero.id] ?? 0;
    const mPct = (Math.abs(modifier) * 100).toFixed(1);
    if (modifier > 0.03) reasons.push(`+${mPct}% map affinity — strong performer on this map`);
    else if (modifier < -0.03) reasons.push(`-${mPct}% map penalty — weaker on this map`);
    else reasons.push(`Neutral map performance — no significant map bias`);
  }
  if (playstyle !== "Balanced") {
    const psScore = PLAYSTYLE_AFFINITIES[playstyle][hero.id] ?? 0.5;
    if (psScore >= 0.75) reasons.push(`Excellent ${playstyle.toLowerCase()} playstyle fit`);
    else if (psScore >= 0.55) reasons.push(`Good ${playstyle.toLowerCase()} playstyle compatibility`);
    else if (psScore < 0.4) reasons.push(`Below-average ${playstyle.toLowerCase()} playstyle fit`);
  }
  if (hero.tier === "S") reasons.push(`S-tier rated — elite pick in patch 1.5`);
  else if (hero.tier === "A") reasons.push(`A-tier rated — strong and reliable pick`);
  return reasons.slice(0, 5);
}

export interface ScoreOptions {
  role: Role | "All";
  mapId: string;
  playstyle: Playstyle;
}

export function scoreHeroes(heroes: HeroStats[], options: ScoreOptions): ScoredHero[] {
  const { role, mapId, playstyle } = options;
  const pool = role === "All" ? heroes : heroes.filter((h) => h.role === role);
  if (pool.length === 0) return [];

  const rawWR = pool.map((h) => h.winRate);
  const rawPR = pool.map((h) => h.pickRate);
  const rawTS = pool.map((h) => computeTrendScore(h));
  const rawMS = pool.map((h) => computeMapScore(h.id, mapId));
  const rawRBS = pool.map((h) => computeRoleBalanceScore(h.id, playstyle));

  const nWRs = minMaxNormalise(rawWR);
  const nPRs = minMaxNormalise(rawPR);
  const nTSs = minMaxNormalise(rawTS);
  const nMSs = minMaxNormalise(rawMS);
  const nRBSs = minMaxNormalise(rawRBS);

  const scored: ScoredHero[] = pool.map((hero, i) => {
    const wWR = nWRs[i] * SCORE_WEIGHTS.winRate;
    const wPR = nPRs[i] * SCORE_WEIGHTS.pickRate;
    const wTS = nTSs[i] * SCORE_WEIGHTS.trendScore;
    const wMS = nMSs[i] * SCORE_WEIGHTS.mapScore;
    const wRBS = nRBSs[i] * SCORE_WEIGHTS.roleBalanceScore;
    const finalScore = Math.round((wWR + wPR + wTS + wMS + wRBS) * 100);

    const breakdown: ScoreBreakdown = {
      rawWinRate: rawWR[i], rawPickRate: rawPR[i], rawTrendScore: rawTS[i],
      rawMapScore: rawMS[i], rawRoleBalanceScore: rawRBS[i],
      normWinRate: nWRs[i], normPickRate: nPRs[i], normTrendScore: nTSs[i],
      normMapScore: nMSs[i], normRoleBalanceScore: nRBSs[i],
      weightedWinRate: wWR, weightedPickRate: wPR, weightedTrendScore: wTS,
      weightedMapScore: wMS, weightedRoleBalanceScore: wRBS,
      finalScore,
    };

    const reasons = buildReasons(hero, breakdown, mapId, playstyle);
    const confidence: "High" | "Medium" | "Low" =
      finalScore >= 75 ? "High" : finalScore >= 50 ? "Medium" : "Low";

    return { hero, score: finalScore, breakdown, confidence, reasons };
  });

  return scored.sort((a, b) => b.score - a.score);
}
