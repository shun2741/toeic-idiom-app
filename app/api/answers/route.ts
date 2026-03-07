import { NextResponse } from "next/server";

import { getQuestionById } from "@/lib/data/idioms";
import { persistAnswer } from "@/lib/data/repository";
import { gradeAnswer } from "@/lib/scoring";
import { normalizeAnswer } from "@/lib/scoring/normalize";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasServerSupabaseEnv } from "@/lib/supabase/env";

type SubmitPayload = {
  questionId?: string;
  answer?: string;
  mode?: "learn" | "review";
};

export async function POST(request: Request) {
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

  const payload = (await request.json()) as SubmitPayload;
  const question = payload.questionId ? getQuestionById(payload.questionId) : null;

  if (!question || !payload.answer) {
    return NextResponse.json({ error: "入力値が不足しています。" }, { status: 400 });
  }

  try {
    const result = await gradeAnswer({
      supabase,
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
