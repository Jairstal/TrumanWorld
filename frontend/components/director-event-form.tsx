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
    "广场集合通知",
    "咖啡馆临时停电",
    "今日市集开始营业",
    "晚上在广场播放电影",
  ];

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await injectDirectorEvent(runId, {
            event_type: eventType,
            payload: { message },
            importance: 0.8,
          });
          setStatusMessage(result ? "事件已注入，请刷新 timeline 查看。" : "注入失败，可能是后端未启动。");
        });
      }}
    >
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-moss">导演干预</p>
            <h2 className="mt-2 text-lg font-semibold text-ink">注入一条会被居民感知的世界事件</h2>
            <p className="mt-1 text-sm text-slate-500">
              适合制造剧情节点、广播消息或测试角色对公共事件的反应。
            </p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            当前默认广播到全体居民
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setMessage(preset)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition hover:border-moss hover:text-moss"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-ink">事件类型</span>
        <input
          value={eventType}
          onChange={(event) => setEventType(event.target.value)}
          className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-moss"
        />
        <p className="text-xs text-slate-500">当前接口仍使用事件类型字符串，后续可以继续收敛成下拉选项。</p>
      </label>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-ink">事件内容</span>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="min-h-32 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-moss"
        />
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex rounded-full bg-ember px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending ? "正在注入..." : "注入事件"}
        </button>
        <p className="text-xs text-slate-500">建议搭配时间线和世界视图一起观察结果。</p>
      </div>
      {statusMessage ? (
        <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {statusMessage}
        </p>
      ) : null}
    </form>
  );
}
