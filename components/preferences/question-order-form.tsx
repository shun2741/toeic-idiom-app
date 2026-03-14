"use client";

import { useFormStatus } from "react-dom";

import { saveQuestionOrderModeAction } from "@/lib/actions/preferences";
import {
  labelQuestionOrderMode,
  QUESTION_ORDER_MODES,
} from "@/lib/preferences/question-order";
import type { QuestionOrderMode } from "@/lib/types";

import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} size="sm" type="submit">
      {pending ? "保存中..." : "出題モードを適用"}
    </Button>
  );
}

export function QuestionOrderForm({
  selectedMode,
  description,
}: {
  selectedMode: QuestionOrderMode;
  description?: string;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-slate-50 p-5">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-950">出題モード</p>
        <p className="text-sm leading-6 text-slate-600">
          {description ??
            "順番どおり、ランダム、未着手優先、苦手優先から選べます。通常学習だけに反映されます。"}
        </p>
      </div>

      <form action={saveQuestionOrderModeAction} className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {QUESTION_ORDER_MODES.map((questionOrderMode) => (
            <label
              key={questionOrderMode}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              <input
                defaultChecked={selectedMode === questionOrderMode}
                className="h-4 w-4 accent-[hsl(var(--primary))]"
                name="questionOrderMode"
                type="radio"
                value={questionOrderMode}
              />
              {labelQuestionOrderMode(questionOrderMode)}
            </label>
          ))}
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
