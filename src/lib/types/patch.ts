export type ChangeType = "buff" | "nerf" | "rework" | "new";

export interface PatchHeroChange {
  heroId: string;
  heroName: string;
  changeType: ChangeType;
  description: string;
  winRateDelta: number; // e.g. +0.04 means +4%
}

export interface Patch {
  id: string;
  label: string;
  releasedAt: string; // ISO date string
  summary: string;
  notes: string[];
  isMajor: boolean;
  heroChanges: PatchHeroChange[];
}
