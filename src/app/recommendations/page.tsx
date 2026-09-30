import type { Metadata } from "next";
import { RecommendationsClient } from "./RecommendationsClient";

export const metadata: Metadata = {
  title: "Pick Recommendations | RivalsPulse",
  description:
    "Get scored hero recommendations for Marvel Rivals filtered by role, rank, map, and playstyle. Powered by a live scoring formula using win rate, pick rate, trend, map affinity, and playstyle fit.",
};

export default function RecommendationsPage() {
  return <RecommendationsClient />;
}
