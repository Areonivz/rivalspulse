/**
 * API client for RivalsPulse backend (/api/v1/*).
 *
 * If NEXT_PUBLIC_API_BASE_URL is blank (MVP 1 / no backend), every function
 * returns mock data — no page rewrites needed.
 */

import type { HeroStats } from "@/lib/types/hero";
import type { Recommendation } from "@/lib/types/recommendation";
import type { Patch } from "@/lib/types/patch";
import { MOCK_HEROES } from "@/lib/mock/heroes";
import { MOCK_RECOMMENDATIONS } from "@/lib/mock/recommendations";
import { MOCK_PATCHES } from "@/lib/mock/patches";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";

/** True when a real backend URL is set. */
export const isLiveMode = (): boolean => API_BASE.length > 0;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    next: { revalidate: 300 },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API ${res.status} for ${url}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

type QueryParams = Record<string, string | number | boolean | undefined | null>;

function buildQuery(params: QueryParams): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (entries.length === 0) return "";
  return "?" + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join("&");
}

// ---------------------------------------------------------------------------
// Heroes
// ---------------------------------------------------------------------------

export interface FetchHeroesParams {
  patch?: string;
  role?: string;
  rank?: string;
  [key: string]: string | undefined;
}

function applyHeroFilters(heroes: HeroStats[], p: FetchHeroesParams): HeroStats[] {
  let r = [...heroes];
  if (p.role) r = r.filter((h) => h.role === p.role);
  if (p.patch) r = r.filter((h) => h.patch === p.patch);
  if (p.rank) r = r.filter((h) => h.rankBand === p.rank);
  return r;
}

/** Full hero list with stats. Falls back to mock when no backend is set. */
export async function fetchHeroes(params: FetchHeroesParams = {}): Promise<HeroStats[]> {
  if (!isLiveMode()) return applyHeroFilters(MOCK_HEROES, params);
  return apiFetch<HeroStats[]>(`/api/v1/heroes${buildQuery(params)}`);
}

/** Single hero detail (includes mapStats). Falls back to mock. */
export async function fetchHero(heroId: string): Promise<HeroStats | null> {
  if (!isLiveMode()) return MOCK_HEROES.find((h) => h.id === heroId) ?? null;
  try {
    return await apiFetch<HeroStats>(`/api/v1/heroes/${heroId}`);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Recommendations
// ---------------------------------------------------------------------------

export interface FetchRecommendationsParams {
  role?: string;
  rank?: string;
  mapId?: string;
  playstyle?: string;
  limit?: number;
  [key: string]: string | number | undefined;
}

function applyRecommendationFilters(
  recs: Recommendation[],
  { role, rank, mapId, limit = 3 }: FetchRecommendationsParams,
): Recommendation[] {
  let r = [...recs];
  if (role) r = r.filter((x) => x.role === role);
  if (rank) r = r.filter((x) => x.rank === rank || x.rank === "All Ranks");
  if (mapId) r = r.filter((x) => x.mapId === mapId);
  r.sort((a, b) => b.score - a.score);
  return r.slice(0, limit);
}

/** Top-N scored hero recommendations. Falls back to mock. */
export async function fetchRecommendations(
  params: FetchRecommendationsParams = {},
): Promise<Recommendation[]> {
  if (!isLiveMode()) return applyRecommendationFilters(MOCK_RECOMMENDATIONS, params);
  return apiFetch<Recommendation[]>(`/api/v1/recommendations${buildQuery(params)}`);
}

// ---------------------------------------------------------------------------
// Patches
// ---------------------------------------------------------------------------

/** Patch history, newest first. Falls back to mock. */
export async function fetchPatches(): Promise<Patch[]> {
  if (!isLiveMode()) return MOCK_PATCHES;
  return apiFetch<Patch[]>("/api/v1/patches");
}

/** Single patch detail. Falls back to mock. */
export async function fetchPatch(patchId: string): Promise<Patch | null> {
  if (!isLiveMode()) return MOCK_PATCHES.find((p) => p.id === patchId) ?? null;
  try {
    return await apiFetch<Patch>(`/api/v1/patches/${patchId}`);
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Meta (aggregated gold-layer view)
// ---------------------------------------------------------------------------

export interface FetchMetaParams {
  patch?: string;
  role?: string;
  rank?: string;
  [key: string]: string | undefined;
}

/** Aggregated hero meta stats. Falls back to mock hero list. */
export async function fetchMeta(
  params: FetchMetaParams = {},
): Promise<{ heroes: HeroStats[]; generated_at: string }> {
  if (!isLiveMode()) {
    return { heroes: applyHeroFilters(MOCK_HEROES, params), generated_at: new Date().toISOString() };
  }
  return apiFetch<{ heroes: HeroStats[]; generated_at: string }>(
    `/api/v1/meta${buildQuery(params)}`,
  );
}
