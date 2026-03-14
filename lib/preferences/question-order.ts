import type { QuestionOrderMode } from "@/lib/types";

export const QUESTION_ORDER_COOKIE = "tic_question_order";
export const QUESTION_ORDER_MODES: QuestionOrderMode[] = [
  "sequential",
  "random",
  "unanswered_first",
  "weak_first",
];

export function normalizeQuestionOrderMode(
  input: string | undefined | null,
): QuestionOrderMode {
  return QUESTION_ORDER_MODES.includes(input as QuestionOrderMode)
    ? (input as QuestionOrderMode)
    : "sequential";
}

export function getQuestionOrderModeFromCookies(cookieStore: {
  get(name: string): { value: string } | undefined;
}) {
  return normalizeQuestionOrderMode(cookieStore.get(QUESTION_ORDER_COOKIE)?.value);
}

export function labelQuestionOrderMode(questionOrderMode: QuestionOrderMode) {
  if (questionOrderMode === "random") return "ランダム";
  if (questionOrderMode === "unanswered_first") return "未着手優先";
  if (questionOrderMode === "weak_first") return "苦手優先";
  return "順番どおり";
}
