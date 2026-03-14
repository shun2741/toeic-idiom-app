"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Lightbulb,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";

import { StudyNote } from "@/components/learn/study-note";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { labelQuestionType } from "@/lib/preferences/question-type";
import { DONT_KNOW_SENTINEL } from "@/lib/scoring/dont-know";
import type { AnswerMode, Judgment, ScoreResult, StudyQuestion } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

type ApiResponse = {
  result: ScoreResult;
  nextReviewAt: string | null;
  intervalDays: number | null;
};

function judgmentLabel(judgment: Judgment) {
  if (judgment === "correct") return "正解";
  if (judgment === "almost_correct") return "惜しい";
  return "不正解";
}

function judgmentClassName(judgment: Judgment) {
  if (judgment === "correct") return "bg-emerald-100 text-emerald-700";
  if (judgment === "almost_correct") return "bg-amber-100 text-amber-700";
  return "bg-rose-100 text-rose-700";
}

function resultPanelClassName(judgment: Judgment) {
  if (judgment === "correct") {
    return "border-emerald-200 bg-emerald-50 text-emerald-950";
  }

  if (judgment === "almost_correct") {
    return "border-amber-200 bg-amber-50 text-amber-950";
  }

  return "border-rose-200 bg-rose-50 text-rose-950";
}

function ResultIcon({ judgment }: { judgment: Judgment }) {
  if (judgment === "correct") {
    return <CheckCircle2 className="h-6 w-6 text-emerald-600" />;
  }

  if (judgment === "almost_correct") {
    return <CircleAlert className="h-6 w-6 text-amber-600" />;
  }

  return <XCircle className="h-6 w-6 text-rose-600" />;
}

function resultEffectClassName(judgment: Judgment) {
  if (judgment === "correct") return "result-glow-correct";
  if (judgment === "almost_correct") return "result-glow-almost";
  return "result-glow-incorrect";
}

function answerPlaceholder(question: StudyQuestion) {
  if (question.questionType === "ja_to_idiom") {
    return "例: put off";
  }

  if (question.questionType === "sentence_to_ja") {
    return "例: 会議は金曜まで延期されました";
  }

  if (question.questionType === "sentence_ja_to_en") {
    return "例: We decided to put off the meeting until Friday.";
  }

  return "例: 延期する";
}

function achievementCopy({
  todayCount,
  currentStreak,
  judgment,
  guestMode,
}: {
  todayCount: number;
  currentStreak: number;
  judgment: Judgment;
  guestMode: boolean;
}) {
  const nextCount = todayCount + 1;
  const streakLabel =
    judgment === "correct" || judgment === "almost_correct"
      ? currentStreak + 1
      : 0;

  if (guestMode) {
    if (nextCount === 1) return "まずは1問クリア。使い心地をそのまま試してみてください。";
    if (nextCount === 5) return "5問到達。短時間でも続けると感覚がつかめてきます。";
    return `体験モードで ${nextCount} 問目まで進みました。`;
  }

  if (nextCount === 1) return "今日の1問目を完了しました。ここから流れが作れます。";
  if (nextCount === 5) return "今日5問目まで到達しました。短い学習でも十分積み上がっています。";
  if (nextCount === 10) return "今日の目標10問を達成しました。ここで切り上げても十分です。";
  if (streakLabel >= 5) return `連続 ${streakLabel} 問で正答側を維持しています。`;
  return `今日 ${nextCount} 問目まで完了しました。`;
}

