"use client";

import { useFormStatus } from "react-dom";

import { saveQuestionTypeAction } from "@/lib/actions/preferences";
import { labelQuestionType, QUESTION_TYPES } from "@/lib/preferences/question-type";
import type { QuestionType } from "@/lib/types";

import { Button } from "@/components/ui/button";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button disabled={pending} size="sm" type="submit">
      {pending ? "保存中..." : "出題形式を適用"}
    </Button>
  );
}

export function QuestionTypeForm({
  selectedType,
  description,
}: {
  selectedType: QuestionType;
  description?: string;
}) {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-slate-50 p-5">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-950">出題形式</p>
        <p className="text-sm leading-6 text-slate-600">
          {description ??
            "通常学習で使う問題形式を選びます。単体問題に加えて、例文の和訳と英訳も選べます。"}
        </p>
      </div>

      <form action={saveQuestionTypeAction} className="space-y-4">
        <div className="flex flex-wrap gap-3">
          {QUESTION_TYPES.map((questionType) => (
            <label
              key={questionType}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              <input
                defaultChecked={selectedType === questionType}
                className="h-4 w-4 accent-[hsl(var(--primary))]"
                name="questionType"
                type="radio"
                value={questionType}
              />
              {labelQuestionType(questionType)}
            </label>
          ))}
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
