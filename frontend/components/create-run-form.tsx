"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createRun } from "@/lib/api";

export function CreateRunForm() {
  const router = useRouter();
  const [name, setName] = useState("demo-run");
  const [seedDemo, setSeedDemo] = useState(true);
  const [message, setMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const suggestions = ["demo-run", "town-morning", "story-lab", "night-shift"];

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        startTransition(async () => {
          const result = await createRun(name, seedDemo);
          if (result) {
            setMessage(`已创建：${result.name}`);
            router.push(`/runs/${result.id}`);
            router.refresh();
          } else {
            setMessage("创建失败，后端可能未启动");
          }
        });
      }}
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_320px]">
        <div className="space-y-5">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">模拟名称</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-slate-400 outline-none transition focus:border-moss focus:bg-white/20"
              placeholder="输入模拟运行名称"
            />
          </label>

          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">推荐命名</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setName(suggestion)}
                  className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs text-slate-200 transition hover:border-white/30 hover:bg-white/14"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/8 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">初始化方式</p>
          <label className="mt-4 flex items-start gap-3">
            <input
              type="checkbox"
              checked={seedDemo}
              onChange={(event) => setSeedDemo(event.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-white/30 bg-white/10 text-moss focus:ring-moss focus:ring-offset-0"
            />
            <span className="text-sm leading-6 text-slate-200">
              使用 demo world
              <span className="block text-xs text-slate-400">
                自动填充基础地点与居民，适合演示和调试导演控制台。
              </span>
            </span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-full bg-moss px-5 py-2.5 text-sm font-medium text-white transition hover:bg-moss/90 disabled:opacity-60"
        >
          {isPending ? (
            <>
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              创建中...
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              创建运行
            </>
          )}
        </button>
        <p className="text-xs text-slate-300">创建后会自动进入该 run 的导演驾驶舱。</p>
      </div>

      {message && (
        <p
          className={`rounded-2xl border px-4 py-3 text-sm ${
            message.includes("失败")
              ? "border-red-400/30 bg-red-500/10 text-red-200"
              : "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
