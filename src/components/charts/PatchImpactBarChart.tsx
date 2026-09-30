"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { PatchHeroChange } from "@/lib/types/patch";

interface PatchImpactBarChartProps {
  heroChanges: PatchHeroChange[];
}

interface TooltipPayload {
  payload: PatchHeroChange;
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const d = payload[0].payload;
  const isPositive = d.winRateDelta >= 0;
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2.5 text-xs shadow-xl">
      <p className="font-bold text-white">{d.heroName}</p>
      <p className="mt-0.5 capitalize text-gray-400">{d.changeType}</p>
      <p
        className={`mt-1 font-semibold ${
          isPositive ? "text-green-400" : "text-red-400"
        }`}
      >
        {isPositive ? "▲" : "▼"} {isPositive ? "+" : ""}
        {(d.winRateDelta * 100).toFixed(1)}% win rate
      </p>
    </div>
  );
};

export function PatchImpactBarChart({ heroChanges }: PatchImpactBarChartProps) {
  if (heroChanges.length === 0) return null;

  const data = [...heroChanges].sort(
    (a, b) => b.winRateDelta - a.winRateDelta
  );

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, data.length * 52)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1f2937"
          horizontal={false}
        />
        <XAxis
          type="number"
          tickFormatter={(v) => `${v > 0 ? "+" : ""}${(v * 100).toFixed(1)}%`}
          tick={{ fill: "#6b7280", fontSize: 11 }}
          axisLine={{ stroke: "#374151" }}
          tickLine={false}
          domain={["auto", "auto"]}
        />
        <YAxis
          type="category"
          dataKey="heroName"
          width={130}
          tick={{ fill: "#d1d5db", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: "rgba(255,255,255,0.04)" }}
        />
        <ReferenceLine x={0} stroke="#374151" strokeWidth={1.5} />
        <Bar dataKey="winRateDelta" radius={[0, 4, 4, 0]} maxBarSize={22}>
          {data.map((entry) => (
            <Cell
              key={entry.heroId}
              fill={entry.winRateDelta >= 0 ? "#22c55e" : "#ef4444"}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
