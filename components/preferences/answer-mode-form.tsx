"use client";

import { useFormStatus } from "react-dom";

import { saveAnswerModeAction } from "@/lib/actions/preferences";
import { ANSWER_MODES, labelAnswerMode } from "@/lib/preferences/answer-mode";
import type { AnswerMode } from "@/lib/types";

import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} size="sm" type="submit">
      {pending ? "保存中..." : "回答形式を適用"}
    </Button>
  );
}

export function AnswerModeForm({
  selectedMode,
  description,
}: {
  selectedMode: AnswerMode;
  description?: string;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-slate-50 p-5">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-950">回答形式</p>
        <p className="text-sm leading-6 text-slate-600">
          {description ?? "スマホで入力しやすい選択式と、しっかり想起する自由入力を切り替えられます。"}
        </p>
      </div>

      <form action={saveAnswerModeAction} className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {ANSWER_MODES.map((answerMode) => (
            <label
              key={answerMode}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              <input
                defaultChecked={selectedMode === answerMode}
                className="h-4 w-4 accent-[hsl(var(--primary))]"
                name="answerMode"
                type="radio"
                value={answerMode}
              />
              {labelAnswerMode(answerMode)}
            </label>
          ))}
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
