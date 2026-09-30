import type { Tier } from "@/lib/types/hero";

/** Format a decimal win/pick/ban rate as a percentage string, e.g. 0.5432 -> "54.3%" */
export function pctFormat(value: number, decimals = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/** Format a KDA ratio, e.g. 2.847 -> "2.85" */
export function kdaFormat(value: number): string {
  return value.toFixed(2);
}

/** Format a win-rate delta with a +/- sign, e.g. 0.032 -> "+3.2%" */
export function deltaFormat(value: number, decimals = 1): string {
  const pct = value * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(decimals)}%`;
}

/** Derive a tier label from a win rate */
export function tierFromWinRate(winRate: number): Tier {
  if (winRate >= 0.54) return "S";
  if (winRate >= 0.51) return "A";
  if (winRate >= 0.48) return "B";
  return "C";
}

/** Format an ISO date string as a readable label, e.g. "2024-11-15" -> "Nov 15, 2024" */
export function dateFormat(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Clamp a number between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
