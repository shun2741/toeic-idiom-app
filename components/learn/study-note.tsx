"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

const STORAGE_PREFIX = "tic-study-note";

export function StudyNote({
  questionId,
  guestMode,
}: {
  questionId: string;
  guestMode?: boolean;
}) {
  const storageKey = useMemo(() => `${STORAGE_PREFIX}:${questionId}`, [questionId]);
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "saved">("idle");

  useEffect(() => {
    const saved = typeof window === "undefined" ? "" : window.localStorage.getItem(storageKey) ?? "";
    setValue(saved);
    setStatus("idle");
  }, [storageKey]);

  function handleSave() {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKey, value.trim());
    setStatus("saved");
    window.setTimeout(() => setStatus("idle"), 1600);
  }

  function handleClear() {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(storageKey);
    setValue("");
    setStatus("idle");
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-slate-50 p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-950">この問題の学習メモ</p>
        <p className="text-sm leading-6 text-slate-600">
          {guestMode
            ? "この端末に保存されます。思い出し方や間違えたポイントを残せます。"
            : "この端末に保存されます。前置詞の間違い方や自分なりの覚え方を残しておけます。"}
        </p>
      </div>
      <textarea
        className="min-h-28 w-full rounded-2xl border border-input bg-white px-4 py-3 text-sm leading-7 text-slate-800 outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/10"
        placeholder="例: for を忘れやすい。delay と一緒に覚える。"
        value={value}
        onChange={(event) => {
          setValue(event.target.value);
          if (status !== "idle") {
            setStatus("idle");
          }
        }}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" type="button" onClick={handleSave}>
          メモを保存
        </Button>
        <Button size="sm" type="button" variant="outline" onClick={handleClear}>
          消去
        </Button>
        {status === "saved" ? <p className="text-sm text-emerald-700">保存しました。</p> : null}
      </div>
    </div>
  );
}
