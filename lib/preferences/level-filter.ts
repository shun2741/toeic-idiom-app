import type { LevelBand } from "@/lib/types";

export const LEVEL_BANDS: LevelBand[] = ["700", "730", "780", "860"];
export const LEVEL_FILTER_COOKIE = "tic_level_bands";

export function normalizeLevelBands(input: string[] | undefined | null): LevelBand[] {
  const deduped = Array.from(
    new Set((input ?? []).filter((value): value is LevelBand => LEVEL_BANDS.includes(value as LevelBand))),
  );

  return deduped.length > 0 ? deduped : LEVEL_BANDS;
}

export function parseLevelBandsCookie(value: string | undefined) {
  if (!value) {
    return LEVEL_BANDS;
  }

  return normalizeLevelBands(
    value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

export function serializeLevelBands(levelBands: LevelBand[]) {
  return normalizeLevelBands(levelBands).join(",");
}

export function getLevelBandsFromCookies(cookieStore: {
  get(name: string): { value: string } | undefined;
}) {
  return parseLevelBandsCookie(cookieStore.get(LEVEL_FILTER_COOKIE)?.value);
}

export function labelLevelBand(levelBand: LevelBand) {
  return `TOEIC ${levelBand}`;
}
