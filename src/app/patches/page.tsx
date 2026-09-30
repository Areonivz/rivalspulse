import type { Metadata } from "next";
import { PatchesClient } from "./PatchesClient";

export const metadata: Metadata = {
  title: "Patch Impact | RivalsPulse",
  description:
    "Explore every Marvel Rivals balance patch from 1.0 to 1.5. See which heroes gained or lost win rate, read full developer notes, and visualise meta shifts with interactive charts.",
};

export default function PatchesPage() {
  return <PatchesClient />;
}
