import { cookies } from "next/headers";
import Link from "next/link";

import { BetaBanner } from "@/components/layout/beta-banner";
import { GuestCaptchaGate } from "@/components/guest/guest-captcha-gate";
import { LearnSession } from "@/components/learn/learn-session";
import { SiteFooter } from "@/components/layout/site-footer";
import { AnswerModeForm } from "@/components/preferences/answer-mode-form";
import { LevelFilterForm } from "@/components/preferences/level-filter-form";
import { SettingsSummary } from "@/components/preferences/settings-summary";
import { QuestionTypeForm } from "@/components/preferences/question-type-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QUESTION_BANK } from "@/lib/data/idioms";
import { selectGuestLearnQuestion } from "@/lib/data/repository";
import { getAnswerModeFromCookies, labelAnswerMode } from "@/lib/preferences/answer-mode";
import { getLevelBandsFromCookies, labelLevelBand } from "@/lib/preferences/level-filter";
import { getQuestionTypeFromCookies, labelQuestionType } from "@/lib/preferences/question-type";
import { GUEST_VERIFIED_COOKIE, isGuestVerifiedToken } from "@/lib/security/guest-captcha";

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
  const selectedQuestionType = getQuestionTypeFromCookies(cookieStore, "idiom_to_ja");
  const selectedAnswerMode = getAnswerModeFromCookies(cookieStore, "multiple_choice");
  const isGuestVerified = isGuestVerifiedToken(cookieStore.get(GUEST_VERIFIED_COOKIE)?.value);
  const learnSelection = selectGuestLearnQuestion(
    selectedBands,
    selectedQuestionType,
    refresh,
  );
  const { question, poolCount, choiceOptions, isChecked } = learnSelection;

  return (
    <div className="bg-grid min-h-screen">
      <main className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
        <div className="space-y-6">
          <BetaBanner />
          <Card className="animate-fade-up border-border/80 bg-white">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-3">
                <Badge className="w-fit bg-primary/10 text-primary">ログインなしで試す</Badge>
                <CardTitle className="text-3xl text-slate-950 sm:text-4xl">
                  保存せずに、そのまま学習を試せます
                </CardTitle>
                <CardDescription className="max-w-2xl text-base leading-7 text-slate-600">
                  回答の採点までは体験できます。履歴、復習予定、問題チェックを使う場合はログインしてください。体験モードには 1 日あたりの利用上限があります。
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

          {question && isGuestVerified ? (
            <>
              <SettingsSummary
                description={`現在の母集団は ${poolCount} 問、全体は ${QUESTION_BANK.length} 問です。`}
                defaultOpen={!question}
                items={[
                  { label: "出題形式", value: labelQuestionType(selectedQuestionType) },
                  { label: "回答形式", value: labelAnswerMode(selectedAnswerMode) },
                  { label: "レベル", value: selectedBands.map(labelLevelBand).join(" / ") },
                  { label: "モード", value: "ログインなし体験" },
                ]}
                title="現在の体験設定"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <AnswerModeForm
                    description="体験版は和訳の選択式から始まります。必要なら自由入力にも切り替えられます。"
                    selectedMode={selectedAnswerMode}
                  />
                  <QuestionTypeForm
                    description="英熟語入力、単体の和訳、例文の和訳、例文の英訳を切り替えられます。"
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
                    <div className="px-6 pb-6 text-sm leading-7 text-slate-600">
                      <p>採点結果と解説を確認できます。</p>
                      <p>「わからない」ボタンで答えをすぐ確認できます。</p>
                      <p>体験モードは 1 日あたりの利用回数に上限があります。</p>
                      <p>履歴保存、復習キュー、問題チェックはログイン後に利用できます。</p>
                    </div>
                  </Card>
                </div>
              </SettingsSummary>

              <LearnSession
                allowChecking={false}
                answerMode={selectedAnswerMode}
                choiceOptions={choiceOptions}
                currentStreak={0}
                guestMode
                isChecked={isChecked}
                mode="learn"
                question={question}
                todayCount={0}
              />
            </>
          ) : question ? (
            <>
              <SettingsSummary
                description={`現在の母集団は ${poolCount} 問、全体は ${QUESTION_BANK.length} 問です。`}
                items={[
                  { label: "出題形式", value: labelQuestionType(selectedQuestionType) },
                  { label: "回答形式", value: labelAnswerMode(selectedAnswerMode) },
                  { label: "レベル", value: selectedBands.map(labelLevelBand).join(" / ") },
                  { label: "モード", value: "ログインなし体験" },
                ]}
                title="現在の体験設定"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <AnswerModeForm
                    description="体験版は和訳の選択式から始まります。必要なら自由入力にも切り替えられます。"
                    selectedMode={selectedAnswerMode}
                  />
                  <QuestionTypeForm
                    description="英熟語入力、単体の和訳、例文の和訳、例文の英訳を切り替えられます。"
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
                    <div className="px-6 pb-6 text-sm leading-7 text-slate-600">
                      <p>採点結果と解説を確認できます。</p>
                      <p>「わからない」ボタンで答えをすぐ確認できます。</p>
                      <p>体験モードは 1 日あたりの利用回数に上限があります。</p>
                      <p>履歴保存、復習キュー、問題チェックはログイン後に利用できます。</p>
                    </div>
                  </Card>
                </div>
              </SettingsSummary>
              <GuestCaptchaGate />
            </>
          ) : (
            <div className="space-y-6">
              <Card className="animate-fade-up border-border/80 bg-white">
                <CardHeader>
                  <CardTitle className="text-2xl">体験学習</CardTitle>
                  <CardDescription>
                    現在の条件に一致する問題がありません。設定を調整して出題範囲を変更してください。
                  </CardDescription>
                </CardHeader>
              </Card>
              <SettingsSummary
                defaultOpen
                description={`現在の母集団は ${poolCount} 問、全体は ${QUESTION_BANK.length} 問です。`}
                items={[
                  { label: "出題形式", value: labelQuestionType(selectedQuestionType) },
                  { label: "回答形式", value: labelAnswerMode(selectedAnswerMode) },
                  { label: "レベル", value: selectedBands.map(labelLevelBand).join(" / ") },
                  { label: "モード", value: "ログインなし体験" },
                ]}
                title="現在の体験設定"
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <AnswerModeForm
                    description="体験版は和訳の選択式から始まります。必要なら自由入力にも切り替えられます。"
                    selectedMode={selectedAnswerMode}
                  />
                  <QuestionTypeForm
                    description="英熟語入力、単体の和訳、例文の和訳、例文の英訳を切り替えられます。"
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
                    <div className="px-6 pb-6 text-sm leading-7 text-slate-600">
                      <p>採点結果と解説を確認できます。</p>
                      <p>「わからない」ボタンで答えをすぐ確認できます。</p>
                      <p>体験モードは 1 日あたりの利用回数に上限があります。</p>
                      <p>履歴保存、復習キュー、問題チェックはログイン後に利用できます。</p>
                    </div>
                  </Card>
                </div>
              </SettingsSummary>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
