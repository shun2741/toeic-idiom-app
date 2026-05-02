import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getOptionalUser } from "@/lib/supabase/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasServerSupabaseEnv } from "@/lib/supabase/env";

const payloadSchema = z.object({
  questionId: z.string().min(1).max(100),
  content: z.string().max(500),
});

export async function GET(request: NextRequest) {
  if (!hasServerSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 500 });
  }

  const questionId = request.nextUrl.searchParams.get("questionId");
  if (!questionId) {
    return NextResponse.json({ error: "questionId が必要です。" }, { status: 400 });
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("shared_question_notes")
    .select("content, updated_at")
    .eq("question_id", questionId)
    .maybeSingle();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "共有メモの取得に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({
    note: data
      ? {
          content: data.content,
          updatedAt: data.updated_at,
        }
      : null,
  });
}

export async function POST(request: NextRequest) {
  if (!hasServerSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 500 });
  }

  const parsed = payloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "入力形式が不正です。" }, { status: 400 });
  }

  const { user, supabase } = await getOptionalUser();
  if (!user) {
    return NextResponse.json({ error: "共有に反映するにはログインが必要です。" }, { status: 401 });
  }

  const content = parsed.data.content.trim();

  if (!content) {
    const { error } = await supabase
      .from("shared_question_notes")
      .delete()
      .eq("question_id", parsed.data.questionId);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "共有メモの削除に失敗しました。" }, { status: 500 });
    }

    return NextResponse.json({ note: null });
  }

  const { data, error } = await supabase
    .from("shared_question_notes")
    .upsert(
      {
        question_id: parsed.data.questionId,
        content,
        updated_by: user.id,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "question_id",
      },
    )
    .select("content, updated_at")
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "共有メモの反映に失敗しました。" }, { status: 500 });
  }

  return NextResponse.json({
    note: {
      content: data.content,
      updatedAt: data.updated_at,
    },
  });
}
