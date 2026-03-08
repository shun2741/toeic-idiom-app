"use client";

import { useFormStatus } from "react-dom";

import { saveQuestionSourceModeAction } from "@/lib/actions/preferences";
import {
  labelQuestionSourceMode,
  QUESTION_SOURCE_MODES,
} from "@/lib/preferences/question-source";
import type { QuestionSourceMode } from "@/lib/types";

import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} size="sm" type="submit">
      {pending ? "保存中..." : "出題対象を適用"}
    </Button>
  );
}

export function QuestionSourceForm({
  selectedMode,
  checkedCount,
  description,
}: {
  selectedMode: QuestionSourceMode;
  checkedCount: number;
  description?: string;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-slate-50 p-5">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-950">出題対象</p>
        <p className="text-sm leading-6 text-slate-600">
          {description ?? `現在チェック済みの問題は ${checkedCount} 件です。`}
        </p>
      </div>

      <form action={saveQuestionSourceModeAction} className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {QUESTION_SOURCE_MODES.map((questionSourceMode) => (
            <label
              key={questionSourceMode}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              <input
                defaultChecked={selectedMode === questionSourceMode}
                className="h-4 w-4 accent-[hsl(var(--primary))]"
                name="questionSourceMode"
                type="radio"
                value={questionSourceMode}
              />
              {labelQuestionSourceMode(questionSourceMode)}
            </label>
          ))}
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
