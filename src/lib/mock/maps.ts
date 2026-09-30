export interface GameMap {
  id: string;
  name: string;
  gameMode: "Domination" | "Convoy" | "Convergence";
  metaNotes: string;
}

export const MOCK_MAPS: GameMap[] = [
  { id: "yggsgard", name: "Yggsgard", gameMode: "Domination", metaNotes: "Vertical map favours aerial Duelists like Storm and Iron Man. Long sightlines on the bridge reward Hawkeye." },
  { id: "wakanda", name: "Wakanda", gameMode: "Convoy", metaNotes: "Dense cover around the payload path rewards melee flankers. Black Panther and Wolverine excel here." },
  { id: "symbiotic-surface", name: "Symbiotic Surface", gameMode: "Domination", metaNotes: "Close-quarter corridors favour Vanguard brawlers. Venom and Hulk can bully control points effectively." },
  { id: "tokyo-2099", name: "Tokyo 2099", gameMode: "Convergence", metaNotes: "Multi-level structure with flanking routes. Psylocke and Spider-Man leverage vertical mobility well." },
  { id: "spider-islands", name: "Spider-Islands", gameMode: "Domination", metaNotes: "Open mid-section punishes slow ultimates. Mobile Strategists like Luna Snow and Loki rotate efficiently." },
  { id: "hydra-charteris-base", name: "Hydra Charteris Base", gameMode: "Convoy", metaNotes: "Indoor corridors minimise aerial play. Doctor Strange and Groot control chokepoints well." },
  { id: "royal-palace", name: "Royal Palace", gameMode: "Convergence", metaNotes: "Symmetrical layout. Hawkeye and Moon Knight thrive with clear sightlines across the courtyard." },
  { id: "hall-of-djalia", name: "Hall of Djalia", gameMode: "Domination", metaNotes: "Newest map. High ceilings favour Storm and Iron Man. Healing corridors reward Strategist positioning." },
];
