"use client";

import clsx from "clsx";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MOCK_MAPS } from "@/lib/mock/maps";
import { MAP_HERO_AFFINITIES } from "@/lib/mock/mapHeroAffinities";
import { pctFormat, deltaFormat } from "@/lib/utils/formatters";

interface MapStatsTableProps {
  heroId: string;
  baseWinRate: number;
}

const MODE_BADGE: Record<string, string> = {
  Domination: "bg-red-950/60 text-red-400 border border-red-900/50",
  Convoy: "bg-amber-950/60 text-amber-400 border border-amber-900/50",
  Convergence: "bg-blue-950/60 text-blue-400 border border-blue-900/50",
};

export function MapStatsTable({ heroId, baseWinRate }: MapStatsTableProps) {
  const rows = MOCK_MAPS.map((map) => {
    const delta = MAP_HERO_AFFINITIES[map.id]?.[heroId] ?? null;
    const effectiveWinRate = delta !== null ? baseWinRate + delta : null;
    return { map, delta, effectiveWinRate };
  }).sort((a, b) => {
    // Sort: positive deltas first, then null (no data), then negative
    if (a.delta === null && b.delta === null) return 0;
    if (a.delta === null) return 1;
    if (b.delta === null) return -1;
    return b.delta - a.delta;
  });

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900/40">
      <table className="w-full min-w-[520px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Map
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
              Mode
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
              Eff. Win Rate
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
              Delta
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
              Performance
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ map, delta, effectiveWinRate }, i) => {
            const isPositive = delta !== null && delta > 0.01;
            const isNegative = delta !== null && delta < -0.01;

            return (
              <tr
                key={map.id}
                className={clsx(
                  "border-b border-gray-800/60",
                  i % 2 !== 0 && "bg-gray-900/20"
                )}
              >
                {/* Map name */}
                <td className="px-4 py-3">
                  <span className="font-semibold text-white">{map.name}</span>
                </td>

                {/* Game mode */}
                <td className="px-4 py-3">
                  <span
                    className={clsx(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      MODE_BADGE[map.gameMode]
                    )}
                  >
                    {map.gameMode}
                  </span>
                </td>

                {/* Effective win rate */}
                <td className="px-4 py-3 text-right tabular-nums">
                  {effectiveWinRate !== null ? (
                    <span
                      className={clsx(
                        "font-bold",
                        isPositive
                          ? "text-green-400"
                          : isNegative
                          ? "text-red-400"
                          : "text-gray-300"
                      )}
                    >
                      {pctFormat(effectiveWinRate)}
                    </span>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>

                {/* Delta */}
                <td className="px-4 py-3 text-right tabular-nums">
                  {delta !== null ? (
                    <span
                      className={clsx(
                        "text-xs font-semibold",
                        isPositive
                          ? "text-green-400"
                          : isNegative
                          ? "text-red-400"
                          : "text-gray-500"
                      )}
                    >
                      {deltaFormat(delta)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-600">No data</span>
                  )}
                </td>

                {/* Performance icon */}
                <td className="px-4 py-3 text-right">
                  {isPositive ? (
                    <TrendingUp size={15} className="ml-auto text-green-400" />
                  ) : isNegative ? (
                    <TrendingDown size={15} className="ml-auto text-red-400" />
                  ) : (
                    <Minus size={15} className="ml-auto text-gray-600" />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
