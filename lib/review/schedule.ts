import type { Judgment } from "@/lib/types";

export function computeReviewIntervalDays(
  judgment: Judgment,
  consecutiveCorrect: number,
) {
  if (judgment === "incorrect") {
    return 1;
  }

  if (judgment === "almost_correct") {
    return 2;
  }

  return Math.min(4 + Math.max(0, consecutiveCorrect - 1) * 3, 21);
}
