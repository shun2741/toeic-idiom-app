import { AlertCircle, CalendarDays } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getHistoryData } from "@/lib/data/repository";
import { requireUser } from "@/lib/supabase/auth";
import { formatDate, formatDateTime, formatPercent } from "@/lib/utils";

export default async function HistoryPage() {
  const { user, supabase } = await requireUser();
  const { dailyHistory, recentMistakes } = await getHistoryData(supabase, user.id);

  const maxCount = Math.max(...dailyHistory.map((item) => item.count), 1);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <Card className="animate-fade-up border-border/80 bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CalendarDays className="h-5 w-5 text-primary" />
            日ごとの学習履歴
          </CardTitle>
          <CardDescription>直近 14 日の学習数と正答率を表示します。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {dailyHistory.length === 0 ? (
            <div className="rounded-2xl border border-border bg-slate-50 p-5 text-sm text-slate-500">
              まだ学習履歴がありません。
            </div>
          ) : (
            dailyHistory.map((item) => (
              <div key={item.date} className="rounded-2xl border border-border bg-slate-50 p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950">{formatDate(item.date)}</p>
                    <p className="text-sm text-slate-500">{item.count} 問</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary">{formatPercent(item.accuracy)}</Badge>
                </div>
                <div className="h-2 rounded-full bg-white">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${(item.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card className="animate-fade-up border-border/80 bg-white" style={{ animationDelay: "120ms" }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <AlertCircle className="h-5 w-5 text-warning" />
            最近間違えた問題
          </CardTitle>
          <CardDescription>復習対象になりやすい問題を確認できます。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentMistakes.length === 0 ? (
            <div className="rounded-2xl border border-border bg-slate-50 p-5 text-sm text-slate-500">
              最近のミスはありません。
            </div>
          ) : (
            recentMistakes.map((mistake) => (
              <div key={`${mistake.questionId}-${mistake.answeredAt}`} className="rounded-2xl border border-border bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold text-slate-950">{mistake.promptJa}</p>
                  <Badge
                    className={
                      mistake.judgment === "almost_correct"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-rose-100 text-rose-700"
                    }
                  >
                    {mistake.judgment}
                  </Badge>
                </div>
                <p className="mt-2 text-lg font-bold text-slate-950">{mistake.correctAnswer}</p>
                <p className="mt-2 text-sm text-slate-500">{formatDateTime(mistake.answeredAt)}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
