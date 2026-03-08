import Link from "next/link";

import { BetaBanner } from "@/components/layout/beta-banner";
import { SiteFooter } from "@/components/layout/site-footer";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const repoUrl = "https://github.com/shun2741/toeic-idiom-app";
const issuesUrl = "https://github.com/shun2741/toeic-idiom-app/issues/new/choose";

export default function ContactPage() {
  return (
    <div className="bg-grid min-h-screen">
      <main className="mx-auto max-w-5xl px-6 py-10 sm:px-8">
        <div className="space-y-6">
          <BetaBanner />
          <Card className="border-border/80 bg-white">
            <CardHeader className="space-y-3">
              <Badge className="w-fit bg-primary/10 text-primary">ベータ版窓口</Badge>
              <CardTitle className="text-3xl">お問い合わせ</CardTitle>
              <CardDescription>
                現在は少人数向けのベータ運用です。一次窓口は GitHub Issues です。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-sm leading-7 text-slate-700">
              <div>
                <p className="font-semibold text-slate-950">不具合報告・要望</p>
                <p>
                  <Link className="underline underline-offset-4" href={issuesUrl} target="_blank">
                    GitHub Issues を開く
                  </Link>
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">リポジトリ</p>
                <p>
                  <Link className="underline underline-offset-4" href={repoUrl} target="_blank">
                    {repoUrl}
                  </Link>
                </p>
              </div>
              <div>
                <p className="font-semibold text-slate-950">補足</p>
                <p>
                  GitHub アカウントを使わずに参加している友人には、このページの内容を共有したうえで、運営者へ直接感想を集める運用でも問題ありません。
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
