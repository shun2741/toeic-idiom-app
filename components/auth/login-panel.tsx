import Link from "next/link";
import { ArrowRight, BookOpen, Brain, RotateCcw } from "lucide-react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasServerSupabaseEnv } from "@/lib/supabase/env";

const featureItems = [
  {
    icon: BookOpen,
    title: "TOEIC頻出熟語を厳選",
    description: "700 から 860 レベルまで、重要表現を段階的に反復できます。",
  },
  {
    icon: Brain,
    title: "その場で採点と解説",
    description: "回答後すぐに正誤、フィードバック、次回復習の目安を確認できます。",
  },
  {
    icon: RotateCcw,
    title: "苦手だけを復習",
    description: "間違えた問題は復習キューに入り、見直すべきタイミングで再出題されます。",
  },
];

export function LoginPanel() {
  const isConfigured = hasServerSupabaseEnv();

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
      <section className="space-y-6 rounded-3xl border border-border bg-white p-8 sm:p-10">
        <Badge className="bg-primary/10 text-primary">TOEIC 700-860 向け</Badge>
        <div className="space-y-4">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            TOEIC 英熟語を、短時間で反復できる学習アプリ
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            日本語から英熟語を答える練習と、英熟語から和訳を答える練習に対応しています。
            学習レベルや回答形式を切り替えながら、苦手な表現を繰り返し定着させられます。
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {featureItems.map((item, index) => (
            <Card
              key={item.title}
              className="animate-fade-up border-border bg-slate-50"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <CardHeader className="space-y-3 pb-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Card className="overflow-hidden border-border bg-white">
        <CardHeader className="space-y-3">
          <Badge className="w-fit bg-accent text-accent-foreground">はじめる</Badge>
          <CardTitle className="text-2xl">Googleアカウントで始める</CardTitle>
          <CardDescription>
            ログイン後すぐに、ダッシュボード、学習、復習、履歴を利用できます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <GoogleSignInButton />
            <Link href="/trial">
              <Button className="w-full" size="lg" variant="outline">
                ログインせずに試す
              </Button>
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-slate-50 p-5 text-sm leading-7 text-slate-600">
            <p className="flex items-center gap-2 font-semibold text-slate-800">
              <ArrowRight className="h-4 w-4 text-primary" />
              サービス概要
            </p>
            {isConfigured ? (
              <p className="mt-2">
                Googleアカウントでログインすると、学習履歴と復習キューが保存されます。和訳では意味が近い表現も柔軟に判定します。
              </p>
            ) : (
              <p className="mt-2">
                開発環境では Supabase の URL と Publishable Key を設定し、Google プロバイダを有効化してください。OpenAI は未設定でも基本採点は利用できます。
              </p>
            )}
            {!isConfigured ? (
              <p className="mt-3 rounded-2xl bg-warning/15 px-4 py-3 text-warning">
                現在は Supabase 環境変数が未設定です。`.env.local` を作成してからログインしてください。
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
