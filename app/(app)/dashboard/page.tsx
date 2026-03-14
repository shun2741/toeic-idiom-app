import Link from "next/link";
import { cookies } from "next/headers";
import { ArrowRight, Clock3, Sparkles } from "lucide-react";

import { AnswerModeForm } from "@/components/preferences/answer-mode-form";
import { LevelFilterForm } from "@/components/preferences/level-filter-form";
import { QuestionOrderForm } from "@/components/preferences/question-order-form";
import { QuestionTypeForm } from "@/components/preferences/question-type-form";
import { QuestionSourceForm } from "@/components/preferences/question-source-form";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLevelBandsFromCookies, labelLevelBand } from "@/lib/preferences/level-filter";
import { getQuestionTypeFromCookies, labelQuestionType } from "@/lib/preferences/question-type";
import { getAnswerModeFromCookies, labelAnswerMode } from "@/lib/preferences/answer-mode";
import {
  getQuestionOrderModeFromCookies,
  labelQuestionOrderMode,
} from "@/lib/preferences/question-order";
import {
  getQuestionSourceModeFromCookies,
  labelQuestionSourceMode,
} from "@/lib/preferences/question-source";
import { Progress } from "@/components/ui/progress";
import { getDashboardStats, getRecentAnswers, selectLearnQuestion } from "@/lib/data/repository";
import { requireUser } from "@/lib/supabase/auth";
import { formatDateTime } from "@/lib/utils";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const selectedBands = getLevelBandsFromCookies(cookieStore);
  const selectedQuestionType = getQuestionTypeFromCookies(cookieStore);
  const selectedAnswerMode = getAnswerModeFromCookies(cookieStore);
  const selectedQuestionSourceMode = getQuestionSourceModeFromCookies(cookieStore);
  const selectedQuestionOrderMode = getQuestionOrderModeFromCookies(cookieStore);
  const { user, supabase } = await requireUser();
  const [stats, recentAnswers, learnSelection] = await Promise.all([
    getDashboardStats(supabase, user.id),
    getRecentAnswers(supabase, user.id),
    selectLearnQuestion(
      supabase,
      user.id,
      selectedBands,
      selectedQuestionType,
      selectedQuestionSourceMode,
      selectedQuestionOrderMode,
    ),
  ]);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="animate-fade-up overflow-hidden border-border/80 bg-white">
          <CardHeader className="space-y-4">
            <Badge className="w-fit bg-primary/10 text-primary">ダッシュボード</Badge>
            <CardTitle className="text-3xl text-slate-950 sm:text-4xl">
              {stats.todayCount === 0 ? "まずは今日の1問目から始めましょう" : "今日の学習状況を確認して、次の1問に進めます"}
            </CardTitle>
            <CardDescription className="max-w-xl text-base leading-7 text-slate-600">
              {learnSelection.question
                ? `次のおすすめは「${learnSelection.question.prompt}」です。学習数、復習対象、出題設定をひとつの画面で確認できます。`
                : "学習数、復習対象、出題設定をひとつの画面で確認できます。"}
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
                <p className="text-sm font-semibold text-slate-500">総問題数</p>
                <p className="mt-2 text-2xl font-bold text-slate-950">{stats.totalQuestions} 問</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/learn">
                <Button size="lg">{stats.todayCount === 0 ? "最初の1問を始める" : "次の1問に進む"}</Button>
              </Link>
              <Link href="/review">
                <Button size="lg" variant="outline">
                  {stats.dueReviewCount > 0 ? "今日の復習を優先する" : "復習に進む"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up border-border/80 bg-white" style={{ animationDelay: "120ms" }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="h-5 w-5 text-primary" />
              今日の進捗
            </CardTitle>
            <CardDescription>まずは 10 問を目安に、短時間でも継続できる設計です。</CardDescription>
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
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {stats.dueReviewCount > 0
                  ? "忘れかける前に回収すると、同じ問題に何度も悩みにくくなります。"
                  : "今日の復習は一通り回収できています。新規学習に進めます。"}
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <StatsGrid stats={stats} />

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="animate-fade-up border-border/80 bg-white">
          <CardHeader>
            <CardTitle>現在の出題設定</CardTitle>
            <CardDescription>
              通常学習では {labelQuestionType(selectedQuestionType)} / {labelAnswerMode(selectedAnswerMode)} / {labelQuestionSourceMode(selectedQuestionSourceMode)} / {labelQuestionOrderMode(selectedQuestionOrderMode)} を使います。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <div className="rounded-2xl border border-border bg-white p-4 text-sm leading-7 text-slate-600">
              <p>全体: {stats.totalIdioms} 熟語 / {stats.totalQuestions} 問</p>
              <p>現在の出題母集団: {learnSelection.poolCount} 問</p>
              <p>チェック済み問題: {learnSelection.checkedIdiomsCount} 件</p>
              <p>出題モード: {labelQuestionOrderMode(selectedQuestionOrderMode)}</p>
              <p>レベル: {selectedBands.map(labelLevelBand).join(" / ")}</p>
            </div>
            <QuestionSourceForm
              checkedCount={learnSelection.checkedIdiomsCount}
              selectedMode={selectedQuestionSourceMode}
            />
            <QuestionOrderForm selectedMode={selectedQuestionOrderMode} />
            <AnswerModeForm selectedMode={selectedAnswerMode} />
            <QuestionTypeForm selectedType={selectedQuestionType} />
            <LevelFilterForm selectedBands={selectedBands} />
          </CardContent>
        </Card>

        <Card className="animate-fade-up border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock3 className="h-5 w-5 text-primary" />
              直近の回答
            </CardTitle>
            <CardDescription>最近の学習結果を最大 6 件表示します。</CardDescription>
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
                      <p className="text-sm font-semibold text-slate-500">{answer.question?.prompt}</p>
                      <p className="mt-1 text-lg font-bold text-slate-950">
                        {answer.question?.correctAnswer ?? "-"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {answer.question ? labelQuestionType(answer.question.questionType) : "-"}
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
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr]">
        <Card className="animate-fade-up border-border/80 bg-white" style={{ animationDelay: "120ms" }}>
          <CardHeader>
            <CardTitle>使い方</CardTitle>
            <CardDescription>迷わず進められるように、学習の流れを 3 段階に整理しています。</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "1. 通常学習",
                body: "その日の設定に合わせて、英熟語または和訳の問題に取り組みます。",
              },
              {
                title: "2. 採点",
                body: "回答後すぐに正誤とフィードバックを確認できます。",
              },
              {
                title: "3. 復習",
                body: "苦手な問題は復習キューに入り、次回の見直しにつながります。",
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
