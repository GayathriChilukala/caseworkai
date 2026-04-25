import type { ConstituentCase } from "./types";
import seedData from "@/data/seed_cases.json";

export function getSeedCases(): ConstituentCase[] {
  return seedData as ConstituentCase[];
}
