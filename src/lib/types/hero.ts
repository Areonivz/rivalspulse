export type Role = "Vanguard" | "Duelist" | "Strategist";
export type Tier = "S" | "A" | "B" | "C";
export type RankBand =
  | "All Ranks"
  | "Bronze-Silver"
  | "Gold-Platinum"
  | "Diamond-Grandmaster"
  | "Celestial+";

export interface HeroMapStat {
  mapId: string;
  mapName: string;
  winRate: number;
  pickRate: number;
  sampleSize: number;
}

export interface HeroPatchHistory {
  patch: string;
  winRate: number;
  pickRate: number;
}

export interface HeroStats {
  id: string;
  name: string;
  role: Role;
  tier: Tier;
  winRate: number;
  pickRate: number;
  banRate: number;
  avgKda: number;
  patch: string;
  rankBand: RankBand;
  synergies: string[];
  counters: string[];
  mapStats?: HeroMapStat[];
  patchHistory?: HeroPatchHistory[];
}
