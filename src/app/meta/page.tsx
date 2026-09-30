import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, BarChart2 } from "lucide-react";
import { MOCK_HEROES } from "@/lib/mock/heroes";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WinRateBarChart } from "@/components/charts/WinRateBarChart";
import { HeroMetaTable } from "@/components/tables/HeroMetaTable";

export const metadata: Metadata = {
  title: "Hero Meta | RivalsPulse",
  description:
    "Full sortable and filterable hero meta table for Marvel Rivals. Compare win rates, pick rates, KDA, and tier ratings across all 30 heroes.",
};

const top10BarData = [...MOCK_HEROES]
  .sort((a, b) => b.winRate - a.winRate)
  .slice(0, 10)
  .map((h) => ({ name: h.name, winRate: h.winRate, role: h.role }));

export default function MetaPage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* ── Page header ── */}
      <div className="border-b border-gray-800 bg-gray-900/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-600">
            <Link href="/" className="hover:text-gray-400 transition-colors">Overview</Link>
            <ChevronRight size={12} />
            <span className="text-gray-400">Hero Meta</span>
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Hero <span className="text-red-500">Meta</span>
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                Patch 1.5 &middot; All Ranks &middot; {MOCK_HEROES.length} heroes tracked
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-green-800/50 bg-green-950/40 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold text-green-400">Live · Patch 1.5</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 lg:px-8">
        {/* ── Top-10 Win Rate chart ── */}
        <section className="rounded-xl border border-gray-800 bg-gray-900/60 p-6">
          <SectionHeader
            title="Top 10 Win Rates"
            subtitle="Patch 1.5 · All Ranks · sorted by win rate"
            action={
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-500" /> Vanguard
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red-500" /> Duelist
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-green-500" /> Strategist
                </span>
              </div>
            }
          />
          <WinRateBarChart data={top10BarData} />
        </section>

        {/* ── Full hero table ── */}
        <section>
          <SectionHeader
            title="All Heroes"
            subtitle="Sort by any column · filter by role or rank · click a row for hero details"
            action={
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <BarChart2 size={13} />
                <span>{MOCK_HEROES.length} total heroes</span>
              </div>
            }
          />
          <HeroMetaTable heroes={MOCK_HEROES} />
        </section>
      </div>
    </div>
  );
}
