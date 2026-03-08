"use client";

import { useState, useTransition } from "react";

import { injectDirectorEvent } from "@/lib/api";

type DirectorEventFormProps = {
  runId: string;
};

export function DirectorEventForm({ runId }: DirectorEventFormProps) {
  const [eventType, setEventType] = useState("broadcast");
  const [message, setMessage] = useState("Town hall at plaza");
  const [statusMessage, setStatusMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const presets = [
    "广场集合",
    "停电通知",
    "市集营业",
    "电影放映",
  ];

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await injectDirectorEvent(runId, {
            event_type: eventType,
            payload: { message },
            importance: 0.8,
          });
          setStatusMessage(result ? "已注入" : "失败");
          setTimeout(() => setStatusMessage(""), 3000);
        });
      }}
    >
      {/* 标题 + 预设 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-ink">导演干预</span>
          <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-600">广播全体</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setMessage(preset)}
              className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-500 transition hover:border-moss hover:text-moss"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* 表单字段 */}
      <div className="space-y-2">
        <label className="block">
          <span className="text-sm text-slate-500">事件内容</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={2}
            className="mt-1.5 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-base outline-none transition focus:border-moss"
            placeholder="输入要广播给居民的消息..."
          />
        </label>
        <input type="hidden" value={eventType} />
      </div>

      {/* 提交 + 状态 */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full bg-ember px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending ? "注入中..." : "注入事件"}
        </button>
        {statusMessage && (
          <span className={`text-sm ${statusMessage === "已注入" ? "text-emerald-600" : "text-red-500"}`}>
            {statusMessage}
          </span>
        )}
      </div>
    </form>
  );
}
