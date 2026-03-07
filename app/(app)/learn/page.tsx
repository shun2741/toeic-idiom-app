import { cookies } from "next/headers";

import { LevelFilterForm } from "@/components/preferences/level-filter-form";
import { LearnSession } from "@/components/learn/learn-session";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLevelBandsFromCookies, labelLevelBand } from "@/lib/preferences/level-filter";
import { getDashboardStats, selectLearnQuestion } from "@/lib/data/repository";
import { requireUser } from "@/lib/supabase/auth";
import Link from "next/link";

export default async function LearnPage() {
  const cookieStore = await cookies();
  const selectedBands = getLevelBandsFromCookies(cookieStore);
  const { user, supabase } = await requireUser();
  const [question, stats] = await Promise.all([
    selectLearnQuestion(supabase, user.id, selectedBands),
    getDashboardStats(supabase, user.id),
  ]);

  if (!question) {
    return (
      <div className="space-y-6">
        <Card className="animate-fade-up border-border/80 bg-white">
          <CardHeader>
            <CardTitle className="text-2xl">通常学習</CardTitle>
            <CardDescription>
              選択中のレベル帯に一致する問題がありません。別のレベルを選んでください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-0">
            <LevelFilterForm selectedBands={selectedBands} />
            <Link href="/dashboard">
              <Button variant="outline">ダッシュボードへ戻る</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="animate-fade-up border-border/80 bg-white">
        <CardHeader>
          <CardTitle className="text-2xl">通常学習</CardTitle>
          <CardDescription>
            {selectedBands.map(labelLevelBand).join(" / ")} から出題します。復習対象は {stats.dueReviewCount} 問あります。
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-0">
          <LevelFilterForm
            description="通常学習だけに反映されます。復習モードでは、期限が来た問題をレベル設定より優先して出題します。"
            selectedBands={selectedBands}
          />
          <LearnSession mode="learn" question={question} />
        </CardContent>
      </Card>
    </div>
  );
}
