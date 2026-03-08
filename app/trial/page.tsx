import { cookies } from "next/headers";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { LearnSession } from "@/components/learn/learn-session";
import { AnswerModeForm } from "@/components/preferences/answer-mode-form";
import { LevelFilterForm } from "@/components/preferences/level-filter-form";
import { QuestionTypeForm } from "@/components/preferences/question-type-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QUESTION_BANK } from "@/lib/data/idioms";
import { selectGuestLearnQuestion } from "@/lib/data/repository";
import { getAnswerModeFromCookies, labelAnswerMode } from "@/lib/preferences/answer-mode";
import { getLevelBandsFromCookies, labelLevelBand } from "@/lib/preferences/level-filter";
import { getQuestionTypeFromCookies, labelQuestionType } from "@/lib/preferences/question-type";

export const dynamic = "force-dynamic";

export default async function TrialPage({
  searchParams,
}: {
  searchParams: Promise<{ refresh?: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const params = await searchParams;
  const refresh =
    typeof params.refresh === "string"
      ? params.refresh
      : Array.isArray(params.refresh)
        ? params.refresh[0]
        : undefined;
  const selectedBands = getLevelBandsFromCookies(cookieStore);
  const selectedQuestionType = getQuestionTypeFromCookies(cookieStore);
  const selectedAnswerMode = getAnswerModeFromCookies(cookieStore);
  const learnSelection = selectGuestLearnQuestion(
    selectedBands,
    selectedQuestionType,
    refresh,
  );
  const { question, poolCount, choiceOptions, isChecked } = learnSelection;

  return (
    <main className="bg-grid min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <div className="space-y-6">
          <Card className="animate-fade-up border-border/80 bg-white">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <Badge className="w-fit bg-primary/10 text-primary">ログインなしで試す</Badge>
                <CardTitle className="text-3xl text-slate-950 sm:text-4xl">
                  保存せずに、そのまま学習を試せます
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7 text-slate-600">
                  回答の採点までは体験できます。履歴、復習予定、問題チェックを使う場合はログインしてください。
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/">
                  <Button>ログインして使う</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">トップへ戻る</Button>
                </Link>
              </div>
            </CardHeader>
          </Card>

          {question ? (
            <>
              <Card className="animate-fade-up border-border/80 bg-white">
                <CardHeader>
                  <CardTitle className="text-2xl">体験学習</CardTitle>
                  <CardDescription>
                    {labelQuestionType(selectedQuestionType)} / {labelAnswerMode(selectedAnswerMode)} で出題しています。
                    現在の母集団は {poolCount} 問、全体は {QUESTION_BANK.length} 問です。
                  </CardDescription>
                </CardHeader>
              </Card>

              <LearnSession
                allowChecking={false}
                answerMode={selectedAnswerMode}
                choiceOptions={choiceOptions}
                guestMode
                isChecked={isChecked}
                mode="learn"
                question={question}
              />
            </>
          ) : (
            <Card className="animate-fade-up border-border/80 bg-white">
              <CardHeader>
                <CardTitle className="text-2xl">体験学習</CardTitle>
                <CardDescription>
                  現在の条件に一致する問題がありません。設定を調整して出題範囲を変更してください。
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <details
            className="group animate-fade-up rounded-3xl border border-border/80 bg-white"
            style={{ animationDelay: "120ms" }}
            open={!question}
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5">
              <div>
                <p className="text-sm font-semibold text-slate-950">体験モードの設定</p>
                <p className="text-sm text-slate-600">
                  レベルは {selectedBands.map(labelLevelBand).join(" / ")}。必要なときだけ開けます。
                </p>
              </div>
              <ChevronDown className="h-5 w-5 text-slate-500 transition group-open:rotate-180" />
            </summary>
            <div className="grid gap-4 border-t border-border px-6 py-6 md:grid-cols-2">
              <AnswerModeForm
                description="スマホでは選択式、定着確認では自由入力という使い分けができます。"
                selectedMode={selectedAnswerMode}
              />
              <QuestionTypeForm
                description="英熟語を答える練習と、和訳を答える練習を切り替えられます。"
                selectedType={selectedQuestionType}
              />
              <LevelFilterForm
                description="体験モードでは選択したレベル帯だけを出題します。"
                selectedBands={selectedBands}
              />
              <Card className="border-border bg-slate-50">
                <CardHeader>
                  <CardTitle className="text-lg">体験モードでできること</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm leading-7 text-slate-600">
                  <p>採点結果と解説を確認できます。</p>
                  <p>「わからない」ボタンで答えをすぐ確認できます。</p>
                  <p>履歴保存、復習キュー、問題チェックはログイン後に利用できます。</p>
                </CardContent>
              </Card>
            </div>
          </details>
        </div>
      </div>
    </main>
  );
}
