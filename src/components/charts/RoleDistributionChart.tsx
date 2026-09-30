"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RoleCount {
  role: string;
  count: number;
  avgWinRate: number;
}

interface RoleDistributionChartProps {
  data: RoleCount[];
}

const COLORS: Record<string, string> = {
  Vanguard: "#3b82f6",
  Duelist: "#ef4444",
  Strategist: "#22c55e",
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: RoleCount }> }) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs shadow-xl">
        <p className="font-bold text-white">{d.role}</p>
        <p className="text-gray-400">{d.count} heroes</p>
        <p className="text-gray-400">Avg win rate: {(d.avgWinRate * 100).toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

export function RoleDistributionChart({ data }: RoleDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={65}
          outerRadius={95}
          paddingAngle={3}
          dataKey="count"
          nameKey="role"
        >
          {data.map((entry) => (
            <Cell
              key={entry.role}
              fill={COLORS[entry.role] ?? "#6b7280"}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span className="text-xs text-gray-400">{value}</span>
          )}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
