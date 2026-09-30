import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  delta?: string;
  deltaPositive?: boolean;
  icon?: LucideIcon;
  accent?: boolean;
}

export function StatCard({
  label,
  value,
  subValue,
  delta,
  deltaPositive,
  icon: Icon,
  accent = false,
}: StatCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 flex flex-col gap-3 transition-colors ${
        accent
          ? "border-red-900/50 bg-red-950/20 hover:border-red-800/60"
          : "border-gray-800 bg-gray-900/60 hover:border-gray-700"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </span>
        {Icon && (
          <span className={`rounded-md p-1.5 ${accent ? "bg-red-900/30 text-red-400" : "bg-gray-800 text-gray-400"}`}>
            <Icon size={14} />
          </span>
        )}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-bold tracking-tight text-white">
          {value}
        </span>
        {delta && (
          <span
            className={`mb-0.5 text-xs font-semibold ${
              deltaPositive ? "text-green-400" : "text-red-400"
            }`}
          >
            {delta}
          </span>
        )}
      </div>
      {subValue && (
        <span className="text-xs text-gray-500">{subValue}</span>
      )}
    </div>
  );
}
