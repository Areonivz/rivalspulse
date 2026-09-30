import Link from "next/link";
import type { HeroStats } from "@/lib/types/hero";
import { RoleBadge } from "./RoleBadge";
import { TierBadge } from "./TierBadge";
import { pctFormat } from "@/lib/utils/formatters";

interface HeroCardProps {
  hero: HeroStats;
  rank?: number;
}

const ROLE_GRADIENT: Record<string, string> = {
  Vanguard: "from-blue-950/60 to-gray-900/60",
  Duelist: "from-red-950/60 to-gray-900/60",
  Strategist: "from-green-950/60 to-gray-900/60",
};

export function HeroCard({ hero, rank }: HeroCardProps) {
  return (
    <Link href={`/heroes/${hero.id}`}>
      <div className={`group relative overflow-hidden rounded-xl border border-gray-800 bg-gradient-to-br ${ROLE_GRADIENT[hero.role]} p-5 transition-all hover:border-gray-600 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/40`}>
        {/* Rank badge */}
        {rank && (
          <span className="absolute top-3 right-3 text-xs font-bold text-gray-600">
            #{rank}
          </span>
        )}

        {/* Avatar placeholder */}
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-800 border border-gray-700 text-2xl font-black text-gray-300 select-none">
          {hero.name.charAt(0)}
        </div>

        {/* Name + badges */}
        <div className="mb-3 flex flex-col gap-1.5">
          <h3 className="text-sm font-bold text-white leading-tight group-hover:text-red-400 transition-colors">
            {hero.name}
          </h3>
          <div className="flex items-center gap-1.5">
            <RoleBadge role={hero.role} />
            <TierBadge tier={hero.tier} />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Win Rate</p>
            <p className="text-base font-bold text-white">{pctFormat(hero.winRate)}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wider text-gray-500">Pick Rate</p>
            <p className="text-base font-bold text-gray-300">{pctFormat(hero.pickRate)}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
