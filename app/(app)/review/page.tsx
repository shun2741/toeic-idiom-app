import Link from "next/link";
import { cookies } from "next/headers";

import { LearnSession } from "@/components/learn/learn-session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats } from "@/lib/data/repository";
import { getAnswerModeFromCookies, labelAnswerMode } from "@/lib/preferences/answer-mode";
import { selectReviewQuestion } from "@/lib/data/repository";
import { requireUser } from "@/lib/supabase/auth";

export default async function ReviewPage() {
  const cookieStore = await cookies();
  const answerMode = getAnswerModeFromCookies(cookieStore);
  const { user, supabase } = await requireUser();
  const [{ question, dueCount, choiceOptions, isChecked }, stats] = await Promise.all([
    selectReviewQuestion(supabase, user.id),
    getDashboardStats(supabase, user.id),
  ]);

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
          <CardTitle className="text-2xl">復習セッション</CardTitle>
          <CardDescription>
            期日が来ている問題から順に出題します。間違えた熟語は、英訳・和訳・例文など関連形式もあわせて復習に回ります。現在の対象は {dueCount} 問で、回答形式は {labelAnswerMode(answerMode)} です。
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <LearnSession
            answerMode={answerMode}
            choiceOptions={choiceOptions}
            currentStreak={stats.currentStreak}
            dueCount={dueCount}
            isChecked={isChecked}
            mode="review"
            question={question}
            todayCount={stats.todayCount}
          />
        </CardContent>
      </Card>
      <Card className="animate-fade-up border-border/80 bg-white" style={{ animationDelay: "120ms" }}>
        <CardHeader>
          <CardTitle className="text-xl">いま復習する意味</CardTitle>
          <CardDescription>
            忘れかける前に回収すると、次回以降の負荷が軽くなります。
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">今日の復習対象</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{dueCount} 問</p>
          </div>
          <div className="rounded-2xl border border-border bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">苦手として残っている問題</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{stats.weakCount} 問</p>
          </div>
          <div className="rounded-2xl border border-border bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-500">今日の学習数</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{stats.todayCount} 問</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
