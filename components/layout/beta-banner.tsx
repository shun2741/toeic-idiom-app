import Link from "next/link";

export function BetaBanner() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          ベータ版公開中です。機能や文言は調整中のため、気づいた点はフィードバックからお知らせください。
        </p>
        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          <Link className="text-amber-900 underline underline-offset-4" href="/feedback">
            フィードバックを送る
          </Link>
          <Link className="text-amber-900 underline underline-offset-4" href="/privacy">
            プライバシーポリシー
          </Link>
        </div>
      </div>
    </div>
  );
}
