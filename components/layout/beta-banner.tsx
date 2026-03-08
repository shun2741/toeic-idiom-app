export function BetaBanner() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p>
          ベータ版公開中です。機能や文言は調整中のため、学習結果や表示が一部変わることがあります。
        </p>
        <p className="text-sm font-semibold">少人数向けテスト運用中</p>
      </div>
    </div>
  );
}
