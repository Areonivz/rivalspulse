import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ChevronRight,
  ArrowLeft,
  TrendingUp,
  Users,
  ShieldOff,
  Sword,
  Swords,
  Shield,
  Activity,
} from "lucide-react";
import { MOCK_HEROES } from "@/lib/mock/heroes";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { TierBadge } from "@/components/ui/TierBadge";
import { StatCard } from "@/components/ui/StatCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { WinRateLineChart } from "@/components/charts/WinRateLineChart";
import { MapStatsTable } from "@/components/tables/MapStatsTable";
import { pctFormat, kdaFormat } from "@/lib/utils/formatters";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert a hero display name to a heroId slug, e.g. "Iron Man" -> "iron-man" */
function nameToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const ROLE_GRADIENT: Record<string, string> = {
  Vanguard: "from-blue-950/40 via-gray-950 to-gray-950",
  Duelist: "from-red-950/40 via-gray-950 to-gray-950",
  Strategist: "from-green-950/40 via-gray-950 to-gray-950",
};

const ROLE_AVATAR_RING: Record<string, string> = {
  Vanguard: "border-blue-700/60 bg-blue-900/30 text-blue-200",
  Duelist: "border-red-700/60 bg-red-900/30 text-red-200",
  Strategist: "border-green-700/60 bg-green-900/30 text-green-200",
};

const ROLE_ACCENT_BAR: Record<string, string> = {
  Vanguard: "bg-blue-500",
  Duelist: "bg-red-500",
  Strategist: "bg-green-500",
};

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ heroId: string }>;
}): Promise<Metadata> {
  const { heroId } = await params;
  const hero = MOCK_HEROES.find((h) => h.id === heroId);
  if (!hero) return { title: "Hero Not Found | RivalsPulse" };
  return {
    title: `${hero.name} | Hero Details | RivalsPulse`,
    description: `Patch 1.5 stats for ${hero.name}: ${pctFormat(hero.winRate)} win rate, ${pctFormat(hero.pickRate)} pick rate, ${kdaFormat(hero.avgKda)} KDA. Map performance, patch trends, synergies and counters.`,
  };
}

// ─── Static params (build-time pre-rendering) ─────────────────────────────────

