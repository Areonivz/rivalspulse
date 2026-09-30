"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { HeroPatchHistory } from "@/lib/types/hero";

interface WinRateLineChartProps {
  data: HeroPatchHistory[];
  baseWinRate: number;
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  color: string;
  dataKey: string;
}

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-3 text-xs shadow-xl">
      <p className="mb-2 font-bold text-white">Patch {label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-400">{entry.name}:</span>
          <span className="font-semibold text-white">
            {(entry.value * 100).toFixed(1)}%
          </span>
        </div>
      ))}
    </div>
  );
};

const CustomLegend = ({
  payload,
}: {
  payload?: Array<{ value: string; color: string }>;
}) => {
  if (!payload) return null;
  return (
    <div className="flex items-center justify-center gap-5 pt-3">
      {payload.map((entry) => (
        <div key={entry.value} className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-gray-400">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export function WinRateLineChart({ data, baseWinRate }: WinRateLineChartProps) {
  const allValues = data.flatMap((d) => [d.winRate, d.pickRate]);
  const minVal = Math.floor(Math.min(...allValues) * 100 - 2) / 100;
  const maxVal = Math.ceil(Math.max(...allValues) * 100 + 2) / 100;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart
        data={data}
        margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#1f2937"
          vertical={false}
        />
        <XAxis
          dataKey="patch"
          tickFormatter={(v) => `P${v}`}
          tick={{ fill: "#6b7280", fontSize: 11 }}
          axisLine={{ stroke: "#374151" }}
          tickLine={false}
        />
        <YAxis
          domain={[minVal, maxVal]}
          tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
          tick={{ fill: "#6b7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
        {/* 50% reference line */}
        <ReferenceLine
          y={0.5}
          stroke="#374151"
          strokeDasharray="4 4"
          label={{
            value: "50%",
            position: "insideTopRight",
            fill: "#4b5563",
            fontSize: 10,
          }}
        />
        <Line
          type="monotone"
          dataKey="winRate"
          name="Win Rate"
          stroke="#ef4444"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#ef4444", strokeWidth: 0 }}
          activeDot={{ r: 6, fill: "#ef4444", stroke: "#1f2937", strokeWidth: 2 }}
        />
        <Line
          type="monotone"
          dataKey="pickRate"
          name="Pick Rate"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="5 3"
          dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }}
          activeDot={{ r: 5, fill: "#3b82f6", stroke: "#1f2937", strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
