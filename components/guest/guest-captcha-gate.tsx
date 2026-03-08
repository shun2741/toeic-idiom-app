"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ChallengePayload = {
  prompt: string;
  token: string;
};

export function GuestCaptchaGate() {
  const router = useRouter();
  const [challenge, setChallenge] = useState<ChallengePayload | null>(null);
  const [answer, setAnswer] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, startSubmitting] = useTransition();

  async function loadChallenge() {
    setIsLoading(true);
    setError(null);

    const response = await fetch("/api/guest-captcha", {
      cache: "no-store",
    });

    const payload = (await response.json().catch(() => null)) as
      | { prompt?: string; token?: string; error?: string }
      | null;

    if (!response.ok || !payload?.prompt || !payload?.token) {
      setChallenge(null);
      setError(payload?.error ?? "確認問題の取得に失敗しました。");
      setIsLoading(false);
      return;
    }

    setChallenge({
      prompt: payload.prompt,
      token: payload.token,
    });
    setIsLoading(false);
  }

  useEffect(() => {
    void loadChallenge();
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!challenge || !answer.trim() || isSubmitting) {
      return;
    }

    startSubmitting(async () => {
      const response = await fetch("/api/guest-captcha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: challenge.token,
          answer,
          website,
        }),
      });

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;

      if (!response.ok) {
        setError(payload?.error ?? "確認に失敗しました。");
        setAnswer("");
        void loadChallenge();
        return;
      }

      router.refresh();
    });
  }

  return (
    <Card className="animate-fade-up border-border/80 bg-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-slate-950">
          <ShieldCheck className="h-5 w-5 text-primary" />
          体験モードの利用確認
        </CardTitle>
        <CardDescription className="text-base leading-7 text-slate-600">
          自動送信を減らすため、最初に簡単な確認だけお願いします。確認後はそのまま学習を続けられます。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-border bg-slate-50 px-4 py-4 text-sm text-slate-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            確認問題を読み込み中です...
          </div>
        ) : challenge ? (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="rounded-2xl border border-border bg-slate-50 px-4 py-4">
              <p className="text-sm font-semibold text-slate-500">確認問題</p>
              <p className="mt-2 text-xl font-bold text-slate-950">{challenge.prompt}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-700">答えを入力してください</p>
              <Input
                autoComplete="off"
                inputMode="numeric"
                maxLength={10}
                placeholder="例: 8"
                value={answer}
                onChange={(event) => setAnswer(event.target.value)}
              />
              <Input
                autoComplete="off"
                className="hidden"
                tabIndex={-1}
                value={website}
                onChange={(event) => setWebsite(event.target.value)}
              />
            </div>
            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
            <div className="grid gap-3 sm:flex sm:flex-wrap">
              <Button className="w-full sm:w-auto" disabled={!answer.trim() || isSubmitting} size="lg" type="submit">
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    確認中...
                  </>
                ) : (
                  "確認して学習を始める"
                )}
              </Button>
              <Button
                className="w-full sm:w-auto"
                disabled={isLoading || isSubmitting}
                onClick={() => {
                  setAnswer("");
                  void loadChallenge();
                }}
                size="lg"
                type="button"
                variant="outline"
              >
                別の問題にする
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-3">
            {error ? <p className="text-sm font-medium text-rose-600">{error}</p> : null}
            <Button
              onClick={() => {
                void loadChallenge();
              }}
              type="button"
              variant="outline"
            >
              もう一度試す
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
