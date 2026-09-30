"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Zap,
  ArrowLeft,
  Star,
  FileText,
} from "lucide-react";
import { MOCK_PATCHES } from "@/lib/mock/patches";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { PatchImpactBarChart } from "@/components/charts/PatchImpactBarChart";
import { deltaFormat, dateFormat } from "@/lib/utils/formatters";
import type { ChangeType, Patch, PatchHeroChange } from "@/lib/types/patch";

// ── Change-type badge ─────────────────────────────────────────────────────────

const CHANGE_TYPE_STYLES: Record<ChangeType, { label: string; classes: string }> = {
  buff:   { label: "Buff",   classes: "bg-green-950/60 text-green-400 border border-green-800/50" },
  nerf:   { label: "Nerf",   classes: "bg-red-950/60 text-red-400 border border-red-800/50" },
  rework: { label: "Rework", classes: "bg-amber-950/60 text-amber-400 border border-amber-800/50" },
  new:    { label: "New",    classes: "bg-purple-950/60 text-purple-400 border border-purple-800/50" },
};

function ChangeTypeBadge({ type }: { type: ChangeType }) {
  const { label, classes } = CHANGE_TYPE_STYLES[type];
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${classes}`}>
      {label}
    </span>
  );
}

// ── Delta badge ───────────────────────────────────────────────────────────────

function DeltaBadge({ delta }: { delta: number }) {
  const isPositive = delta >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums ${
        isPositive
          ? "bg-green-950/60 text-green-400 border border-green-800/50"
          : "bg-red-950/60 text-red-400 border border-red-800/50"
      }`}
    >
      {isPositive ? "▲" : "▼"} {deltaFormat(delta)}
    </span>
  );
}

// ── Patch selector tabs ───────────────────────────────────────────────────────

