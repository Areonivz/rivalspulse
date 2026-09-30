import type { Patch } from "@/lib/types/patch";

export const MOCK_PATCHES: Patch[] = [
  {
    id: "1.5", label: "Patch 1.5", releasedAt: "2024-11-15", summary: "The Symbiote Surge",
    notes: ["Venom receives a significant defensive buff, raising his win rate by ~4%.","Storm kit reworked — aerial mobility increased, ultimate cooldown reduced.","Iron Man nerfed: repulsor damage reduced 8%.","Cloak & Dagger healing radius increased 15%.","Map geometry adjustments to Yggsgard and Wakanda."],
    isMajor: true,
    heroChanges: [
      { heroId: "venom", heroName: "Venom", changeType: "buff", description: "Bonus armor increased. Lethal Protector cooldown -2s.", winRateDelta: 0.04 },
      { heroId: "storm", heroName: "Storm", changeType: "rework", description: "New air dash ability. Omega Hurricane cooldown -20%.", winRateDelta: 0.018 },
      { heroId: "iron-man", heroName: "Iron Man", changeType: "nerf", description: "Repulsor damage -8%. Hover speed -10%.", winRateDelta: -0.024 },
      { heroId: "cloak-and-dagger", heroName: "Cloak & Dagger", changeType: "buff", description: "Light of Hope healing radius +15%.", winRateDelta: 0.004 },
    ],
  },
  {
    id: "1.4", label: "Patch 1.4", releasedAt: "2024-10-01", summary: "Balance Pass — Supports & Tanks",
    notes: ["Luna Snow ultimate duration increased 6s to 8s.","Doctor Strange shield regeneration rate up.","Hulk rage meter decays slower out of combat.","Squirrel Girl damage reduced.","Jeff the Land Shark gets faster repositioning passive."],
    isMajor: false,
    heroChanges: [
      { heroId: "luna-snow", heroName: "Luna Snow", changeType: "buff", description: "Absolute Zero duration 6s -> 8s.", winRateDelta: 0.014 },
      { heroId: "doctor-strange", heroName: "Doctor Strange", changeType: "buff", description: "Shield regen rate +20%.", winRateDelta: 0.003 },
      { heroId: "hulk", heroName: "Hulk", changeType: "buff", description: "Rage decay out of combat -30%.", winRateDelta: 0.002 },
      { heroId: "squirrel-girl", heroName: "Squirrel Girl", changeType: "nerf", description: "All damage reduced 10%.", winRateDelta: -0.008 },
      { heroId: "jeff-the-land-shark", heroName: "Jeff the Land Shark", changeType: "buff", description: "+15% speed while submerged.", winRateDelta: 0.002 },
    ],
  },
  {
    id: "1.3", label: "Patch 1.3", releasedAt: "2024-08-20", summary: "Duelist Meta Shake-Up",
    notes: ["Psylocke psi-blade damage increased; ultimate tracking improved.","Spider-Man wall-cling duration reduced.","Moon Knight crescent dart spread tightened.","Hawkeye arrow velocity increased.","New map: Hall of Djalia (Domination)."],
    isMajor: true,
    heroChanges: [
      { heroId: "psylocke", heroName: "Psylocke", changeType: "buff", description: "Psi-blade +12%. Ultimate tracks after dash.", winRateDelta: 0.016 },
      { heroId: "spider-man", heroName: "Spider-Man", changeType: "nerf", description: "Wall-cling 3s -> 1.5s.", winRateDelta: -0.009 },
      { heroId: "moon-knight", heroName: "Moon Knight", changeType: "buff", description: "Crescent dart spread -25%.", winRateDelta: 0.006 },
      { heroId: "hawkeye", heroName: "Hawkeye", changeType: "buff", description: "Arrow velocity +20%.", winRateDelta: 0.01 },
    ],
  },
  {
    id: "1.2", label: "Patch 1.2", releasedAt: "2024-07-05", summary: "Season 1 Mid-Season Tuning",
    notes: ["Wolverine regen increased out of combat.","Adam Warlock soul revive 0.5s faster.","Black Panther daggers cooldown increased.","Magneto metal shield speed increased."],
    isMajor: false,
    heroChanges: [
      { heroId: "wolverine", heroName: "Wolverine", changeType: "buff", description: "Out-of-combat regen +25%.", winRateDelta: 0.007 },
      { heroId: "adam-warlock", heroName: "Adam Warlock", changeType: "buff", description: "Soul Bond revive delay -0.5s.", winRateDelta: 0.006 },
      { heroId: "black-panther", heroName: "Black Panther", changeType: "nerf", description: "Vibranium Daggers cooldown 6s -> 8s.", winRateDelta: -0.005 },
      { heroId: "magneto", heroName: "Magneto", changeType: "buff", description: "Metal Barrage projectile speed +15%.", winRateDelta: 0.001 },
    ],
  },
  {
    id: "1.1", label: "Patch 1.1", releasedAt: "2024-05-22", summary: "Launch Hotfix & Early Balance",
    notes: ["Bug fix: Doctor Strange portal boundary exploit.","Cloak & Dagger dagger stab tuned down.","Groot wall placement cooldown added.","Performance improvements on Symbiotic Surface."],
    isMajor: false,
    heroChanges: [
      { heroId: "doctor-strange", heroName: "Doctor Strange", changeType: "nerf", description: "Portal boundary exploit removed.", winRateDelta: 0.007 },
      { heroId: "cloak-and-dagger", heroName: "Cloak & Dagger", changeType: "nerf", description: "Dagger Stab damage -6%.", winRateDelta: -0.004 },
      { heroId: "groot", heroName: "Groot", changeType: "nerf", description: "Wall re-placement cooldown 2s added.", winRateDelta: -0.003 },
    ],
  },
  {
    id: "1.0", label: "Patch 1.0", releasedAt: "2024-04-10", summary: "Season 1 Launch",
    notes: ["Marvel Rivals Season 1 launched with 30 heroes.","8 maps available at launch.","Ranked mode unlocked at account level 10.","Initial roster balanced for 2-2-2 composition."],
    isMajor: true,
    heroChanges: [],
  },
];
