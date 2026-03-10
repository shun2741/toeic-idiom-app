import type { QuestionType } from "@/lib/types";

export const QUESTION_TYPE_COOKIE = "tic_question_type";
export const QUESTION_TYPES: QuestionType[] = [
  "ja_to_idiom",
  "idiom_to_ja",
  "sentence_to_ja",
  "sentence_ja_to_en",
];

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
  if (questionType === "ja_to_idiom") {
    return "英熟語入力";
  }

  if (questionType === "sentence_to_ja") {
    return "例文和訳";
  }

  if (questionType === "sentence_ja_to_en") {
    return "例文英訳";
  }

  return "和訳入力";
}
