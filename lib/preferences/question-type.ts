import type { QuestionType } from "@/lib/types";

export const QUESTION_TYPE_COOKIE = "tic_question_type";
export const QUESTION_TYPES: QuestionType[] = ["ja_to_idiom", "idiom_to_ja"];

export function normalizeQuestionType(input: string | undefined | null): QuestionType {
  return QUESTION_TYPES.includes(input as QuestionType)
    ? (input as QuestionType)
    : "ja_to_idiom";
}

export function getQuestionTypeFromCookies(cookieStore: {
  get(name: string): { value: string } | undefined;
}, fallback?: QuestionType) {
  const value = cookieStore.get(QUESTION_TYPE_COOKIE)?.value;
  return value ? normalizeQuestionType(value) : (fallback ?? "ja_to_idiom");
}

export function labelQuestionType(questionType: QuestionType) {
  return questionType === "ja_to_idiom" ? "英熟語入力" : "和訳入力";
}
