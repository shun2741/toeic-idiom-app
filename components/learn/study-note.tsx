"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";

const STORAGE_PREFIX = "tic-study-note";

type SharedNote = {
  content: string;
  updatedAt: string;
} | null;

export function StudyNote({
  questionId,
  guestMode,
}: {
  questionId: string;
  guestMode?: boolean;
}) {
  const storageKey = useMemo(() => `${STORAGE_PREFIX}:${questionId}`, [questionId]);
  const [value, setValue] = useState("");
  const [sharedNote, setSharedNote] = useState<SharedNote>(null);
  const [status, setStatus] = useState<"idle" | "saved" | "shared_saved">("idle");
  const [loadError, setLoadError] = useState("");
  const [isPublishing, startPublishing] = useTransition();

  useEffect(() => {
    const saved =
      typeof window === "undefined" ? "" : window.localStorage.getItem(storageKey) ?? "";
    setValue(saved);
    setSharedNote(null);
    setLoadError("");
    setStatus("idle");

    let cancelled = false;

    async function loadSharedNote() {
      try {
        const response = await fetch(
          `/api/shared-notes?questionId=${encodeURIComponent(questionId)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (!response.ok) {
          if (!cancelled) {
            setLoadError("共有メモを読み込めませんでした。");
          }
          return;
        }

        const payload = (await response.json()) as {
          note: SharedNote;
        };

        if (cancelled) {
          return;
        }

        setSharedNote(payload.note);
        if (!saved && payload.note?.content) {
          setValue(payload.note.content);
        }
      } catch {
        if (!cancelled) {
          setLoadError("共有メモを読み込めませんでした。");
        }
      }
    }

    void loadSharedNote();

    return () => {
      cancelled = true;
    };
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

  function handlePublish() {
    if (guestMode) {
      return;
    }

    startPublishing(async () => {
      const response = await fetch("/api/shared-notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId,
          content: value,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; note?: SharedNote }
        | null;

      if (!response.ok) {
        window.alert(payload?.error ?? "共有メモの反映に失敗しました。");
        return;
      }

      setSharedNote(payload?.note ?? null);
      setStatus("shared_saved");
      window.setTimeout(() => setStatus("idle"), 1800);
    });
  }

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-slate-50 p-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold text-slate-950">この問題の学習メモ</p>
        <p className="text-sm leading-6 text-slate-600">
          {guestMode
            ? "この端末に保存されます。思い出し方や間違えたポイントを残せます。"
            : "下書きはこの端末に保存されます。必要なものだけ共有に反映すると、他の人の画面にも表示されます。"}
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
          下書きを保存
        </Button>
        {!guestMode ? (
          <Button
            disabled={isPublishing}
            size="sm"
            type="button"
            variant="secondary"
            onClick={handlePublish}
          >
            {isPublishing ? "反映中..." : "共有に反映"}
          </Button>
        ) : null}
        <Button size="sm" type="button" variant="outline" onClick={handleClear}>
          消去
        </Button>
        {status === "saved" ? <p className="text-sm text-emerald-700">下書きを保存しました。</p> : null}
        {status === "shared_saved" ? (
          <p className="text-sm text-emerald-700">共有内容を反映しました。</p>
        ) : null}
      </div>
      {!guestMode ? (
        <div className="rounded-2xl border border-border bg-white px-4 py-4">
          <p className="text-sm font-semibold text-slate-950">現在の共有メモ</p>
          {sharedNote?.content ? (
            <>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {sharedNote.content}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                最終反映: {formatDateTime(sharedNote.updatedAt)}
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm leading-7 text-slate-500">
              まだ共有されていません。必要な内容だけ「共有に反映」で公開できます。
            </p>
          )}
          {loadError ? <p className="mt-2 text-xs text-rose-600">{loadError}</p> : null}
        </div>
      ) : null}
      {guestMode ? (
        <p className="text-xs text-slate-500">
          体験モードでは共有反映は使えません。ログインすると他の人に見せる内容を反映できます。
        </p>
      ) : null}
    </div>
  );
}
