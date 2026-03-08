import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getQuestionById } from "@/lib/data/idioms";
import { persistAnswer } from "@/lib/data/repository";
import { gradeAnswer, gradeGuestAnswer } from "@/lib/scoring";
import { normalizeAnswer } from "@/lib/scoring/normalize";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasServerSupabaseEnv } from "@/lib/supabase/env";

const GUEST_LLM_COOKIE = "tic_guest_llm_hits";
const GUEST_SUBMIT_COOKIE = "tic_guest_submit_hits";
const GUEST_LLM_LIMIT = 8;
const GUEST_LLM_WINDOW_MS = 10 * 60 * 1000;
const GUEST_SUBMIT_LIMIT = 80;
const GUEST_SUBMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

const submitPayloadSchema = z.object({
  questionId: z.string().min(1).max(100),
  answer: z.string().trim().min(1).max(120),
  mode: z.enum(["learn", "review"]).optional(),
  guestMode: z.boolean().optional(),
});

function getGuestLlmHits(request: NextRequest) {
  return getRecentCookieHits(request, GUEST_LLM_COOKIE, GUEST_LLM_WINDOW_MS);
}

function getGuestSubmitHits(request: NextRequest) {
  return getRecentCookieHits(request, GUEST_SUBMIT_COOKIE, GUEST_SUBMIT_WINDOW_MS);
}

function getRecentCookieHits(
  request: NextRequest,
  cookieName: string,
  windowMs: number,
) {
  const raw = request.cookies.get(cookieName)?.value;
  if (!raw) {
    return [];
  }

  const threshold = Date.now() - windowMs;
  return raw
    .split(".")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && value >= threshold);
}

export async function POST(request: NextRequest) {
  const parsed = submitPayloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "入力形式が不正です。120文字以内で回答してください。" },
      { status: 400 },
    );
  }

  const payload = parsed.data;
  const question = getQuestionById(payload.questionId);

  if (!question) {
    return NextResponse.json({ error: "入力値が不足しています。" }, { status: 400 });
  }

  try {
    if (payload.guestMode) {
      const guestSubmitHits = getGuestSubmitHits(request);
      if (guestSubmitHits.length >= GUEST_SUBMIT_LIMIT) {
        return NextResponse.json(
          { error: "体験モードの本日の利用上限に達しました。時間を空けるか、ログインして続けてください。" },
          { status: 429 },
        );
      }

      const guestHits = getGuestLlmHits(request);
      const result = await gradeGuestAnswer({
        question,
        submittedAnswer: payload.answer,
        llmRateLimited: guestHits.length >= GUEST_LLM_LIMIT,
      });

      const response = NextResponse.json({
        result,
        nextReviewAt: null,
        intervalDays: null,
      });

      if (result.source === "llm") {
        response.cookies.set(GUEST_LLM_COOKIE, [...guestHits, Date.now()].join("."), {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60,
        });
      }

      response.cookies.set(GUEST_SUBMIT_COOKIE, [...guestSubmitHits, Date.now()].join("."), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24,
      });

      return response;
    }

    if (!hasServerSupabaseEnv()) {
      return NextResponse.json(
        { error: "Supabase が未設定です。" },
        { status: 500 },
      );
    }

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
    }

    const result = await gradeAnswer({
      supabase,
      userId: user.id,
      question,
      submittedAnswer: payload.answer,
    });
    const normalizedAnswer = normalizeAnswer(payload.answer);
    const review = await persistAnswer({
      supabase,
      userId: user.id,
      question,
      submittedAnswer: payload.answer,
      normalizedAnswer,
      result,
    });

    return NextResponse.json({
      result,
      nextReviewAt: review.nextReviewAt,
      intervalDays: review.intervalDays,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "採点または保存に失敗しました。" },
      { status: 500 },
    );
  }
}
