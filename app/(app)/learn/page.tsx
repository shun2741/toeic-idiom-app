import { cookies } from "next/headers";
import Link from "next/link";

import { LearnSession } from "@/components/learn/learn-session";
import { AnswerModeForm } from "@/components/preferences/answer-mode-form";
import { LevelFilterForm } from "@/components/preferences/level-filter-form";
import { QuestionOrderForm } from "@/components/preferences/question-order-form";
import { QuestionSourceForm } from "@/components/preferences/question-source-form";
import { QuestionTypeForm } from "@/components/preferences/question-type-form";
import { SettingsSummary } from "@/components/preferences/settings-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats, selectLearnQuestion } from "@/lib/data/repository";
import { getAnswerModeFromCookies, labelAnswerMode } from "@/lib/preferences/answer-mode";
import { getLevelBandsFromCookies, labelLevelBand } from "@/lib/preferences/level-filter";
import {
  getQuestionOrderModeFromCookies,
  labelQuestionOrderMode,
} from "@/lib/preferences/question-order";
import {
  getQuestionSourceModeFromCookies,
  labelQuestionSourceMode,
} from "@/lib/preferences/question-source";
import { getQuestionTypeFromCookies, labelQuestionType } from "@/lib/preferences/question-type";
import { requireUser } from "@/lib/supabase/auth";

export default async function LearnPage({
  searchParams,
}: {
  searchParams?: Promise<{ cursor?: string | string[] | undefined }>;
}) {
  const cookieStore = await cookies();
  const params = searchParams ? await searchParams : undefined;
  const cursor =
    typeof params?.cursor === "string"
      ? params.cursor
      : Array.isArray(params?.cursor)
        ? params.cursor[0]
        : undefined;
  const selectedBands = getLevelBandsFromCookies(cookieStore);
  const selectedQuestionType = getQuestionTypeFromCookies(cookieStore);
  const selectedAnswerMode = getAnswerModeFromCookies(cookieStore);
  const selectedQuestionSourceMode = getQuestionSourceModeFromCookies(cookieStore);
  const selectedQuestionOrderMode = getQuestionOrderModeFromCookies(cookieStore);
  const { user, supabase } = await requireUser();
  const [learnSelection, stats] = await Promise.all([
    selectLearnQuestion(
      supabase,
      user.id,
      selectedBands,
      selectedQuestionType,
      selectedQuestionSourceMode,
      selectedQuestionOrderMode,
      cursor,
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
            <SettingsSummary
              defaultOpen
              description={`現在の母集団は ${poolCount} 問、全体は ${stats.totalQuestions} 問です。`}
              items={[
                { label: "出題形式", value: labelQuestionType(selectedQuestionType) },
                { label: "回答形式", value: labelAnswerMode(selectedAnswerMode) },
                { label: "出題対象", value: labelQuestionSourceMode(selectedQuestionSourceMode) },
                { label: "出題モード", value: labelQuestionOrderMode(selectedQuestionOrderMode) },
                { label: "レベル", value: selectedBands.map(labelLevelBand).join(" / ") },
              ]}
              title="現在の学習設定"
            >
              <div className="grid gap-4 md:grid-cols-2">
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
                  description="英熟語入力、単体の和訳、例文の和訳、例文の英訳、TOEIC No.5 を切り替えられます。"
                  selectedType={selectedQuestionType}
                />
                <QuestionOrderForm
                  description="順番どおり、ランダム、未着手優先、苦手優先から選べます。"
                  selectedMode={selectedQuestionOrderMode}
                />
                <LevelFilterForm
                  description="通常学習だけに反映されます。復習は期限が来た問題を優先します。"
                  selectedBands={selectedBands}
                />
              </div>
            </SettingsSummary>
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
          items={[
            { label: "出題形式", value: labelQuestionType(selectedQuestionType) },
            { label: "回答形式", value: labelAnswerMode(selectedAnswerMode) },
            { label: "出題対象", value: labelQuestionSourceMode(selectedQuestionSourceMode) },
            { label: "出題モード", value: labelQuestionOrderMode(selectedQuestionOrderMode) },
            { label: "レベル", value: selectedBands.map(labelLevelBand).join(" / ") },
          ]}
          title="現在の学習設定"
        >
          <div className="grid gap-4 md:grid-cols-2">
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
              description="英熟語入力、単体の和訳、例文の和訳、例文の英訳、TOEIC No.5 を切り替えられます。"
              selectedType={selectedQuestionType}
            />
            <QuestionOrderForm
              description="順番どおり、ランダム、未着手優先、苦手優先から選べます。"
              selectedMode={selectedQuestionOrderMode}
            />
            <LevelFilterForm
              description="通常学習だけに反映されます。復習は期限が来た問題を優先します。"
              selectedBands={selectedBands}
            />
          </div>
        </SettingsSummary>
        <Link className="self-start" href="/review">
          <Button className="w-full xl:w-auto" variant="outline">復習を見る</Button>
        </Link>
      </div>

      <LearnSession
        answerMode={selectedAnswerMode}
        choiceOptions={choiceOptions}
        currentStreak={stats.currentStreak}
        isChecked={isChecked}
        mode="learn"
        question={question}
        todayCount={stats.todayCount}
      />
    </div>
  );
}