export function LearnSession({
  answerMode,
  choiceOptions,
  isChecked,
  question,
  mode,
  dueCount,
  guestMode = false,
  allowChecking = true,
  todayCount = 0,
  currentStreak = 0,
}: {
  answerMode: AnswerMode;
  choiceOptions: string[];
  isChecked: boolean;
  question: StudyQuestion;
  mode: "learn" | "review";
  dueCount?: number;
  guestMode?: boolean;
  allowChecking?: boolean;
  todayCount?: number;
  currentStreak?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(isChecked);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();
  const [isMoving, startMoving] = useTransition();
  const [isTogglingCheck, startTogglingCheck] = useTransition();

  useEffect(() => {
    setAnswer("");
    setChecked(isChecked);
    setResult(null);
  }, [question.questionId, isChecked]);

  async function submitAnswer(submittedAnswer: string) {
    if (!submittedAnswer.trim() || isSubmitting) {
      return;
    }

    startSubmitting(async () => {
      const response = await fetch("/api/answers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: question.questionId,
          answer: submittedAnswer,
          mode,
          guestMode,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        window.alert(payload?.error ?? "採点に失敗しました。");
        return;
      }

      const payload = (await response.json()) as ApiResponse;
      setResult(payload);
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitAnswer(answer);
  }

  function handleNextQuestion() {
    startMoving(() => {
      router.replace(`${pathname}?refresh=${Date.now()}`, { scroll: false });
      router.refresh();
    });
  }

  function handleToggleCheck() {
    startTogglingCheck(async () => {
      const nextChecked = !checked;
      const response = await fetch("/api/checks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idiomId: question.idiomId,
          checked: nextChecked,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        window.alert(payload?.error ?? "チェック更新に失敗しました。");
        return;
      }

      setChecked(nextChecked);
    });
  }

  return (
    <div className="space-y-4">
      <Card className="animate-fade-up border-border/80 bg-white">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {[
                  mode === "learn" ? "通常学習" : "復習",
                  labelQuestionType(question.questionType),
                  `TOEIC ${question.levelBand}`,
                  typeof dueCount === "number" ? `復習対象 ${dueCount} 問` : null,
                ]
                  .filter(Boolean)
                  .join(" / ")}
              </p>
              <p className="mt-3 text-sm font-semibold text-slate-500">{question.promptLabel}</p>
              <CardTitle className="mt-1 text-2xl leading-tight sm:text-3xl">{question.prompt}</CardTitle>
              <CardDescription className="mt-2 text-base">{question.promptDescription}</CardDescription>
            </div>
            {allowChecking ? (
              <Button
                className="w-full gap-2 sm:w-auto"
                disabled={isTogglingCheck}
                onClick={handleToggleCheck}
                type="button"
                variant="outline"
              >
                {checked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                {checked ? "チェック済み" : "問題をチェック"}
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent>
          {answerMode === "free_text" ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input
                autoComplete="off"
                className="h-14 text-base sm:text-lg"
                disabled={Boolean(result)}
                maxLength={120}
                placeholder={answerPlaceholder(question)}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
              />
              {question.questionType === "sentence_ja_to_en" ? (
                <p className="text-sm text-slate-500">
                  スマホでは英語キーボードのマイクから音声入力も使えます。
                </p>
              ) : question.questionType !== "ja_to_idiom" ? (
                <p className="text-sm text-slate-500">
                  スマホではキーボードのマイクから音声入力も使えます。
                </p>
              ) : null}
              <div className="grid gap-3 sm:flex sm:flex-wrap">
                <Button className="w-full sm:w-auto" disabled={!answer.trim() || isSubmitting || Boolean(result)} size="lg" type="submit">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      採点中...
                    </>
                  ) : (
                    "回答する"
                  )}
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  disabled={isSubmitting || Boolean(result)}
                  onClick={() => {
                    void submitAnswer(DONT_KNOW_SENTINEL);
                  }}
                  size="lg"
                  type="button"
                  variant="outline"
                >
                  わからない
                </Button>
                <Button
                  className="w-full sm:w-auto"
                  disabled={isSubmitting || isMoving}
                  onClick={handleNextQuestion}
                  size="lg"
                  type="button"
                  variant="outline"
                >
                  {isMoving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    <>
                      次の問題へ
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {choiceOptions.map((choice) => (
                  <button
                    key={choice}
                    className="rounded-2xl border border-border bg-slate-50 px-4 py-4 text-left text-base font-semibold text-slate-800 transition hover:border-primary/30 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={Boolean(result) || isSubmitting}
                    onClick={() => {
                      void submitAnswer(choice);
                    }}
                    type="button"
                  >
                    {choice}
                  </button>
                ))}
              </div>
              <Button
                className="w-full sm:w-auto"
                disabled={Boolean(result) || isSubmitting}
                onClick={() => {
                  void submitAnswer(DONT_KNOW_SENTINEL);
                }}
                size="lg"
                type="button"
                variant="outline"
              >
                わからない
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled={isSubmitting || isMoving}
                onClick={handleNextQuestion}
                size="lg"
                type="button"
                variant="outline"
              >
                {isMoving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    更新中...
                  </>
                ) : (
                  <>
                    次の問題へ
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}

        </CardContent>
        {!result ? (
          <div className="border-t border-border px-6 pb-6">
            <details className="group rounded-2xl border border-border bg-slate-50">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
                <div>
                  <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Lightbulb className="h-4 w-4" />
                    ヒントを見る
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    答えを考えてから、必要なときだけ開いてください。
                  </p>
                </div>
                <ChevronDown className="h-5 w-5 text-slate-500 transition group-open:rotate-180" />
              </summary>
              <div className="border-t border-border px-4 py-4 text-sm leading-7 text-slate-700">
                {question.hintJa}
              </div>
            </details>
          </div>
        ) : (
          <div className="border-t border-border px-6 pb-6">
            <div
              className={`relative space-y-4 overflow-hidden rounded-3xl border p-5 sm:p-6 ${resultPanelClassName(result.result.judgment)} ${resultEffectClassName(result.result.judgment)}`}
            >
              {result.result.judgment === "correct" ? (
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                  <span className="result-spark result-spark-1" />
                  <span className="result-spark result-spark-2" />
                  <span className="result-spark result-spark-3" />
                </div>
              ) : null}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <ResultIcon judgment={result.result.judgment} />
                    <div>
                      <p className="text-sm font-semibold tracking-wide text-current opacity-70">
                        採点結果
                      </p>
                      <p className="text-2xl font-bold">{judgmentLabel(result.result.judgment)}</p>
                    </div>
                  </div>
                  <Badge className={judgmentClassName(result.result.judgment)}>
                    {judgmentLabel(result.result.judgment)}
                  </Badge>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-current opacity-70">正答</p>
                    <p className="text-2xl font-bold">{result.result.correctAnswer}</p>
                  </div>
                  <p className="text-sm font-semibold text-current opacity-70">
                    {achievementCopy({
                      todayCount,
                      currentStreak,
                      judgment: result.result.judgment,
                      guestMode,
                    })}
                  </p>
                  <p className="leading-7 text-current opacity-90">{result.result.feedbackJa}</p>
                </div>
                <Button
                  className="w-full sm:w-auto"
                  disabled={isSubmitting || isMoving}
                  onClick={handleNextQuestion}
                  size="lg"
                  type="button"
                >
                  {isMoving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    <>
                      次の問題へ
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>

              <details className="group rounded-2xl border border-white/70 bg-white/80">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">解説と定着ポイントを見る</p>
                    <p className="mt-1 text-sm text-slate-600">
                      例文、よく一緒に出る語、間違えやすい点、復習予定を必要なときだけ確認できます。
                    </p>
                  </div>
                  <ChevronDown className="h-5 w-5 text-slate-500 transition group-open:rotate-180" />
                </summary>
                <div className="space-y-4 border-t border-border px-4 py-4 text-sm leading-7 text-slate-700">
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-border bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-950">例文</p>
                      <p className="mt-2 text-slate-900">{question.exampleEn}</p>
                      <p className="mt-2 text-slate-600">{question.exampleJa}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-slate-50 p-4">
                      <p className="text-sm font-semibold text-slate-950">定着ポイント</p>
                      <p className="mt-2">よく一緒に出る語: {question.collocationHintJa}</p>
                      <p className="mt-2">間違えやすい点: {question.commonMistakeJa}</p>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-border bg-slate-50 p-4">
                    <p>英熟語: {question.sourceExpression}</p>
                    <p>意味: {question.sourceMeaningJa}</p>
                    <p>解説: {question.explanationJa}</p>
                  </div>
                  {guestMode ? (
                    <p>ログインすると、学習履歴と復習予定を保存できます。</p>
                  ) : (
                    <>
                      <p>次回復習予定: {result.nextReviewAt ? formatDateTime(result.nextReviewAt) : "-"}</p>
                      <p>復習間隔: {result.intervalDays ?? "-"} 日</p>
                    </>
                  )}
                  <StudyNote guestMode={guestMode} questionId={question.questionId} />
                </div>
              </details>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
