"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface WinRateEntry {
  name: string;
  winRate: number;
  role: string;
}

interface WinRateBarChartProps {
  data: WinRateEntry[];
}

const ROLE_COLORS: Record<string, string> = {
  Vanguard: "#3b82f6",
  Duelist: "#ef4444",
  Strategist: "#22c55e",
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: WinRateEntry }> }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs shadow-xl">
        <p className="font-bold text-white">{d.name}</p>
        <p className="text-gray-400">{d.role}</p>
        <p className="font-semibold text-white">{(d.winRate * 100).toFixed(1)}% win rate</p>
      </div>
    );
  }
  return null;
};

export function WinRateBarChart({ data }: WinRateBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" horizontal={false} />
        <XAxis
          type="number"
          domain={[0.44, 0.62]}
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
          tick={{ fill: "#6b7280", fontSize: 11 }}
          axisLine={{ stroke: "#374151" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="name"
          width={110}
          tick={{ fill: "#d1d5db", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
        <Bar dataKey="winRate" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {data.map((entry) => (
            <Cell
              key={entry.name}
              fill={ROLE_COLORS[entry.role] ?? "#6b7280"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
