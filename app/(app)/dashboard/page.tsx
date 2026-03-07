import Link from "next/link";
import { ArrowRight, Clock3, Sparkles } from "lucide-react";

import { StatsGrid } from "@/components/dashboard/stats-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getDashboardStats, getRecentAnswers } from "@/lib/data/repository";
import { requireUser } from "@/lib/supabase/auth";
import { formatDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const { user, supabase } = await requireUser();
  const [stats, recentAnswers] = await Promise.all([
    getDashboardStats(supabase, user.id),
    getRecentAnswers(supabase, user.id),
  ]);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="animate-fade-up overflow-hidden border-border/80 bg-white">
          <CardHeader className="space-y-4">
            <Badge className="w-fit bg-primary/10 text-primary">学習ホーム</Badge>
            <CardTitle className="text-3xl text-slate-950 sm:text-4xl">
              今日の復習と新規学習を、同じ流れで回せます
            </CardTitle>
            <CardDescription className="max-w-xl text-base leading-7 text-slate-600">
              学習履歴と復習キューをまとめて見ながら、すぐ次のセッションに進める構成です。
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">今日の学習</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{stats.todayCount} 問</p>
              </div>
              <div className="rounded-2xl border border-border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">復習待ち</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{stats.dueReviewCount} 問</p>
              </div>
              <div className="rounded-2xl border border-border bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-500">連続正答</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{stats.currentStreak} 回</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/learn">
                <Button size="lg">通常学習を始める</Button>
              </Link>
              <Link href="/review">
                <Button size="lg" variant="outline">
                  復習に進む
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up border-border/80 bg-white" style={{ animationDelay: "120ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" />
              今日の進み具合
            </CardTitle>
            <CardDescription>最低 10 問を目安に、無理なく継続できるペースです。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
                <span>目標達成度</span>
                <span>{Math.min(stats.todayCount, 10)}/10</span>
              </div>
              <Progress value={(Math.min(stats.todayCount, 10) / 10) * 100} />
            </div>
            <div className="rounded-2xl border border-border bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">本日対応が必要な復習</p>
              <p className="mt-1 text-3xl font-bold text-slate-950">{stats.dueReviewCount} 問</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <StatsGrid stats={stats} />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="animate-fade-up border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-primary" />
              直近の回答
            </CardTitle>
            <CardDescription>最近の学習ログを最大 6 件表示します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAnswers.length === 0 ? (
              <div className="rounded-2xl border border-border bg-slate-50 p-5 text-sm text-slate-500">
                まだ回答履歴がありません。学習を始めるとここに履歴が表示されます。
              </div>
            ) : (
              recentAnswers.map((answer) => (
                <div key={answer.id} className="rounded-2xl border border-border bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">{answer.question?.promptJa}</p>
                      <p className="mt-1 text-lg font-bold text-slate-950">
                        {answer.question?.correctAnswer ?? "-"}
                      </p>
                    </div>
                    <Badge
                      className={
                        answer.judgment === "correct"
                          ? "bg-emerald-100 text-emerald-700"
                          : answer.judgment === "almost_correct"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-rose-100 text-rose-700"
                      }
                    >
                      {answer.judgment}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{formatDateTime(answer.answered_at)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-up border-border/80 bg-white" style={{ animationDelay: "120ms" }}>
          <CardHeader>
            <CardTitle>使い方</CardTitle>
            <CardDescription>学習の流れを簡潔に固定して、継続しやすくしています。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "1. 通常学習",
                body: "日本語の意味を見て、英熟語を自由入力します。",
              },
              {
                title: "2. 採点",
                body: "完全一致・軽微ミスをルールで判定し、曖昧な時だけ AI に回します。",
              },
              {
                title: "3. 復習",
                body: "結果に応じて 1, 2, 4 日以上で再出題されます。",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-border bg-slate-50 p-5">
                <p className="text-base font-bold text-slate-950">{item.title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{item.body}</p>
              </div>
            ))}
          </CardContent>
          <CardContent className="pt-0">
            <Link
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
              href="/learn"
            >
              学習画面へ移動
              <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