export function generateStaticParams() {
  return MOCK_HEROES.map((h) => ({ heroId: h.id }));
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function HeroDetailPage({
  params,
}: {
  params: Promise<{ heroId: string }>;
}) {
  const { heroId } = await params;
  const hero = MOCK_HEROES.find((h) => h.id === heroId);

  if (!hero) notFound();

  const patchHistory = hero.patchHistory ?? [];

  // Patch-over-patch delta (patch 1.5 vs 1.4)
  const winRateDelta =
    patchHistory.length >= 2
      ? patchHistory[patchHistory.length - 1].winRate -
        patchHistory[patchHistory.length - 2].winRate
      : 0;
  const deltaLabel =
    winRateDelta === 0
      ? undefined
      : `${winRateDelta > 0 ? "+" : ""}${(winRateDelta * 100).toFixed(1)}% vs 1.4`;

  // Avatar initials
  const initials = hero.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gray-950">
      {/* ── Page header with role-tinted gradient ── */}
      <div className={`border-b border-gray-800 bg-gradient-to-br ${ROLE_GRADIENT[hero.role]}`}>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-gray-600">
            <Link href="/" className="transition-colors hover:text-gray-400">Overview</Link>
            <ChevronRight size={12} />
            <Link href="/meta" className="transition-colors hover:text-gray-400">Hero Meta</Link>
            <ChevronRight size={12} />
            <span className="text-gray-400">{hero.name}</span>
          </nav>

          {/* Hero header card */}
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 text-3xl font-black select-none shadow-lg ${ROLE_AVATAR_RING[hero.role]}`}>
              {initials}
            </div>

            {/* Name + badges */}
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                  {hero.name}
                </h1>
                <div className="flex items-center gap-2">
                  <RoleBadge role={hero.role} size="md" />
                  <TierBadge tier={hero.tier} size="lg" />
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Patch 1.5 &middot; {hero.rankBand} &middot; {hero.role}
              </p>
              <div className={`mt-4 h-1 w-16 rounded-full ${ROLE_ACCENT_BAR[hero.role]}`} />
            </div>

            {/* Back link */}
            <Link
              href="/meta"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-700 bg-gray-900/60 px-4 py-2 text-sm font-medium text-gray-400 transition-all hover:border-gray-600 hover:text-white"
            >
              <ArrowLeft size={14} />
              Back to Meta
            </Link>
          </div>
        </div>
      </div>

      {/* ── Page body ── */}
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">

        {/* ── Stat strip ── */}
        <section>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Win Rate" value={pctFormat(hero.winRate)} delta={deltaLabel} deltaPositive={winRateDelta > 0} icon={TrendingUp} accent />
            <StatCard label="Pick Rate" value={pctFormat(hero.pickRate)} subValue="Patch 1.5 · All Ranks" icon={Users} />
            <StatCard label="Ban Rate" value={pctFormat(hero.banRate)} subValue="Higher = more threatening" icon={ShieldOff} />
            <StatCard label="Avg KDA" value={kdaFormat(hero.avgKda)} subValue="Kills + Assists / Deaths" icon={Activity} />
          </div>
        </section>

        {/* ── Meta Trends Over Time ── */}
        {patchHistory.length > 0 && (
          <section className="rounded-xl border border-gray-800 bg-gray-900/60 p-6">
            <SectionHeader
              title="Meta Trends Over Time"
              subtitle="Win Rate and Pick Rate across Patches 1.0 – 1.5"
            />
            <WinRateLineChart data={patchHistory} baseWinRate={hero.winRate} />
            <div className="mt-4 flex flex-wrap items-center gap-5 text-xs text-gray-600">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Win Rate — solid line
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Pick Rate — dashed line
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-px w-4 border-t border-dashed border-gray-600" />
                50% reference
              </span>
            </div>
          </section>
        )}

        {/* ── Map Analysis ── */}
        <section>
          <SectionHeader
            title="Map Analysis"
            subtitle="Effective win rate across all 8 maps based on hero-map affinity data"
          />
          <MapStatsTable heroId={hero.id} baseWinRate={hero.winRate} />
          <p className="mt-3 text-xs text-gray-700">
            Effective Win Rate = base win rate ± map affinity delta. Green = hero over-performs on this map · Red = hero under-performs.
          </p>
        </section>


        {/* ── Synergies & Counters ── */}
        <section>
          <SectionHeader
            title="Synergies & Counters"
            subtitle="Based on Patch 1.5 meta composition data"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Synergies */}
            <div className="rounded-xl border border-green-900/40 bg-green-950/10 p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-900/40">
                  <Shield size={15} className="text-green-400" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Best Synergies</h3>
                  <p className="text-xs text-gray-500">Pairs well with</p>
                </div>
              </div>
              <ul className="space-y-2">
                {hero.synergies.map((name) => {
                  const slug = nameToSlug(name);
                  const ally = MOCK_HEROES.find((h) => h.id === slug);
                  return (
                    <li key={name}>
                      <Link
                        href={`/heroes/${slug}`}
                        className="group flex items-center justify-between rounded-lg border border-green-900/30 bg-green-950/20 px-3 py-2.5 transition-all hover:border-green-800/50 hover:bg-green-950/30"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-900/40 text-xs font-bold text-green-300">
                            {name.charAt(0)}
                          </span>
                          <span className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
                            {name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {ally && (
                            <span className="text-xs font-medium text-green-400">
                              {pctFormat(ally.winRate)} WR
                            </span>
                          )}
                          <ChevronRight size={14} className="text-gray-600 group-hover:text-green-400 transition-colors" />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Counters */}
            <div className="rounded-xl border border-red-900/40 bg-red-950/10 p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-900/40">
                  <Swords size={15} className="text-red-400" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Hard Counters</h3>
                  <p className="text-xs text-gray-500">Struggles against</p>
                </div>
              </div>
              <ul className="space-y-2">
                {hero.counters.map((name) => {
                  const slug = nameToSlug(name);
                  const rival = MOCK_HEROES.find((h) => h.id === slug);
                  return (
                    <li key={name}>
                      <Link
                        href={`/heroes/${slug}`}
                        className="group flex items-center justify-between rounded-lg border border-red-900/30 bg-red-950/20 px-3 py-2.5 transition-all hover:border-red-800/50 hover:bg-red-950/30"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-900/40 text-xs font-bold text-red-300">
                            {name.charAt(0)}
                          </span>
                          <span className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">
                            {name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {rival && (
                            <span className="text-xs font-medium text-red-400">
                              {pctFormat(rival.winRate)} WR
                            </span>
                          )}
                          <ChevronRight size={14} className="text-gray-600 group-hover:text-red-400 transition-colors" />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </section>

        {/* ── Footer nav ── */}
        <div className="flex items-center justify-between border-t border-gray-800 pt-6">
          <Link
            href="/meta"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-white"
          >
            <ArrowLeft size={14} />
            All Heroes
          </Link>
          <Link
            href="/recommendations"
            className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition-all hover:bg-red-500"
          >
            <Sword size={14} />
            Get Pick Recommendations
          </Link>
        </div>

      </div>
    </div>
  );
}

