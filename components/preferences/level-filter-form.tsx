"use client";

import { useFormStatus } from "react-dom";

import { resetLevelBandsAction, saveLevelBandsAction } from "@/lib/actions/preferences";
import { LEVEL_BANDS, labelLevelBand } from "@/lib/preferences/level-filter";
import type { LevelBand } from "@/lib/types";

import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} size="sm" type="submit">
      {pending ? "保存中..." : "学習レベルを適用"}
    </Button>
  );
}

function ResetButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} size="sm" type="submit" variant="outline">
      すべて選択
    </Button>
  );
}

export function LevelFilterForm({
  selectedBands,
  description,
}: {
  selectedBands: LevelBand[];
  description?: string;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-slate-50 p-5">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-950">出題レベル</p>
        <p className="text-sm leading-6 text-slate-600">
          {description ??
            "通常学習で出したいレベル帯を選びます。復習キューはレベル設定に関係なく優先して出題します。"}
        </p>
      </div>

      <form action={saveLevelBandsAction} className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {LEVEL_BANDS.map((levelBand) => (
            <label
              key={levelBand}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              <input
                defaultChecked={selectedBands.includes(levelBand)}
                className="h-4 w-4 accent-[hsl(var(--primary))]"
                name="levelBand"
                type="checkbox"
                value={levelBand}
              />
              {labelLevelBand(levelBand)}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          <SubmitButton />
        </div>
      </form>

      <form action={resetLevelBandsAction}>
        <ResetButton />
      </form>
    </div>
  );
}
