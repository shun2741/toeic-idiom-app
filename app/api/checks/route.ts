import { NextResponse } from "next/server";
import { z } from "zod";

import { getOptionalUser } from "@/lib/supabase/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasServerSupabaseEnv } from "@/lib/supabase/env";

const payloadSchema = z.object({
  idiomId: z.string().min(1).max(120),
  checked: z.boolean(),
});

export async function POST(request: Request) {
  if (!hasServerSupabaseEnv()) {
    return NextResponse.json({ error: "Supabase が未設定です。" }, { status: 500 });
  }

  const { user, supabase } = await getOptionalUser();

  if (!user) {
    return NextResponse.json({ error: "ログインが必要です。" }, { status: 401 });
  }

  const parsed = payloadSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "入力形式が不正です。" }, { status: 400 });
  }

  const { idiomId, checked } = parsed.data;

  if (checked) {
    const { error } = await supabase.from("checked_idioms").upsert(
      {
        user_id: user.id,
        idiom_id: idiomId,
      },
      {
        onConflict: "user_id,idiom_id",
      },
    );

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "チェック登録に失敗しました。migration を適用してください。" },
        { status: 500 },
      );
    }
  } else {
    const { error } = await supabase
      .from("checked_idioms")
      .delete()
      .eq("user_id", user.id)
      .eq("idiom_id", idiomId);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "チェック解除に失敗しました。migration を適用してください。" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
