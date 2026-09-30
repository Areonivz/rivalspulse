"use client";

import { X, Info } from "lucide-react";
import type { ScoredHero } from "@/lib/utils/scoring";
import { SCORE_WEIGHTS } from "@/lib/utils/scoring";
import { pctFormat } from "@/lib/utils/formatters";

interface ComponentDef {
  label: string;
  weight: number;
  color: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  description: string;
  raw: (d: ScoredHero) => string;
  norm: (d: ScoredHero) => string;
  weighted: (d: ScoredHero) => string;
}

const COMPONENTS: ComponentDef[] = [
  {
    label: "Win Rate", weight: SCORE_WEIGHTS.winRate,
    color: "bg-red-500", textColor: "text-red-400",
    borderColor: "border-red-800/40", bgColor: "bg-red-950/20",
    description: "Hero's win rate normalised within the selected role pool.",
    raw: (d) => pctFormat(d.breakdown.rawWinRate),
    norm: (d) => d.breakdown.normWinRate.toFixed(3),
    weighted: (d) => (d.breakdown.weightedWinRate * 100).toFixed(1),
  },
  {
    label: "Pick Rate", weight: SCORE_WEIGHTS.pickRate,
    color: "bg-orange-500", textColor: "text-orange-400",
    borderColor: "border-orange-800/40", bgColor: "bg-orange-950/20",
    description: "Popularity in ranked play — high pick rate signals player confidence.",
    raw: (d) => pctFormat(d.breakdown.rawPickRate),
    norm: (d) => d.breakdown.normPickRate.toFixed(3),
    weighted: (d) => (d.breakdown.weightedPickRate * 100).toFixed(1),
  },
  {
    label: "Trend Score", weight: SCORE_WEIGHTS.trendScore,
    color: "bg-yellow-500", textColor: "text-yellow-400",
    borderColor: "border-yellow-800/40", bgColor: "bg-yellow-950/20",
    description: "Win rate trajectory from the previous patch to the current one.",
    raw: (d) => d.breakdown.rawTrendScore.toFixed(3),
    norm: (d) => d.breakdown.normTrendScore.toFixed(3),
    weighted: (d) => (d.breakdown.weightedTrendScore * 100).toFixed(1),
  },
  {
    label: "Map Affinity", weight: SCORE_WEIGHTS.mapScore,
    color: "bg-blue-500", textColor: "text-blue-400",
    borderColor: "border-blue-800/40", bgColor: "bg-blue-950/20",
    description: "How well this hero performs on the selected map based on meta data.",
    raw: (d) => d.breakdown.rawMapScore.toFixed(3),
    norm: (d) => d.breakdown.normMapScore.toFixed(3),
    weighted: (d) => (d.breakdown.weightedMapScore * 100).toFixed(1),
  },
  {
    label: "Playstyle Fit", weight: SCORE_WEIGHTS.roleBalanceScore,
    color: "bg-purple-500", textColor: "text-purple-400",
    borderColor: "border-purple-800/40", bgColor: "bg-purple-950/20",
    description: "Alignment between the hero's combat style and your preferred playstyle.",
    raw: (d) => d.breakdown.rawRoleBalanceScore.toFixed(3),
    norm: (d) => d.breakdown.normRoleBalanceScore.toFixed(3),
    weighted: (d) => (d.breakdown.weightedRoleBalanceScore * 100).toFixed(1),
  },
];

interface Props { data: ScoredHero; onClose: () => void; }

export function FormulaModal({ data, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" />
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-700 bg-gray-900 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-gray-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-red-400" />
            <h2 className="text-base font-bold text-white">Score Formula Breakdown</h2>
          </div>
          <button onClick={onClose} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-800 hover:text-white transition-colors"><X size={16} /></button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <p className="text-sm text-gray-400">Showing score calculation for <span className="font-bold text-white">{data.hero.name}</span></p>
          <div className="rounded-xl border border-gray-800 bg-gray-950 p-4">
            <p className="text-[10px] uppercase tracking-wider text-gray-600 mb-2">Formula</p>
            <p className="font-mono text-xs text-gray-300 leading-relaxed">
              score = (0.45 × <span className="text-red-400">WR</span>) + (0.20 × <span className="text-orange-400">PR</span>) + (0.15 × <span className="text-yellow-400">TR</span>) + (0.10 × <span className="text-blue-400">MAP</span>) + (0.10 × <span className="text-purple-400">STY</span>)
            </p>
            <p className="mt-2 text-[10px] text-gray-600">All components are min-max normalised within the filtered hero pool before weighting.</p>
          </div>
          <div className="space-y-3">
            {COMPONENTS.map((comp) => (
              <ComponentRow key={comp.label} comp={comp} data={data} />
            ))}
          </div>
          <TotalRow data={data} />
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

interface RowProps { comp: ComponentDef; data: ScoredHero; }

function ComponentRow({ comp, data }: RowProps) {
  const wPts = parseFloat(comp.weighted(data));
  const fillPct = Math.min(100, (wPts / (comp.weight * 100)) * 100);
  return (
    <div className={`rounded-xl border ${comp.borderColor} ${comp.bgColor} p-4`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${comp.color}`} />
          <span className={`text-sm font-bold ${comp.textColor}`}>{comp.label}</span>
          <span className="text-xs text-gray-500">×{(comp.weight * 100).toFixed(0)}%</span>
        </div>
        <span className={`text-base font-black tabular-nums ${comp.textColor}`}>+{comp.weighted(data)}</span>
      </div>
      <p className="text-[11px] text-gray-500 mb-3">{comp.description}</p>
      <div className="grid grid-cols-3 gap-2 text-center">
        {[
          { label: "Raw Value", val: comp.raw(data) },
          { label: "Normalised", val: comp.norm(data) },
          { label: "Weighted pts", val: comp.weighted(data) },
        ].map(({ label, val }) => (
          <div key={label} className="rounded-md bg-gray-950/50 px-2 py-1.5">
            <p className="text-[9px] uppercase tracking-wider text-gray-600">{label}</p>
            <p className="text-xs font-bold text-white">{val}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 h-1.5 w-full rounded-full bg-gray-800 overflow-hidden">
        <div className={`h-full rounded-full ${comp.color}`} style={{ width: `${fillPct}%` }} />
      </div>
    </div>
  );
}

function TotalRow({ data }: { data: ScoredHero }) {
  const scoreBar = data.score >= 75 ? "bg-green-500" : data.score >= 50 ? "bg-amber-400" : "bg-gray-500";
  const scoreText = data.score >= 75 ? "text-green-400" : data.score >= 50 ? "text-amber-400" : "text-gray-400";
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-950 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-white">Final Score</span>
        <span className={`text-2xl font-black tabular-nums ${scoreText}`}>{data.score} / 100</span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-gray-800 overflow-hidden">
        <div className={`h-full rounded-full ${scoreBar}`} style={{ width: `${data.score}%` }} />
      </div>
      <p className="mt-2 text-[10px] text-gray-600">Scores are relative to the current filter pool — changing role or map will rescore all heroes.</p>
    </div>
  );
}
