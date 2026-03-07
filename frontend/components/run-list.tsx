"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteRun } from "@/lib/api";

type Run = {
  id: string;
  name: string;
  status: string;
  current_tick?: number;
};

type RunListProps = {
  runs: Run[];
  onDeleteAll?: () => void;
};

export function RunList({ runs, onDeleteAll }: RunListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleDelete = (runId: string) => {
    if (!confirm("确定要删除这个模拟运行吗？此操作不可撤销。")) {
      return;
    }

    setDeletingId(runId);
    startTransition(async () => {
      const result = await deleteRun(runId);
      if (result) {
        router.refresh();
      } else {
        alert("删除失败，请重试。");
      }
      setDeletingId(null);
    });
  };

  const handleDeleteAll = () => {
    if (runs.length === 0) return;
    if (!confirm(`确定要删除全部 ${runs.length} 个模拟运行吗？此操作不可撤销。`)) {
      return;
    }
    setIsDeletingAll(true);
    startTransition(async () => {
      await Promise.all(runs.map((run) => deleteRun(run.id)));
      setIsDeletingAll(false);
      if (onDeleteAll) onDeleteAll();
      router.refresh();
    });
  };

  if (runs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-16 text-center">
        <span className="text-3xl">🌱</span>
        <p className="mt-3 text-sm font-medium text-slate-500">还没有运行</p>
        <p className="mt-1 text-xs text-slate-400">在左侧创建第一个模拟运行</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 删除全部按钮 */}
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleDeleteAll}
          disabled={isDeletingAll || isPending}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
        >
          {isDeletingAll ? (
            <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-red-400" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
            </svg>
          )}
          删除全部
        </button>
      </div>
      <div className="grid gap-2">
        {runs.map((run) => {
        const isRunning = run.status === "running";
        const isPaused = run.status === "paused";
        return (
          <div
            key={run.id}
            className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-moss hover:shadow-sm"
          >
            {/* 状态指示点 */}
            <div
              className={`h-2 w-2 flex-shrink-0 rounded-full ${
                isRunning
                  ? "animate-pulse bg-emerald-400"
                  : isPaused
                  ? "bg-amber-400"
                  : "bg-slate-300"
              }`}
            />
            <Link href={`/runs/${run.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{run.name}</span>
              <div className="flex flex-shrink-0 items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    isRunning
                      ? "bg-emerald-50 text-emerald-700"
                      : isPaused
                      ? "bg-amber-50 text-amber-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {run.status}
                </span>
                <span className="text-xs text-slate-400">Tick {run.current_tick ?? 0}</span>
              </div>
            </Link>
            <button
              type="button"
              onClick={() => handleDelete(run.id)}
              disabled={isPending && deletingId === run.id}
              className="ml-1 rounded-lg p-1.5 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-400 group-hover:opacity-100 disabled:opacity-50"
              title="删除"
            >
              {deletingId === run.id ? (
                <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-200 border-t-red-400" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              )}
            </button>
          </div>
        );
      })}
      </div>
    </div>
  );
}
