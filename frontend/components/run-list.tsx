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
  was_running_before_restart?: boolean;
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
      <div className="flex flex-col items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-white/80 py-16 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-50">
          <span className="text-3xl">🌱</span>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-600">还没有运行</p>
        <p className="mt-1 text-xs text-slate-400">在上方创建第一个模拟运行</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {runs.map((run) => {
          const isRunning = run.status === "running";
          const isPaused = run.status === "paused";
          return (
            <div
              key={run.id}
              className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white/85 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-moss hover:shadow-md"
            >
              <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-mist/70 blur-2xl" />
              <div className="flex items-start justify-between gap-3">
                <Link href={`/runs/${run.id}`} className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Run</p>
                  <h3 className="mt-2 truncate text-lg font-semibold text-ink transition-colors group-hover:text-moss">
                    {run.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400">ID {run.id.slice(0, 8)}...</p>
                </Link>
                <div
                  className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
                    isRunning
                      ? "animate-pulse bg-emerald-400"
                      : isPaused
                      ? "bg-amber-400"
                      : "bg-slate-300"
                  }`}
                />
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      isRunning
                        ? "bg-emerald-50 text-emerald-700"
                        : isPaused
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isRunning ? "运行中" : isPaused ? "已暂停" : run.status}
                  </span>
                  {run.was_running_before_restart && (
                    <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-600">
                      待恢复
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  Tick <span className="font-medium text-slate-600">{run.current_tick ?? 0}</span>
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <Link
                  href={`/runs/${run.id}`}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-medium text-ink transition hover:border-moss hover:text-moss"
                >
                  打开总览
                </Link>
                <Link
                  href={`/runs/${run.id}/world`}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-center text-sm font-medium text-slate-600 transition hover:border-moss hover:text-moss"
                >
                  世界视图
                </Link>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                <p className="text-xs text-slate-400">
                  {isRunning ? "居民正在持续活动" : isPaused ? "暂停后适合排查行为" : "等待进一步操作"}
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(run.id)}
                  disabled={isPending && deletingId === run.id}
                  className="flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                  title="删除"
                >
                  {deletingId === run.id ? (
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-200 border-t-red-400" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18" />
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    </svg>
                  )}
                  删除
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {runs.length > 1 && (
        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={isDeletingAll || isPending}
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
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
      )}
    </div>
  );
}
