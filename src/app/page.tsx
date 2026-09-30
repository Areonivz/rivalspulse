import Link from "next/link";
import { ArrowRight, TrendingUp, Users, Shield, Zap, ChevronRight, Activity } from "lucide-react";
import { MOCK_HEROES } from "@/lib/mock/heroes";
import { MOCK_PATCHES } from "@/lib/mock/patches";
import { StatCard } from "@/components/ui/StatCard";
import { HeroCard } from "@/components/ui/HeroCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RoleDistributionChart } from "@/components/charts/RoleDistributionChart";
import { WinRateBarChart } from "@/components/charts/WinRateBarChart";
import { pctFormat, dateFormat } from "@/lib/utils/formatters";

const top5 = [...MOCK_HEROES].sort((a, b) => b.winRate - a.winRate).slice(0, 5);
const top10BarData = [...MOCK_HEROES].sort((a, b) => b.winRate - a.winRate).slice(0, 10).map((h) => ({ name: h.name, winRate: h.winRate, role: h.role }));
const roleCounts = ["Vanguard", "Duelist", "Strategist"].map((role) => { const heroes = MOCK_HEROES.filter((h) => h.role === role); return { role, count: heroes.length, avgWinRate: heroes.reduce((s, h) => s + h.winRate, 0) / heroes.length }; });
const latestPatch = MOCK_PATCHES[0];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden border-b border-gray-800">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-red-600/10 blur-3xl" />
          <div className="absolute top-20 left-1/4 h-64 w-64 rounded-full bg-blue-600/5 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-800/50 bg-green-950/40 px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-semibold text-green-400">Live · Patch 1.5 Data</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
              Master the{" "}<span className="text-red-500">Marvel Rivals</span>{" "}meta
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-gray-400 max-w-xl">
              Aggregate win rates, pick rates, map recommendations, and patch analytics — updated every 6 hours. No logins. No player data. Pure meta intelligence.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/meta" className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition-all hover:bg-red-500">
                Explore Hero Meta <ArrowRight size={16} />
              </Link>
              <Link href="/recommendations" className="inline-flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900 px-5 py-3 text-sm font-semibold text-gray-300 transition-all hover:border-gray-600 hover:text-white">
                Get Pick Recommendations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* KPI STRIP */}
      <section className="border-b border-gray-800 bg-gray-900/40">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Heroes Tracked" value={MOCK_HEROES.length} subValue="Across all roles" icon={Users} />
            <StatCard label="Matches Analysed" value="4.2M" subValue="Current patch" icon={Activity} accent />
            <StatCard label="Patches Covered" value={MOCK_PATCHES.length} subValue="Since Season 1 launch" icon={Shield} />
            <StatCard label="Last Updated" value="moments ago" subValue="Auto-refresh every 6h" icon={Zap} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-16">
        {/* PATCH BANNER */}
        <section className="rounded-2xl border border-amber-900/40 bg-gradient-to-r from-amber-950/30 to-orange-950/20 p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-700/40">{latestPatch.label}</span>
                <span className="text-xs text-gray-500">{dateFormat(latestPatch.releasedAt)}</span>
                {latestPatch.isMajor && <span className="rounded-full bg-red-950/60 px-2 py-0.5 text-xs font-semibold text-red-400 border border-red-800/40">Major</span>}
              </div>
              <h3 className="text-xl font-bold text-white mb-1">{latestPatch.summary}</h3>
              <ul className="mt-3 space-y-1.5">
                {latestPatch.notes.slice(0, 4).map((note, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500/60" />{note}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {latestPatch.heroChanges.map((c) => (
                <div key={c.heroId} className="flex items-center gap-2 text-sm">
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${c.changeType === "buff" ? "bg-green-400" : c.changeType === "nerf" ? "bg-red-400" : "bg-amber-400"}`} />
                  <span className="text-gray-300 font-medium">{c.heroName}</span>
                  <span className={`text-xs font-semibold ${c.winRateDelta > 0 ? "text-green-400" : "text-red-400"}`}>{c.winRateDelta > 0 ? "+" : ""}{(c.winRateDelta * 100).toFixed(1)}%</span>
                </div>
              ))}
              <Link href="/patches" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors">
                Full patch notes <ChevronRight size={12} />
              </Link>
            </div>
          </div>
        </section>

        {/* TOP 5 HEROES */}
        <section>
          <SectionHeader
            title="Top Heroes This Patch"
            subtitle="Ranked by win rate · Patch 1.5 · All Ranks"
            action={<Link href="/meta" className="inline-flex items-center gap-1 text-sm font-medium text-red-400 hover:text-red-300 transition-colors">View all {MOCK_HEROES.length} heroes <ChevronRight size={14} /></Link>}
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {top5.map((hero, i) => (<HeroCard key={hero.id} hero={hero} rank={i + 1} />))}
          </div>
        </section>

        {/* CHARTS ROW */}
        <section className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3 rounded-xl border border-gray-800 bg-gray-900/60 p-6">
            <SectionHeader title="Top 10 Win Rates" subtitle="Patch 1.5 · All Ranks" />
            <WinRateBarChart data={top10BarData} />
            <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" /> Vanguard</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Duelist</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500" /> Strategist</span>
            </div>
          </div>
          <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-gray-900/60 p-6">
            <SectionHeader title="Role Distribution" subtitle="Current hero roster" />
            <RoleDistributionChart data={roleCounts} />
            <div className="mt-2 space-y-2">
              {roleCounts.map((r) => (
                <div key={r.role} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{r.role}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500">{r.count} heroes</span>
                    <span className="font-semibold text-white">{pctFormat(r.avgWinRate)} avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA STRIP */}
        <section className="rounded-2xl border border-gray-800 bg-gradient-to-r from-gray-900 to-gray-900/60 p-8 text-center">
          <div className="mx-auto max-w-lg">
            <TrendingUp className="mx-auto mb-4 text-red-500" size={32} />
            <h2 className="text-2xl font-bold text-white">Find your optimal pick in seconds</h2>
            <p className="mt-3 text-sm text-gray-400">Filter by role, rank band, and map to get scored hero recommendations with synergy tips and counter advice.</p>
            <Link href="/recommendations" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition-all hover:bg-red-500">
              Get My Recommendations <ArrowRight size={16} />
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}

