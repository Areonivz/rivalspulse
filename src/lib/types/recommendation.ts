import type { Role, RankBand, Tier } from "./hero";

export interface Recommendation {
  heroId: string;
  heroName: string;
  role: Role;
  tier: Tier;
  winRate: number;
  pickRate: number;
  mapWinRate: number;
  score: number;
  reasoning: string;
  synergyTip: string;
  counterTip: string;
  rank: RankBand;
  mapId: string;
  mapName: string;
}
