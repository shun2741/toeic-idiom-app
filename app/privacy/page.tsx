import Link from "next/link";

import { BetaBanner } from "@/components/layout/beta-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const sections = [
  {
    title: "取得する情報",
    body: "Google ログインで取得するアカウント情報、学習履歴、復習キュー、問題チェック、アクセスログを扱います。",
  },
  {
    title: "利用目的",
    body: "学習機能の提供、採点、復習タイミングの計算、品質改善、不具合調査のために利用します。",
  },
  {
    title: "外部サービス",
    body: "認証とデータ保存に Supabase、ホスティングに Vercel、曖昧な採点補助に OpenAI、ログイン認証に Google を利用します。",
  },
  {
    title: "保存期間",
    body: "ベータ運用中はサービス改善のために保存します。削除希望があれば個別に対応します。",
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-grid min-h-screen">
      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <div className="space-y-6">
          <BetaBanner />
          <Card className="border-border/80 bg-white">
            <CardHeader>
              <CardTitle className="text-3xl">プライバシーポリシー</CardTitle>
              <CardDescription>
                TOEIC Idiom Coach beta における個人情報と学習データの取り扱い方針です。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm leading-7 text-slate-700">
              {sections.map((section) => (
                <section key={section.title} className="space-y-2">
                  <h2 className="text-base font-semibold text-slate-950">{section.title}</h2>
                  <p>{section.body}</p>
                </section>
              ))}
              <section className="space-y-2">
                <h2 className="text-base font-semibold text-slate-950">お問い合わせ</h2>
                <p>
                  ベータ版に関する問い合わせは
                  <Link className="mx-1 underline underline-offset-4" href="/contact">
                    お問い合わせページ
                  </Link>
                  を確認してください。
                </p>
              </section>
              <p className="text-slate-500">最終更新日: 2026-03-08</p>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
