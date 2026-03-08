"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { advanceRunTickResult, pauseRunResult, resumeRunResult } from "@/lib/api";

type RunControlPanelProps = {
  runId: string;
  status?: string;
};

export function RunControlPanel({ runId, status }: RunControlPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const isRunning = status === "running";

  const formatActionError = (error: string | null) => {
    if (error === "network_error") return "后端当前不可达。";
    if (error === "not_found") return "运行不存在。";
    return "请求失败，请稍后重试。";
  };

  const handlePause = () => {
    startTransition(async () => {
      const result = await pauseRunResult(runId);
      if (!result.data) {
        setMessage(`暂停失败，${formatActionError(result.error)}`);
        return;
      }
      setMessage("⏸️ 世界已暂停，居民活动停止");
      router.refresh();
    });
  };

  const handleResume = () => {
    startTransition(async () => {
      const result = await resumeRunResult(runId);
      if (!result.data) {
        setMessage(`恢复失败，${formatActionError(result.error)}`);
        return;
      }
      setMessage("▶️ 世界已恢复运行");
      router.refresh();
    });
  };

  const handleStepTick = () => {
    startTransition(async () => {
      const result = await advanceRunTickResult(runId);
      if (!result.data) {
        setMessage(`推进 tick 失败，${formatActionError(result.error)}`);
        return;
      }
      setMessage(
        `⏩ 手动推进 Tick ${result.data.tick_no}，accepted=${result.data.accepted_count}，rejected=${result.data.rejected_count}`
      );
      router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      {isRunning ? (
        <button
          type="button"
          disabled={isPending}
          onClick={handlePause}
          className="rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-600 disabled:opacity-60"
        >
          暂停
        </button>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={handleResume}
          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-60"
        >
          恢复
        </button>
      )}

      <button
        type="button"
        disabled={isPending}
        onClick={handleStepTick}
        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-moss hover:text-moss disabled:opacity-60"
      >
        推进
      </button>

      {message && (
        <span className="ml-2 text-sm text-slate-500">{message}</span>
      )}
    </div>
  );
}
