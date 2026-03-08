import Link from "next/link";

import { BetaBanner } from "@/components/layout/beta-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const issuesUrl = "https://github.com/shun2741/toeic-idiom-app/issues/new/choose";

const prompts = [
  "どの画面で止まったか",
  "何をしようとしていたか",
  "どこが分かりづらかったか",
  "スマホ / PC のどちらで使ったか",
  "また使いたいと思えたか",
];

export default function FeedbackPage() {
  return (
    <div className="bg-grid min-h-screen">
      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <div className="space-y-6">
          <BetaBanner />
          <Card className="border-border/80 bg-white">
            <CardHeader className="space-y-3">
              <Badge className="w-fit bg-primary/10 text-primary">参加者向け</Badge>
              <CardTitle className="text-3xl">フィードバックのお願い</CardTitle>
              <CardDescription>
                ベータ版では、使いやすさと学習しやすさの感想を特に集めています。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm leading-7 text-slate-700">
              <section>
                <p className="font-semibold text-slate-950">送ってほしい内容</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {prompts.map((prompt) => (
                    <li key={prompt}>{prompt}</li>
                  ))}
                </ul>
              </section>
              <section>
                <p className="font-semibold text-slate-950">送信先</p>
                <p>
                  <Link className="underline underline-offset-4" href={issuesUrl} target="_blank">
                    GitHub Issues のフィードバックフォーム
                  </Link>
                </p>
              </section>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
