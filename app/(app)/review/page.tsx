import Link from "next/link";

import { LearnSession } from "@/components/learn/learn-session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { selectReviewQuestion } from "@/lib/data/repository";
import { requireUser } from "@/lib/supabase/auth";

export default async function ReviewPage() {
  const { user, supabase } = await requireUser();
  const { question, dueCount } = await selectReviewQuestion(supabase, user.id);

  if (!question) {
    return (
      <Card className="animate-fade-up border-border/80 bg-white">
        <CardHeader>
          <CardTitle className="text-2xl">復習</CardTitle>
          <CardDescription>現在、期日が来ている復習問題はありません。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Link href="/learn">
            <Button>通常学習へ</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline">ダッシュボードへ戻る</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="animate-fade-up border-border/80 bg-white">
        <CardHeader>
          <CardTitle className="text-2xl">復習キュー</CardTitle>
          <CardDescription>
            期日が来ている問題だけを出題します。現在 {dueCount} 問が対象です。復習は学習レベル設定に関係なく優先して出題します。
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <LearnSession dueCount={dueCount} mode="review" question={question} />
        </CardContent>
      </Card>
    </div>
  );
}
