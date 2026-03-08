"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { ANSWER_MODE_COOKIE, normalizeAnswerMode } from "@/lib/preferences/answer-mode";
import {
  LEVEL_FILTER_COOKIE,
  LEVEL_BANDS,
  normalizeLevelBands,
  serializeLevelBands,
} from "@/lib/preferences/level-filter";
import { normalizeQuestionType, QUESTION_TYPE_COOKIE } from "@/lib/preferences/question-type";
import {
  normalizeQuestionSourceMode,
  QUESTION_SOURCE_COOKIE,
} from "@/lib/preferences/question-source";

export async function saveLevelBandsAction(formData: FormData) {
  const cookieStore = await cookies();
  const selected = normalizeLevelBands(
    formData.getAll("levelBand").map((value) => String(value)),
  );

  cookieStore.set(LEVEL_FILTER_COOKIE, serializeLevelBands(selected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  revalidatePath("/dashboard");
  revalidatePath("/learn");
  revalidatePath("/trial");
  revalidatePath("/");
}

export async function resetLevelBandsAction() {
  const cookieStore = await cookies();

  cookieStore.set(LEVEL_FILTER_COOKIE, serializeLevelBands(LEVEL_BANDS), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  revalidatePath("/dashboard");
  revalidatePath("/learn");
  revalidatePath("/trial");
  revalidatePath("/");
}

export async function saveQuestionTypeAction(formData: FormData) {
  const cookieStore = await cookies();
  const questionType = normalizeQuestionType(String(formData.get("questionType") ?? ""));

  cookieStore.set(QUESTION_TYPE_COOKIE, questionType, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  revalidatePath("/dashboard");
  revalidatePath("/learn");
  revalidatePath("/trial");
  revalidatePath("/");
}

export async function saveAnswerModeAction(formData: FormData) {
  const cookieStore = await cookies();
  const answerMode = normalizeAnswerMode(String(formData.get("answerMode") ?? ""));

  cookieStore.set(ANSWER_MODE_COOKIE, answerMode, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  revalidatePath("/dashboard");
  revalidatePath("/learn");
  revalidatePath("/trial");
  revalidatePath("/");
}

export async function saveQuestionSourceModeAction(formData: FormData) {
  const cookieStore = await cookies();
  const questionSourceMode = normalizeQuestionSourceMode(
    String(formData.get("questionSourceMode") ?? ""),
  );

  cookieStore.set(QUESTION_SOURCE_COOKIE, questionSourceMode, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 180,
  });

  revalidatePath("/dashboard");
  revalidatePath("/learn");
  revalidatePath("/trial");
  revalidatePath("/");
}
