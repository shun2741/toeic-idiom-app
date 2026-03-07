import { ArrowRight, BookOpen, Brain, RotateCcw } from "lucide-react";

import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { hasServerSupabaseEnv } from "@/lib/supabase/env";

const featureItems = [
  {
    icon: BookOpen,
    title: "固定問題で安定運用",
    description: "TOEIC帯の重要熟語を、まずは確実に反復できる構成です。",
  },
  {
    icon: Brain,
    title: "ルールベース中心の採点",
    description: "完全一致や軽微ミスを優先判定し、曖昧な時だけAI採点を呼びます。",
  },
  {
    icon: RotateCcw,
    title: "復習キューで再出題",
    description: "間違えた問題を数日単位で回収して、学習を取りこぼしません。",
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
            英熟語を、入力しながら定着させる学習アプリ
          </h1>
          <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
            日本語から英熟語を思い出して入力し、採点結果とフィードバックをその場で確認できます。
            苦手な問題は自動で復習キューに入り、少人数運用でも扱いやすいMVPに絞っています。
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
          <CardTitle className="text-2xl">ログインして学習を開始</CardTitle>
          <CardDescription>
            Googleログイン後に、ダッシュボード・学習・復習・履歴を利用できます。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <GoogleSignInButton />
          <div className="rounded-2xl border border-border bg-slate-50 p-5 text-sm leading-7 text-slate-600">
            <p className="flex items-center gap-2 font-semibold text-slate-800">
              <ArrowRight className="h-4 w-4 text-primary" />
              初回セットアップ
            </p>
            <p className="mt-2">
              Supabase の URL と Publishable Key を設定し、Google プロバイダを有効化してください。
              OpenAI は未設定でもルールベース採点で動作します。
            </p>
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
