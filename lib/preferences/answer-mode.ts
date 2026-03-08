import type { AnswerMode } from "@/lib/types";

export const ANSWER_MODE_COOKIE = "tic_answer_mode";
export const ANSWER_MODES: AnswerMode[] = ["free_text", "multiple_choice"];

export function normalizeAnswerMode(input: string | undefined | null): AnswerMode {
  return ANSWER_MODES.includes(input as AnswerMode)
    ? (input as AnswerMode)
    : "free_text";
}

export function getAnswerModeFromCookies(cookieStore: {
  get(name: string): { value: string } | undefined;
}) {
  return normalizeAnswerMode(cookieStore.get(ANSWER_MODE_COOKIE)?.value);
}

export function labelAnswerMode(answerMode: AnswerMode) {
  return answerMode === "free_text" ? "自由入力" : "選択式";
}
