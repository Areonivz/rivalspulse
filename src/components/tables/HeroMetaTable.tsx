"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createColumnHelper,
  tableFeatures,
  useTable,
  rowSortingFeature,
  createSortedRowModel,
  sortFn_alphanumeric,
} from "@tanstack/react-table";
import { ChevronUp, ChevronDown, ChevronsUpDown, TrendingUp, TrendingDown, Minus } from "lucide-react";
import clsx from "clsx";
import type { HeroStats, Role, RankBand } from "@/lib/types/hero";
import { RoleBadge } from "@/components/ui/RoleBadge";
import { TierBadge } from "@/components/ui/TierBadge";
import { pctFormat, kdaFormat } from "@/lib/utils/formatters";

// ─── Trend helper ─────────────────────────────────────────────────────────────
function getTrend(hero: HeroStats): { delta: number; label: string } {
  const history = hero.patchHistory;
  if (!history || history.length < 2) return { delta: 0, label: "—" };
  const prev = history[history.length - 2].winRate;
  const curr = history[history.length - 1].winRate;
  const delta = curr - prev;
  const sign = delta > 0 ? "+" : "";
  return { delta, label: `${sign}${(delta * 100).toFixed(1)}%` };
}

// ─── Role avatar bg ───────────────────────────────────────────────────────────
const ROLE_AVATAR_BG: Record<Role, string> = {
  Vanguard: "bg-blue-900/60 text-blue-300 border border-blue-700/50",
  Duelist: "bg-red-900/60 text-red-300 border border-red-700/50",
  Strategist: "bg-green-900/60 text-green-300 border border-green-700/50",
};

// ─── TanStack Table v9 – stable module-scoped references ──────────────────────
const features = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric },
});

const helper = createColumnHelper<typeof features, HeroStats>();

const columns = helper.columns([
  helper.accessor("name", {
    id: "hero",
    header: "Hero",
    enableSorting: true,
    sortFn: "alphanumeric",
    cell: (info) => {
      const hero = info.row.original;
      const initials = hero.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
      return (
        <div className="flex items-center gap-3">
          <span
            className={clsx(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
              ROLE_AVATAR_BG[hero.role]
            )}
          >
            {initials}
          </span>
          <span className="font-semibold text-white leading-tight">{hero.name}</span>
        </div>
      );
    },
  }),
  helper.accessor("role", {
    id: "role",
    header: "Role",
    enableSorting: true,
    sortFn: "alphanumeric",
    cell: (info) => <RoleBadge role={info.getValue()} />,
  }),
  helper.accessor("tier", {
    id: "tier",
    header: "Tier",
    enableSorting: true,
    sortFn: "alphanumeric",
    cell: (info) => <TierBadge tier={info.getValue()} size="md" />,
  }),
  helper.accessor("winRate", {
    id: "winRate",
    header: "Win Rate",
    enableSorting: true,
    cell: (info) => {
      const v = info.getValue();
      const pct = v * 100;
      return (
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              "font-semibold tabular-nums",
              pct >= 54 ? "text-amber-400" : pct >= 51 ? "text-green-400" : pct >= 48 ? "text-gray-200" : "text-red-400"
            )}
          >
            {pctFormat(v)}
          </span>
          <div className="hidden sm:block w-16 h-1.5 rounded-full bg-gray-800 overflow-hidden">
            <div
              className={clsx(
                "h-full rounded-full",
                pct >= 54 ? "bg-amber-400" : pct >= 51 ? "bg-green-500" : pct >= 48 ? "bg-blue-500" : "bg-red-500"
              )}
              style={{ width: `${Math.min(((pct - 44) / 20) * 100, 100)}%` }}
            />
          </div>
        </div>
      );
    },
  }),
  helper.accessor("pickRate", {
    id: "pickRate",
    header: "Pick Rate",
    enableSorting: true,
    cell: (info) => (
      <span className="tabular-nums text-gray-300">{pctFormat(info.getValue())}</span>
    ),
  }),
  helper.accessor("avgKda", {
    id: "kda",
    header: "KDA",
    enableSorting: true,
    cell: (info) => (
      <span className="tabular-nums text-gray-300">{kdaFormat(info.getValue())}</span>
    ),
  }),
  helper.display({
    id: "trend",
    header: "Trend",
    enableSorting: false,
    cell: (info) => {
      const { delta, label } = getTrend(info.row.original);
      if (delta === 0)
        return <span className="flex items-center gap-1 text-xs text-gray-600"><Minus size={12} /> —</span>;
      if (delta > 0)
        return (
          <span className="flex items-center gap-1 text-xs font-semibold text-green-400">
            <TrendingUp size={13} />{label}
          </span>
        );
      return (
        <span className="flex items-center gap-1 text-xs font-semibold text-red-400">
          <TrendingDown size={13} />{label}
        </span>
      );
    },
  }),
]);

