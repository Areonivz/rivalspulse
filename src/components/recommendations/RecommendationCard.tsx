"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Shield, Swords, TrendingUp } from "lucide-react";
import type { ScoredHero, ScoreBreakdown } from "@/lib/utils/scoring";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { TierBadge } from "@/components/ui/TierBadge";
import { pctFormat } from "@/lib/utils/formatters";

const ROLE_GRADIENT: Record<string, string> = {
  Vanguard: "from-blue-950/40 to-gray-900/0",
  Duelist: "from-red-950/40 to-gray-900/0",
  Strategist: "from-green-950/40 to-gray-900/0",
};
const CONFIDENCE_STYLES: Record<string, string> = {
  High: "text-green-400 bg-green-950/50 border-green-800/50",
  Medium: "text-amber-400 bg-amber-950/50 border-amber-800/50",
  Low: "text-gray-400 bg-gray-800/50 border-gray-700/50",
};
const scoreColor = (s: number) =>
  s >= 75 ? "text-green-400" : s >= 50 ? "text-amber-400" : "text-gray-400";

export interface RecCardProps {
  data: ScoredHero;
  rank: number;
  onShowFormula: (d: ScoredHero) => void;
}

export function RecommendationCard({ data, rank, onShowFormula }: RecCardProps) {
  const { hero, score, breakdown, confidence, reasons } = data;
  const [expanded, setExpanded] = useState(false);
  const roleBar =
    hero.role === "Vanguard" ? "bg-blue-500" : hero.role === "Duelist" ? "bg-red-500" : "bg-green-500";
  const scoreBar =
    score >= 75 ? "bg-green-500" : score >= 50 ? "bg-amber-400" : "bg-gray-500";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br ${ROLE_GRADIENT[hero.role]} bg-gray-900/80 transition-all hover:border-gray-700`}
    >
      <div className={`h-1 w-full ${roleBar}`} />
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-xl font-black text-gray-300 select-none">
              {hero.name.charAt(0)}
              <span className="absolute -top-1 -left-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-950 border border-gray-700 text-[10px] font-bold text-gray-400">
                #{rank}
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">{hero.name}</h3>
              <div className="mt-1 flex items-center gap-1.5">
                <RoleBadge role={hero.role} />
                <TierBadge tier={hero.tier} />
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-3xl font-black tabular-nums ${scoreColor(score)}`}>{score}</div>
            <div className="text-[10px] uppercase tracking-wider text-gray-600">/ 100</div>
          </div>
        </div>

        {/* Confidence */}
        <div className="mt-3">
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${CONFIDENCE_STYLES[confidence]}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {confidence} Confidence
          </span>
        </div>

        {/* Stats strip */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Win Rate", value: pctFormat(hero.winRate) },
            { label: "Pick Rate", value: pctFormat(hero.pickRate) },
            { label: "KDA", value: hero.avgKda.toFixed(2) },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg border border-gray-800 bg-gray-950/50 px-2 py-2 text-center">
              <p className="text-[10px] uppercase tracking-wider text-gray-600">{label}</p>
              <p className="mt-0.5 text-sm font-bold text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Score bar + component bars */}
        <ScoreBars score={score} breakdown={breakdown} scoreBar={scoreBar} onShowFormula={() => onShowFormula(data)} />

        {/* Accordion */}
        <div className="mt-4 border-t border-gray-800 pt-4">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="flex w-full items-center justify-between text-sm font-semibold text-gray-300 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <TrendingUp size={14} className="text-red-400" />Why this pick?
            </span>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          {expanded && (
            <AccordionContent reasons={reasons} synergies={hero.synergies} counters={hero.counters} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function ScoreBars({
  score, breakdown, scoreBar, onShowFormula,
}: {
  score: number;
  breakdown: ScoreBreakdown;
  scoreBar: string;
  onShowFormula: () => void;
}) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-wider text-gray-600">Recommendation Score</span>
        <button onClick={onShowFormula} className="text-[10px] font-semibold text-red-400 hover:text-red-300 transition-colors underline underline-offset-2">
          How is this calculated?
        </button>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${scoreBar}`} style={{ width: `${score}%` }} />
      </div>
      <div className="mt-2 grid grid-cols-5 gap-1">
        {[
          { label: "WR", v: breakdown.weightedWinRate, max: 0.45, c: "bg-red-500" },
          { label: "PR", v: breakdown.weightedPickRate, max: 0.20, c: "bg-orange-500" },
          { label: "TR", v: breakdown.weightedTrendScore, max: 0.15, c: "bg-yellow-500" },
          { label: "MAP", v: breakdown.weightedMapScore, max: 0.10, c: "bg-blue-500" },
          { label: "STY", v: breakdown.weightedRoleBalanceScore, max: 0.10, c: "bg-purple-500" },
        ].map(({ label, v, max, c }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <div className="h-1 w-full rounded-full bg-gray-800 overflow-hidden">
              <div className={`h-full rounded-full ${c}`} style={{ width: `${Math.min(100, (v / max) * 100)}%` }} />
            </div>
            <span className="text-[9px] text-gray-600">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccordionContent({
  reasons, synergies, counters,
}: {
  reasons: string[];
  synergies: string[];
  counters: string[];
}) {
  return (
    <div className="mt-3 space-y-2">
      <ul className="space-y-1.5">
        {reasons.map((r, idx) => (
          <li key={idx} className="flex items-start gap-2 text-xs text-gray-400">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />{r}
          </li>
        ))}
      </ul>
      <div className="mt-3 rounded-lg border border-green-900/40 bg-green-950/20 p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Shield size={12} className="text-green-400" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-green-400">Synergy Tip</span>
        </div>
        <p className="text-xs text-gray-400">Works well with: <span className="font-semibold text-gray-300">{synergies.join(", ")}</span></p>
      </div>
      <div className="rounded-lg border border-red-900/40 bg-red-950/20 p-3">
        <div className="flex items-center gap-1.5 mb-1">
          <Swords size={12} className="text-red-400" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-red-400">Watch Out For</span>
        </div>
        <p className="text-xs text-gray-400">Countered by: <span className="font-semibold text-gray-300">{counters.join(", ")}</span></p>
      </div>
    </div>
  );
}