function PatchSelector({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <section>
      <div className="flex flex-wrap gap-2">
        {MOCK_PATCHES.map((p) => {
          const active = p.id === selectedId;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`group flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
                active
                  ? "border-red-700 bg-red-950/50 text-white shadow-lg shadow-red-950/30"
                  : "border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-600 hover:text-white"
              }`}
            >
              <span>{p.label}</span>
              {p.isMajor && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    active
                      ? "bg-amber-500/20 text-amber-400"
                      : "bg-gray-800 text-gray-500 group-hover:bg-gray-700 group-hover:text-gray-400"
                  }`}
                >
                  MAJOR
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ── Patch overview banner ─────────────────────────────────────────────────────

function PatchOverviewBanner({ patch, hasChanges }: { patch: Patch; hasChanges: boolean }) {
  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900/60 p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-900/40 text-red-400">
          <Zap size={22} strokeWidth={2.5} />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-black text-white">{patch.label}</h2>
            {patch.isMajor && (
              <span className="rounded-full bg-amber-950/60 px-2.5 py-0.5 text-xs font-bold text-amber-400 border border-amber-800/50">
                Major Patch
              </span>
            )}
          </div>
          <p className="mt-0.5 text-base font-semibold text-red-400">&ldquo;{patch.summary}&rdquo;</p>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500">
            <Calendar size={11} />
            <span>{dateFormat(patch.releasedAt)}</span>
            {hasChanges && (
              <>
                <span className="text-gray-700">&middot;</span>
                <span>{patch.heroChanges.length} hero adjustments</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="mt-5 border-t border-gray-800 pt-5">
        <div className="mb-3 flex items-center gap-2">
          <FileText size={13} className="text-gray-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Patch Notes</span>
        </div>
        <ul className="space-y-2">
          {patch.notes.map((note, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-600" />
              <span className="text-sm leading-relaxed text-gray-300">{note}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// ── Gainer / Loser row ────────────────────────────────────────────────────────

function GainerLoserRow({ change, side }: { change: PatchHeroChange; side: "gain" | "loss" }) {
  const isGain = side === "gain";
  return (
    <li>
      <Link
        href={`/heroes/${change.heroId}`}
        className={`group flex items-center justify-between rounded-lg border px-3 py-2.5 transition-all ${
          isGain
            ? "border-green-900/30 bg-green-950/20 hover:border-green-800/50 hover:bg-green-950/30"
            : "border-red-900/30 bg-red-950/20 hover:border-red-800/50 hover:bg-red-950/30"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${isGain ? "bg-green-900/40 text-green-300" : "bg-red-900/40 text-red-300"}`}>
            {change.heroName.charAt(0)}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-200 transition-colors group-hover:text-white">{change.heroName}</p>
            <ChangeTypeBadge type={change.changeType} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DeltaBadge delta={change.winRateDelta} />
          <ChevronRight size={14} className={`text-gray-600 transition-colors ${isGain ? "group-hover:text-green-400" : "group-hover:text-red-400"}`} />
        </div>
      </Link>
    </li>
  );
}

// ── Meta shifts summary ───────────────────────────────────────────────────────

function MetaShiftsSummary({
  gainers, losers, hasChanges, patchLabel, patchId,
}: {
  gainers: PatchHeroChange[];
  losers: PatchHeroChange[];
  hasChanges: boolean;
  patchLabel: string;
  patchId: string;
}) {
  return (
    <section>
      <SectionHeader title="Meta Shifts Summary" subtitle={`Win-rate deltas introduced in ${patchLabel}`} />
      {!hasChanges ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 px-6 py-12 text-center">
          <TrendingUp size={32} className="mx-auto mb-3 text-gray-700" />
          <p className="text-sm font-semibold text-gray-500">No hero changes in this patch</p>
          <p className="mt-1 text-xs text-gray-600">Patch {patchId} is the Season 1 launch — baseline stats for all heroes.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-green-900/40 bg-green-950/10 p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-900/40"><TrendingUp size={14} className="text-green-400" /></span>
              <div>
                <h3 className="text-sm font-bold text-white">Top Gainers</h3>
                <p className="text-xs text-gray-500">Largest positive win-rate delta</p>
              </div>
            </div>
            {gainers.length === 0
              ? <p className="py-4 text-center text-xs text-gray-600">No gainers this patch</p>
              : <ul className="space-y-2">{gainers.map((c) => <GainerLoserRow key={c.heroId} change={c} side="gain" />)}</ul>
            }
          </div>
          <div className="rounded-xl border border-red-900/40 bg-red-950/10 p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-900/40"><TrendingDown size={14} className="text-red-400" /></span>
              <div>
                <h3 className="text-sm font-bold text-white">Top Losers</h3>
                <p className="text-xs text-gray-500">Largest negative win-rate delta</p>
              </div>
            </div>
            {losers.length === 0
              ? <p className="py-4 text-center text-xs text-gray-600">No losers this patch</p>
              : <ul className="space-y-2">{losers.map((c) => <GainerLoserRow key={c.heroId} change={c} side="loss" />)}</ul>
            }
          </div>
        </div>
      )}
    </section>
  );
}

// ── Patch adjustments log ─────────────────────────────────────────────────────

function PatchAdjustmentsLog({ patch, hasChanges }: { patch: Patch; hasChanges: boolean }) {
  return (
    <section>
      <SectionHeader
        title="Patch Adjustments Log"
        subtitle={`${patch.label} · complete list of hero changes`}
        action={
          hasChanges ? (
            <span className="rounded-full border border-gray-700 bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-400">
              {patch.heroChanges.length} adjustment{patch.heroChanges.length !== 1 ? "s" : ""}
            </span>
          ) : undefined
        }
      />
      {!hasChanges ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900/40 px-6 py-12 text-center">
          <FileText size={32} className="mx-auto mb-3 text-gray-700" />
          <p className="text-sm font-semibold text-gray-500">No hero adjustments logged for {patch.label}</p>
          <p className="mt-1 text-xs text-gray-600">This is the Season 1 launch patch — all heroes start at baseline stats.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-800">
          <div className="hidden grid-cols-[1.8fr_0.7fr_2.5fr_1fr] gap-4 border-b border-gray-800 bg-gray-900/80 px-5 py-3 sm:grid">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Hero</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Type</span>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Developer Note</span>
            <span className="text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Win Rate Δ</span>
          </div>
          <ul className="divide-y divide-gray-800/60">
            {patch.heroChanges.map((change, index) => (
              <li key={change.heroId} className={`transition-colors hover:bg-gray-900/40 ${index % 2 === 0 ? "bg-gray-950/40" : "bg-gray-900/20"}`}>
                {/* Mobile layout */}
                <div className="flex items-start justify-between gap-3 px-5 py-4 sm:hidden">
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <Link href={`/heroes/${change.heroId}`} className="group flex items-center gap-1.5 font-semibold text-white transition-colors hover:text-red-400">
                        {change.heroName}
                        <ChevronRight size={13} className="text-gray-600 group-hover:text-red-400" />
                      </Link>
                      <ChangeTypeBadge type={change.changeType} />
                    </div>
                    <p className="text-xs leading-relaxed text-gray-400">{change.description}</p>
                  </div>
                  <DeltaBadge delta={change.winRateDelta} />
                </div>
                {/* Desktop layout */}
                <div className="hidden grid-cols-[1.8fr_0.7fr_2.5fr_1fr] items-center gap-4 px-5 py-4 sm:grid">
                  <Link href={`/heroes/${change.heroId}`} className="group flex items-center gap-2 font-semibold text-white transition-colors hover:text-red-400">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-800 text-xs font-bold text-gray-300 transition-colors group-hover:bg-red-950/40 group-hover:text-red-300">
                      {change.heroName.charAt(0)}
                    </span>
                    <span className="flex items-center gap-1">
                      {change.heroName}
                      <ChevronRight size={13} className="text-gray-600 opacity-0 transition-all group-hover:opacity-100 group-hover:text-red-400" />
                    </span>
                  </Link>
                  <div><ChangeTypeBadge type={change.changeType} /></div>
                  <p className="text-sm leading-relaxed text-gray-400">{change.description}</p>
                  <div className="flex justify-end"><DeltaBadge delta={change.winRateDelta} /></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

// ── Main client component ─────────────────────────────────────────────────────

export function PatchesClient() {
  const [selectedId, setSelectedId] = useState<string>(MOCK_PATCHES[0].id);
  const patch = MOCK_PATCHES.find((p) => p.id === selectedId)!;

  const gainers = [...patch.heroChanges]
    .filter((c) => c.winRateDelta > 0)
    .sort((a, b) => b.winRateDelta - a.winRateDelta);

  const losers = [...patch.heroChanges]
    .filter((c) => c.winRateDelta < 0)
    .sort((a, b) => a.winRateDelta - b.winRateDelta);

  const hasChanges = patch.heroChanges.length > 0;

  return (
    <div className="min-h-screen bg-gray-950">
      {/* ── Page header ── */}
      <div className="border-b border-gray-800 bg-gray-900/40">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-600">
            <Link href="/" className="transition-colors hover:text-gray-400">Overview</Link>
            <ChevronRight size={12} />
            <span className="text-gray-400">Patch History</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                Patch <span className="text-red-500">Impact</span>
              </h1>
              <p className="mt-2 text-sm text-gray-500">
                {MOCK_PATCHES.length} patches tracked &middot; Select a patch to explore balance changes
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-amber-800/50 bg-amber-950/40 px-3 py-1.5">
              <Star size={12} className="text-amber-400" />
              <span className="text-xs font-semibold text-amber-400">Current: Patch 1.5</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <PatchSelector selectedId={selectedId} onSelect={setSelectedId} />
        <PatchOverviewBanner patch={patch} hasChanges={hasChanges} />
        <MetaShiftsSummary gainers={gainers} losers={losers} hasChanges={hasChanges} patchLabel={patch.label} patchId={patch.id} />
        {hasChanges && (
          <section className="rounded-xl border border-gray-800 bg-gray-900/60 p-6">
            <SectionHeader
              title="Win-Rate Delta Chart"
              subtitle={`${patch.label} · impact per adjusted hero`}
              action={
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-500" /> Gained</span>
                  <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-red-500" /> Lost</span>
                </div>
              }
            />
            <PatchImpactBarChart heroChanges={patch.heroChanges} />
          </section>
        )}
        <PatchAdjustmentsLog patch={patch} hasChanges={hasChanges} />
        <div className="flex items-center justify-between border-t border-gray-800 pt-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-white">
            <ArrowLeft size={14} /> Overview
          </Link>
          <Link href="/meta" className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-900/30 transition-all hover:bg-red-500">
            Explore Hero Meta <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
