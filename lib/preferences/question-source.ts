import type { QuestionSourceMode } from "@/lib/types";

export const QUESTION_SOURCE_COOKIE = "tic_question_source";
export const QUESTION_SOURCE_MODES: QuestionSourceMode[] = ["all", "checked_only"];

export function normalizeQuestionSourceMode(
  input: string | undefined | null,
): QuestionSourceMode {
  return QUESTION_SOURCE_MODES.includes(input as QuestionSourceMode)
    ? (input as QuestionSourceMode)
    : "all";
}

export function getQuestionSourceModeFromCookies(cookieStore: {
  get(name: string): { value: string } | undefined;
}) {
  return normalizeQuestionSourceMode(cookieStore.get(QUESTION_SOURCE_COOKIE)?.value);
}

export function labelQuestionSourceMode(questionSourceMode: QuestionSourceMode) {
  return questionSourceMode === "checked_only" ? "チェック済みのみ" : "全問題";
}
