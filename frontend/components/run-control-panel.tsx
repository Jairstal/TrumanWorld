"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { advanceRunTick, pauseRun, resumeRun } from "@/lib/api";

type RunControlPanelProps = {
  runId: string;
  status?: string;
};

export function RunControlPanel({ runId, status }: RunControlPanelProps) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const isRunning = status === "running";
  const isPaused = status === "paused";

  const handlePause = () => {
    startTransition(async () => {
      const result = await pauseRun(runId);
      if (!result) {
        setMessage("暂停失败，可能是后端未启动。");
        return;
      }
      setMessage("⏸️ 世界已暂停，居民活动停止");
      router.refresh();
    });
  };

  const handleResume = () => {
    startTransition(async () => {
      const result = await resumeRun(runId);
      if (!result) {
        setMessage("恢复失败，可能是后端未启动。");
        return;
      }
      setMessage("▶️ 世界已恢复运行");
      router.refresh();
    });
  };

  const handleStepTick = () => {
    startTransition(async () => {
      const result = await advanceRunTick(runId);
      if (!result) {
        setMessage("推进 tick 失败，可能是后端未启动。");
        return;
      }
      setMessage(
        `⏩ 手动推进 Tick ${result.tick_no}，accepted=${result.accepted_count}，rejected=${result.rejected_count}`
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
