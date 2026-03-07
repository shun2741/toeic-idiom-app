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
        <Card className="animate-fade-up overflow-hidden border-primary/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white">
          <CardHeader className="space-y-4">
            <Badge className="w-fit bg-white/10 text-white">MVP Dashboard</Badge>
            <CardTitle className="text-3xl text-white sm:text-4xl">
              今日の復習と新規学習を、同じ流れで回せます
            </CardTitle>
            <CardDescription className="max-w-xl text-base leading-7 text-slate-200">
              学習履歴と復習キューをまとめて見ながら、すぐ次のセッションに進める構成です。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/learn">
              <Button size="lg">通常学習を始める</Button>
            </Link>
            <Link href="/review">
              <Button size="lg" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                復習に進む
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="animate-fade-up border-white/80 bg-white/92" style={{ animationDelay: "120ms" }}>
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
            <div className="rounded-3xl bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-500">本日対応が必要な復習</p>
              <p className="mt-1 text-3xl font-bold text-slate-950">{stats.dueReviewCount} 問</p>
            </div>
          </CardContent>
        </Card>
      </section>

      <StatsGrid stats={stats} />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="animate-fade-up border-white/80 bg-white/92">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-primary" />
              直近の回答
            </CardTitle>
            <CardDescription>最近の学習ログを最大 6 件表示します。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAnswers.length === 0 ? (
              <div className="rounded-3xl bg-slate-50 p-5 text-sm text-slate-500">
                まだ回答履歴がありません。学習を始めるとここに履歴が表示されます。
              </div>
            ) : (
              recentAnswers.map((answer) => (
                <div key={answer.id} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
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

        <Card className="animate-fade-up border-white/80 bg-white/92" style={{ animationDelay: "120ms" }}>
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
              <div key={item.title} className="rounded-[26px] bg-slate-50 p-5">
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
