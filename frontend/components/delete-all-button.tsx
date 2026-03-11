"use client";

import { useState, useTransition } from "react";
import { deleteRunResult } from "@/lib/api";
import { useRuns } from "@/components/runs-provider";

type Run = { id: string };

export function DeleteAllButton({ runs }: { runs: Run[] }) {
  const { refreshRuns } = useRuns();
  const [isPending, startTransition] = useTransition();
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  const handleDeleteAll = () => {
    if (!confirm(`确定要删除全部 ${runs.length} 个模拟运行吗？此操作不可撤销。`)) return;
    setIsDeletingAll(true);
    startTransition(async () => {
      const results = await Promise.all(runs.map((run) => deleteRunResult(run.id)));
      setIsDeletingAll(false);
      const failedCount = results.filter((result) => !result.data).length;
      if (failedCount > 0) {
        alert(`批量删除未全部成功，失败 ${failedCount} 个。`);
      }
      await refreshRuns();
    });
  };

  return (
    <button
      type="button"
      onClick={handleDeleteAll}
      disabled={isDeletingAll || isPending}
      className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-400 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
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
  );
}
