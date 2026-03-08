import { cookies } from "next/headers";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { LearnSession } from "@/components/learn/learn-session";
import { AnswerModeForm } from "@/components/preferences/answer-mode-form";
import { LevelFilterForm } from "@/components/preferences/level-filter-form";
import { QuestionSourceForm } from "@/components/preferences/question-source-form";
import { QuestionTypeForm } from "@/components/preferences/question-type-form";
import { SettingsSummary } from "@/components/preferences/settings-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats, selectLearnQuestion } from "@/lib/data/repository";
import { getAnswerModeFromCookies, labelAnswerMode } from "@/lib/preferences/answer-mode";
import { getLevelBandsFromCookies, labelLevelBand } from "@/lib/preferences/level-filter";
import {
  getQuestionSourceModeFromCookies,
  labelQuestionSourceMode,
} from "@/lib/preferences/question-source";
import { getQuestionTypeFromCookies, labelQuestionType } from "@/lib/preferences/question-type";
import { requireUser } from "@/lib/supabase/auth";

export default async function LearnPage() {
  const cookieStore = await cookies();
  const selectedBands = getLevelBandsFromCookies(cookieStore);
  const selectedQuestionType = getQuestionTypeFromCookies(cookieStore);
  const selectedAnswerMode = getAnswerModeFromCookies(cookieStore);
  const selectedQuestionSourceMode = getQuestionSourceModeFromCookies(cookieStore);
  const { user, supabase } = await requireUser();
  const [learnSelection, stats] = await Promise.all([
    selectLearnQuestion(
      supabase,
      user.id,
      selectedBands,
      selectedQuestionType,
      selectedQuestionSourceMode,
    ),
    getDashboardStats(supabase, user.id),
  ]);
  const { question, poolCount, checkedIdiomsCount, choiceOptions, isChecked } = learnSelection;

  if (!question) {
    return (
      <div className="space-y-6">
        <Card className="animate-fade-up border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-2xl">学習セッション</CardTitle>
            <CardDescription>
              現在の条件に一致する問題がありません。設定を調整して出題範囲を変更してください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            <details className="group rounded-3xl border border-border bg-slate-50" open>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">学習設定</p>
                  <p className="text-sm text-slate-600">出題形式、回答形式、レベルを変更できます。</p>
                </div>
                <ChevronDown className="h-5 w-5 text-slate-500 transition group-open:rotate-180" />
              </summary>
              <div className="grid gap-4 border-t border-border px-5 py-5 md:grid-cols-2">
                <QuestionSourceForm
                  checkedCount={checkedIdiomsCount}
                  selectedMode={selectedQuestionSourceMode}
                />
                <AnswerModeForm selectedMode={selectedAnswerMode} />
                <QuestionTypeForm selectedType={selectedQuestionType} />
                <LevelFilterForm selectedBands={selectedBands} />
              </div>
            </details>
            <Link href="/dashboard">
              <Button variant="outline">ダッシュボードへ戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 xl:grid-cols-[1fr_auto]">
        <SettingsSummary
          description={`現在の母集団は ${poolCount} 問、全体は ${stats.totalQuestions} 問です。`}
          href="#study-settings"
          items={[
            { label: "出題形式", value: labelQuestionType(selectedQuestionType) },
            { label: "回答形式", value: labelAnswerMode(selectedAnswerMode) },
            { label: "出題対象", value: labelQuestionSourceMode(selectedQuestionSourceMode) },
            { label: "レベル", value: selectedBands.map(labelLevelBand).join(" / ") },
          ]}
          title="現在の学習設定"
        />
        <Link className="self-start" href="/review">
          <Button className="w-full xl:w-auto" variant="outline">復習を見る</Button>
        </Link>
      </div>

      <LearnSession
        answerMode={selectedAnswerMode}
        choiceOptions={choiceOptions}
        isChecked={isChecked}
        mode="learn"
        question={question}
      />

      <details
        id="study-settings"
        className="group animate-fade-up rounded-3xl border border-border/80 bg-white"
        style={{ animationDelay: "120ms" }}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-slate-950">学習設定</p>
            <p className="text-sm text-slate-600">
              英訳・和訳、選択式・自由入力、出題対象、レベルをここで変更できます。
            </p>
          </div>
          <ChevronDown className="h-5 w-5 text-slate-500 transition group-open:rotate-180" />
        </summary>
        <div className="grid gap-4 border-t border-border px-6 py-6 md:grid-cols-2">
          <QuestionSourceForm
            checkedCount={checkedIdiomsCount}
            description="チェック済みだけに絞ると、マークした問題の中から学習できます。"
            selectedMode={selectedQuestionSourceMode}
          />
          <AnswerModeForm
            description="移動中は選択式、定着確認では自由入力という使い分けができます。"
            selectedMode={selectedAnswerMode}
          />
          <QuestionTypeForm
            description="英熟語を答える練習と、和訳を答える練習を切り替えられます。"
            selectedType={selectedQuestionType}
          />
          <LevelFilterForm
            description="通常学習だけに反映されます。復習は期限が来た問題を優先します。"
            selectedBands={selectedBands}
          />
        </div>
      </details>
    </div>
  );
}
