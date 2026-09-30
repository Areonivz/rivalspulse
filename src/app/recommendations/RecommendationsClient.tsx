"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, Filter, Zap } from "lucide-react";
import { MOCK_HEROES } from "@/lib/mock/heroes";
import { MOCK_MAPS } from "@/lib/mock/maps";
import { scoreHeroes } from "@/lib/utils/scoring";
import type { ScoredHero, Playstyle } from "@/lib/utils/scoring";
import type { Role, RankBand } from "@/lib/types/hero";
import { RecommendationCard } from "@/components/recommendations/RecommendationCard";
import { FormulaModal } from "@/components/recommendations/FormulaModal";
import { FormulaExplainerBanner } from "@/components/recommendations/FormulaExplainerBanner";

const ROLES: Array<Role | "All"> = ["All", "Vanguard", "Duelist", "Strategist"];
const RANKS: RankBand[] = ["Bronze-Silver", "Gold-Platinum", "Diamond-Grandmaster", "Celestial+"];
const PLAYSTYLES: Playstyle[] = ["Aggressive", "Balanced", "Defensive"];

function roleButtonClass(active: boolean, role: Role | "All") {
  if (!active)
    return "border border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-white";
  if (role === "Vanguard") return "border border-blue-700 bg-blue-950/60 text-blue-300";
  if (role === "Duelist") return "border border-red-700 bg-red-950/60 text-red-300";
  if (role === "Strategist") return "border border-green-700 bg-green-950/60 text-green-300";
  return "border border-red-700 bg-red-950/60 text-red-300";
}

export function RecommendationsClient() {
  const [role, setRole] = useState<Role | "All">("All");
  const [rank, setRank] = useState<RankBand>("Diamond-Grandmaster");
  const [mapId, setMapId] = useState<string>("");
  const [playstyle, setPlaystyle] = useState<Playstyle>("Balanced");
  const [formulaHero, setFormulaHero] = useState<ScoredHero | null>(null);
  const [showAll, setShowAll] = useState(false);

  const scored = useMemo(
    () => scoreHeroes(MOCK_HEROES, { role, mapId, playstyle }),
    [role, mapId, playstyle]
  );
  const top3 = scored.slice(0, 3);
  const rest = scored.slice(3);
  const selectedMap = MOCK_MAPS.find((m) => m.id === mapId);

  return (
    <div className="min-h-screen bg-gray-950">
      <PageHeader />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <FilterBar
          role={role} setRole={setRole}
          rank={rank} setRank={setRank}
          mapId={mapId} setMapId={setMapId}
          playstyle={playstyle} setPlaystyle={setPlaystyle}
          selectedMapNotes={selectedMap?.metaNotes}
        />
        <FormulaExplainerBanner />
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap size={18} className="text-red-500" />Top Recommendations
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {scored.length} heroes scored · {role === "All" ? "All roles" : role} ·{" "}
                {selectedMap ? selectedMap.name : "Any map"} · {playstyle}
              </p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {top3.map((h, i) => (
              <RecommendationCard key={h.hero.id} data={h} rank={i + 1} onShowFormula={setFormulaHero} />
            ))}
          </div>
        </section>
        {rest.length > 0 && (
          <section>
            <button
              onClick={() => setShowAll((v) => !v)}
              className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
            >
              <ChevronRight size={16} className={`transition-transform ${showAll ? "rotate-90" : ""}`} />
              {showAll ? "Hide" : "Show"} remaining {rest.length} heroes
            </button>
            {showAll && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((h, i) => (
                  <RecommendationCard key={h.hero.id} data={h} rank={i + 4} onShowFormula={setFormulaHero} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
      {formulaHero && <FormulaModal data={formulaHero} onClose={() => setFormulaHero(null)} />}
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function PageHeader() {
  return (
    <div className="border-b border-gray-800 bg-gray-900/40">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-600">
          <Link href="/" className="hover:text-gray-400 transition-colors">Overview</Link>
          <ChevronRight size={12} />
          <span className="text-gray-400">Recommendations</span>
        </nav>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
              Pick <span className="text-red-500">Recommendations</span>
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Scored using win rate, trend, map affinity &amp; playstyle fit · Patch 1.5
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-green-800/50 bg-green-950/40 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-semibold text-green-400">Live · Patch 1.5</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FilterBarProps {
  role: Role | "All"; setRole: (r: Role | "All") => void;
  rank: RankBand; setRank: (r: RankBand) => void;
  mapId: string; setMapId: (m: string) => void;
  playstyle: Playstyle; setPlaystyle: (p: Playstyle) => void;
  selectedMapNotes?: string;
}

function FilterBar({ role, setRole, rank, setRank, mapId, setMapId, playstyle, setPlaystyle, selectedMapNotes }: FilterBarProps) {
  return (
    <section className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
      <div className="flex items-center gap-2 mb-5">
        <Filter size={16} className="text-red-400" />
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Filters</h2>
        <span className="text-xs text-gray-600">· Changes re-score heroes instantly</span>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Role */}
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Role</label>
          <div className="flex flex-wrap gap-1.5">
            {ROLES.map((r) => (
              <button key={r} onClick={() => setRole(r)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${roleButtonClass(role === r, r)}`}>{r}</button>
            ))}
          </div>
        </div>
        {/* Rank */}
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Rank Band</label>
          <select value={rank} onChange={(e) => setRank(e.target.value as RankBand)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-red-600 focus:outline-none">
            {RANKS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <p className="mt-1.5 text-[10px] text-gray-600">Rank-banded data available in MVP 2.</p>
        </div>
        {/* Map */}
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Map <span className="text-gray-700">(optional)</span></label>
          <select value={mapId} onChange={(e) => setMapId(e.target.value)} className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-red-600 focus:outline-none">
            <option value="">Any Map</option>
            {MOCK_MAPS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          {selectedMapNotes && <p className="mt-1.5 text-[10px] text-gray-500 italic">{selectedMapNotes}</p>}
        </div>
        {/* Playstyle */}
        <div>
          <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-500">Preferred Playstyle</label>
          <div className="flex gap-1.5">
            {PLAYSTYLES.map((p) => (
              <button key={p} onClick={() => setPlaystyle(p)} className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-all ${playstyle === p ? "border border-red-700 bg-red-950/60 text-red-300" : "border border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-white"}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
