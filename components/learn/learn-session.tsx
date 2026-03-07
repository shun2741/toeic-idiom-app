"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, Lightbulb, Loader2, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { Judgment, ScoreResult, StudyQuestion } from "@/lib/types";
import { formatDateTime } from "@/lib/utils";

type ApiResponse = {
  result: ScoreResult;
  nextReviewAt: string;
  intervalDays: number;
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
  question,
  mode,
  dueCount,
}: {
  question: StudyQuestion;
  mode: "learn" | "review";
  dueCount?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [isSubmitting, startSubmitting] = useTransition();
  const [isMoving, startMoving] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!answer.trim() || isSubmitting) {
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
          answer,
          mode,
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

  function handleNextQuestion() {
    startMoving(() => {
      setAnswer("");
      setResult(null);
      router.replace(`${pathname}?refresh=${Date.now()}`, { scroll: false });
      router.refresh();
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="animate-fade-up border-border/80 bg-white">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="bg-primary/10 text-primary">
              {mode === "learn" ? "通常学習" : "復習セッション"}
            </Badge>
            <Badge className="bg-slate-100 text-slate-700">
              {question.questionType === "ja_to_idiom" ? "英熟語入力" : "和訳入力"}
            </Badge>
            <Badge>{question.levelBand} レベル帯</Badge>
            {typeof dueCount === "number" ? (
              <Badge className="bg-slate-100 text-slate-700">復習対象 {dueCount} 問</Badge>
            ) : null}
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-500">{question.promptLabel}</p>
            <CardTitle className="text-2xl sm:text-3xl">{question.prompt}</CardTitle>
            <CardDescription className="mt-2 text-base">
              {question.promptDescription}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              autoComplete="off"
              className="h-14 text-lg"
              disabled={Boolean(result)}
              maxLength={120}
              placeholder={
                question.questionType === "ja_to_idiom"
                  ? "例: put off"
                  : "例: 延期する"
              }
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <Button disabled={!answer.trim() || isSubmitting || Boolean(result)} size="lg" type="submit">
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
        </CardContent>
      </Card>

      <Card className="animate-fade-up border-border/80 bg-white" style={{ animationDelay: "120ms" }}>
        <CardHeader>
          <CardTitle className="text-xl text-slate-950">ヒントと結果</CardTitle>
          <CardDescription className="text-slate-600">
            入力前はヒント、採点後はフィードバックと次回復習予定を表示します。
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
                <p>次回復習予定: {formatDateTime(result.nextReviewAt)}</p>
                <p>復習間隔: {result.intervalDays} 日</p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-slate-50 p-5 text-sm leading-7 text-slate-600">
              採点後に、正誤・解説・次回復習予定がここに表示されます。
            </div>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-sm text-slate-500">
            AI 採点は曖昧なケースだけに限定し、通常はルールベース判定で返します。
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
