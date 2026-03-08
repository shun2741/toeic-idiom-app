import { cookies } from "next/headers";
import Link from "next/link";

import { AnswerModeForm } from "@/components/preferences/answer-mode-form";
import { LevelFilterForm } from "@/components/preferences/level-filter-form";
import { QuestionTypeForm } from "@/components/preferences/question-type-form";
import { QuestionSourceForm } from "@/components/preferences/question-source-form";
import { LearnSession } from "@/components/learn/learn-session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLevelBandsFromCookies, labelLevelBand } from "@/lib/preferences/level-filter";
import { getQuestionTypeFromCookies, labelQuestionType } from "@/lib/preferences/question-type";
import { getAnswerModeFromCookies, labelAnswerMode } from "@/lib/preferences/answer-mode";
import {
  getQuestionSourceModeFromCookies,
  labelQuestionSourceMode,
} from "@/lib/preferences/question-source";
import { getDashboardStats, selectLearnQuestion } from "@/lib/data/repository";
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
            <CardTitle className="text-2xl">通常学習</CardTitle>
            <CardDescription>
              選択中のレベル帯に一致する問題がありません。別のレベルを選んでください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            <QuestionSourceForm
              checkedCount={checkedIdiomsCount}
              selectedMode={selectedQuestionSourceMode}
            />
            <AnswerModeForm selectedMode={selectedAnswerMode} />
            <QuestionTypeForm selectedType={selectedQuestionType} />
            <LevelFilterForm selectedBands={selectedBands} />
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
      <Card className="animate-fade-up border-border/80 bg-white">
        <CardHeader>
          <CardTitle className="text-2xl">通常学習</CardTitle>
          <CardDescription>
            {labelQuestionType(selectedQuestionType)} / {labelAnswerMode(selectedAnswerMode)} / {labelQuestionSourceMode(selectedQuestionSourceMode)} で、{selectedBands.map(labelLevelBand).join(" / ")} から出題します。現在の母集団は {poolCount} 問、全体は {stats.totalQuestions} 問です。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-0">
          <QuestionSourceForm
            checkedCount={checkedIdiomsCount}
            description="チェック済みのみを選ぶと、チェックした熟語の中からだけ通常学習で出題します。"
            selectedMode={selectedQuestionSourceMode}
          />
          <AnswerModeForm
            description="スマホでは選択式、しっかり覚える時は自由入力、という使い分けができます。"
            selectedMode={selectedAnswerMode}
          />
          <QuestionTypeForm
            description="通常学習の問題形式を選びます。和訳入力では、意味が近い表現を AI で補助判定します。"
            selectedType={selectedQuestionType}
          />
          <LevelFilterForm
            description="通常学習だけに反映されます。復習モードでは、期限が来た問題をレベル設定より優先して出題します。"
            selectedBands={selectedBands}
          />
          <LearnSession
            answerMode={selectedAnswerMode}
            choiceOptions={choiceOptions}
            isChecked={isChecked}
            mode="learn"
            question={question}
          />
        </CardContent>
      </Card>
    </div>
  );
}