// ─── Filter constants ─────────────────────────────────────────────────────────
const RANK_OPTIONS: { label: string; value: RankBand | "All Ranks" }[] = [
  { label: "All Ranks", value: "All Ranks" },
  { label: "Bronze – Silver", value: "Bronze-Silver" },
  { label: "Gold – Platinum", value: "Gold-Platinum" },
  { label: "Diamond – GM", value: "Diamond-Grandmaster" },
  { label: "Celestial+", value: "Celestial+" },
];

const ROLE_OPTIONS: (Role | "All")[] = ["All", "Vanguard", "Duelist", "Strategist"];

// ─── Component ────────────────────────────────────────────────────────────────
interface HeroMetaTableProps {
  heroes: HeroStats[];
}

export function HeroMetaTable({ heroes }: HeroMetaTableProps) {
  const router = useRouter();
  const [roleFilter, setRoleFilter] = useState<Role | "All">("All");
  const [rankFilter, setRankFilter] = useState<RankBand | "All Ranks">("All Ranks");

  const filteredData = useMemo(() => {
    return heroes.filter((h) => {
      const roleMatch = roleFilter === "All" || h.role === roleFilter;
      const rankMatch =
        rankFilter === "All Ranks" || h.rankBand === rankFilter || h.rankBand === "All Ranks";
      return roleMatch && rankMatch;
    });
  }, [heroes, roleFilter, rankFilter]);

  const table = useTable(
    { features, columns, data: filteredData },
    (state) => ({ sorting: state.sorting })
  );

  return (
    <div className="space-y-4">
      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-lg border border-gray-800 bg-gray-900/60 p-1">
          {ROLE_OPTIONS.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={clsx(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                roleFilter === role
                  ? role === "All"
                    ? "bg-gray-700 text-white"
                    : role === "Vanguard"
                    ? "bg-blue-900/80 text-blue-300 border border-blue-700/60"
                    : role === "Duelist"
                    ? "bg-red-900/80 text-red-300 border border-red-700/60"
                    : "bg-green-900/80 text-green-300 border border-green-700/60"
                  : "text-gray-500 hover:text-gray-300"
              )}
            >
              {role}
            </button>
          ))}
        </div>
        <div className="relative">
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value as RankBand | "All Ranks")}
            className="appearance-none rounded-lg border border-gray-800 bg-gray-900/60 py-2 pl-3 pr-8 text-xs font-semibold text-gray-300 focus:border-gray-600 focus:outline-none cursor-pointer hover:border-gray-700 transition-colors"
          >
            {RANK_OPTIONS.map((o) => (
              <option key={o.value} value={o.value} className="bg-gray-900">
                {o.label}
              </option>
            ))}
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
        </div>
        <span className="ml-auto text-xs text-gray-600">
          {filteredData.length} hero{filteredData.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/40">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id} className="border-b border-gray-800">
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  return (
                    <th
                      key={header.id}
                      onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      className={clsx(
                        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 select-none whitespace-nowrap",
                        canSort && "cursor-pointer hover:text-gray-300 transition-colors"
                      )}
                    >
                      <div className="flex items-center gap-1.5">
                        {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                        {canSort && (
                          <span className="shrink-0 text-gray-700">
                            {sorted === "asc" ? (
                              <ChevronUp size={13} className="text-red-400" />
                            ) : sorted === "desc" ? (
                              <ChevronDown size={13} className="text-red-400" />
                            ) : (
                              <ChevronsUpDown size={13} />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-sm text-gray-600">
                  No heroes match the selected filters.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row, i) => (
                <tr
                  key={row.id}
                  onClick={() => router.push(`/heroes/${row.original.id}`)}
                  className={clsx(
                    "cursor-pointer border-b border-gray-800/60 transition-colors hover:bg-gray-800/50",
                    i % 2 !== 0 && "bg-gray-900/20"
                  )}
                >
                  {row.getAllCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      <table.FlexRender cell={cell} />
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-700">
        Click any row to view hero details &middot; Click a column header to sort
      </p>
    </div>
  );
}
