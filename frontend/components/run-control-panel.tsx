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
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span
          className={`h-3 w-3 rounded-full ${
            isRunning ? "animate-pulse bg-emerald-500" : "bg-amber-500"
          }`}
        />
        <span className="text-sm font-medium text-slate-700">
          {isRunning ? "世界正在自主运行，居民会持续行动" : "世界已暂停，适合观察和注入事件"}
        </span>
      </div>

      <div className="flex flex-wrap gap-3">
        {isRunning ? (
          <button
            type="button"
            disabled={isPending}
            onClick={handlePause}
            className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-60"
          >
            <span>暂停世界</span>
          </button>
        ) : (
          <button
            type="button"
            disabled={isPending}
            onClick={handleResume}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            <span>恢复运行</span>
          </button>
        )}

        <button
          type="button"
          disabled={isPending}
          onClick={handleStepTick}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-moss hover:text-moss disabled:opacity-60"
        >
          <span>手动推进一帧</span>
        </button>
      </div>

      {message ? (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {message}
        </p>
      ) : null}

      <p className="text-xs leading-5 text-slate-500">
        运行态适合观察整体节奏；暂停后可以逐帧推进，检查事件触发和角色反应。
      </p>
    </div>
  );
}
