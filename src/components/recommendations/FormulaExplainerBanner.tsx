"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info } from "lucide-react";
import { SCORE_WEIGHTS } from "@/lib/utils/scoring";

const WEIGHT_ITEMS = [
  { label: "Win Rate", key: "winRate", weight: SCORE_WEIGHTS.winRate, color: "bg-red-500", desc: "Core performance signal. Normalised within the filtered pool." },
  { label: "Pick Rate", key: "pickRate", weight: SCORE_WEIGHTS.pickRate, color: "bg-orange-500", desc: "Proxy for player confidence and overall viability." },
  { label: "Trend Score", key: "trendScore", weight: SCORE_WEIGHTS.trendScore, color: "bg-yellow-500", desc: "Win rate direction between the last two patches." },
  { label: "Map Affinity", key: "mapScore", weight: SCORE_WEIGHTS.mapScore, color: "bg-blue-500", desc: "Computed from map-specific win rate modifiers." },
  { label: "Playstyle Fit", key: "roleBalanceScore", weight: SCORE_WEIGHTS.roleBalanceScore, color: "bg-purple-500", desc: "How well the hero matches your selected playstyle." },
] as const;

export function FormulaExplainerBanner() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900/40">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-gray-300 hover:text-white transition-colors"
      >
        <span className="flex items-center gap-2">
          <Info size={15} className="text-red-400" />
          How are scores calculated?
          <span className="hidden sm:inline text-xs font-normal text-gray-600">
            · Click to expand the scoring formula
          </span>
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="border-t border-gray-800 px-5 py-5">
          <div className="mb-4 rounded-xl border border-gray-800 bg-gray-950 p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-2">Scoring Formula</p>
            <p className="font-mono text-xs text-gray-300 leading-relaxed">
              score = (0.45 × <span className="text-red-400">norm_WR</span>)
              {" "}+ (0.20 × <span className="text-orange-400">norm_PR</span>)
              {" "}+ (0.15 × <span className="text-yellow-400">norm_Trend</span>)
              {" "}+ (0.10 × <span className="text-blue-400">norm_Map</span>)
              {" "}+ (0.10 × <span className="text-purple-400">norm_Playstyle</span>)
            </p>
            <p className="mt-2 text-[10px] text-gray-600">
              All five components are min-max normalised within the current filtered hero pool before being multiplied by their weights and summed to a final 0–100 score.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {WEIGHT_ITEMS.map(({ label, weight, color, desc }) => (
              <div key={label} className="rounded-xl border border-gray-800 bg-gray-950/50 p-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`h-2 w-2 rounded-full ${color}`} />
                  <span className="text-xs font-bold text-white">{label}</span>
                </div>
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-gray-600">Weight</span>
                    <span className="text-xs font-bold text-white">{(weight * 100).toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${weight * 100}%` }} />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500">{desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 text-xs text-gray-600">
            <strong className="text-gray-400">Note:</strong> Scores shift when you change filters because min-max normalisation is applied relative to the current pool. A hero ranked #1 among Duelists may have a different absolute score when all roles are compared.
          </p>
        </div>
      )}
    </div>
  );
}
