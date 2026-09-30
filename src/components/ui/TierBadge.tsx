import type { Tier } from "@/lib/types/hero";

const TIER_STYLES: Record<Tier, string> = {
  S: "bg-amber-950/60 text-amber-400 border border-amber-700/50 shadow-sm shadow-amber-900/30",
  A: "bg-orange-950/60 text-orange-400 border border-orange-800/50",
  B: "bg-sky-950/60 text-sky-400 border border-sky-800/50",
  C: "bg-gray-800/60 text-gray-500 border border-gray-700/50",
};

interface TierBadgeProps {
  tier: Tier;
  size?: "sm" | "md" | "lg";
}

export function TierBadge({ tier, size = "sm" }: TierBadgeProps) {
  const sizeClass =
    size === "lg"
      ? "h-9 w-9 text-base font-black"
      : size === "md"
      ? "h-7 w-7 text-sm font-bold"
      : "h-5 w-5 text-xs font-bold";

  return (
    <span
      className={`inline-flex items-center justify-center rounded-md ${sizeClass} ${TIER_STYLES[tier]}`}
    >
      {tier}
    </span>
  );
}
