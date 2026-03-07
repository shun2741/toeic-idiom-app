import { LearnSession } from "@/components/learn/learn-session";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardStats, selectLearnQuestion } from "@/lib/data/repository";
import { requireUser } from "@/lib/supabase/auth";

export default async function LearnPage() {
  const { user, supabase } = await requireUser();
  const [question, stats] = await Promise.all([
    selectLearnQuestion(supabase, user.id),
    getDashboardStats(supabase, user.id),
  ]);

  return (
    <div className="space-y-6">
      <Card className="animate-fade-up border-border/80 bg-white">
        <CardHeader>
          <CardTitle className="text-2xl">通常学習</CardTitle>
          <CardDescription>
            新規問題を中心に出題します。復習対象は {stats.dueReviewCount} 問あります。
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <LearnSession mode="learn" question={question} />
        </CardContent>
      </Card>
    </div>
  );
}
