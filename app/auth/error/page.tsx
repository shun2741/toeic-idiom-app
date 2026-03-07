import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
      <Card className="w-full border-white/80 bg-white/92">
        <CardHeader>
          <CardTitle className="text-2xl">ログインで問題が発生しました</CardTitle>
          <CardDescription>Google 認証の設定またはコールバック URL を確認してください。</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-3xl bg-slate-50 p-5 text-sm leading-7 text-slate-600">
            {message ?? "認証エラーの詳細は取得できませんでした。"}
          </div>
          <Link href="/">
            <Button>トップへ戻る</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
