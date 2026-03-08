"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, Bookmark, BookmarkCheck, Lightbulb, Loader2, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

export function LearnSession({
  answerMode,
  choiceOptions,
  isChecked,
  question,
  mode,
  dueCount,
  guestMode = false,
  allowChecking = true,
}: {
  answerMode: AnswerMode;
  choiceOptions: string[];
  isChecked: boolean;
  question: StudyQuestion;
  mode: "learn" | "review";
  dueCount?: number;
  guestMode?: boolean;
  allowChecking?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(isChecked);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();
  const [isMoving, startMoving] = useTransition();
  const [isTogglingCheck, startTogglingCheck] = useTransition();

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
      setAnswer("");
      setResult(null);
      setChecked(isChecked);
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
      router.refresh();
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
                  question.questionType === "ja_to_idiom" ? "英熟語入力" : "和訳入力",
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
                placeholder={question.questionType === "ja_to_idiom" ? "例: put off" : "例: 延期する"}
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
              />
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
      </Card>

      <Card className="animate-fade-up border-border/80 bg-white" style={{ animationDelay: "120ms" }}>
        <CardHeader>
          <CardTitle className="text-xl text-slate-950">{result ? "採点結果" : "ヒント"}</CardTitle>
          <CardDescription className="text-slate-600">
            {result
              ? guestMode
                ? "正答とフィードバックを確認できます。"
                : "正答、フィードバック、次回の復習予定を確認できます。"
              : "答えを入力する前に、思い出すための手がかりだけ確認できます。"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-border bg-slate-50 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Lightbulb className="h-4 w-4" />
              ヒント
            </p>
            <p className="mt-2 leading-7 text-slate-700">{question.hintJa}</p>
          </div>

          {result ? (
            <div className="space-y-4 rounded-2xl border border-border bg-slate-50 p-5 text-slate-900">
              <Badge className={judgmentClassName(result.result.judgment)}>
                {judgmentLabel(result.result.judgment)}
              </Badge>
              <p className="text-sm font-semibold text-slate-500">正答</p>
              <p className="text-2xl font-bold">{result.result.correctAnswer}</p>
              <p className="leading-7 text-slate-600">{result.result.feedbackJa}</p>
              <div className="rounded-2xl border border-border bg-white p-4 text-sm leading-7 text-slate-600">
                <p>英熟語: {question.sourceExpression}</p>
                <p>意味: {question.sourceMeaningJa}</p>
                <p>解説: {question.explanationJa}</p>
                {guestMode ? (
                  <p>ログインすると、学習履歴と復習予定を保存できます。</p>
                ) : (
                  <>
                    <p>次回復習予定: {result.nextReviewAt ? formatDateTime(result.nextReviewAt) : "-"}</p>
                    <p>復習間隔: {result.intervalDays ?? "-"} 日</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-slate-50 p-5 text-sm leading-7 text-slate-600">
              {guestMode
                ? "採点後に、正誤と解説がここに表示されます。"
                : "採点後に、正誤、解説、次回復習予定がここに表示されます。"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
