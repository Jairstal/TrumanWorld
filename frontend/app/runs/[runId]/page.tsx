import Link from "next/link";

import { DirectorEventForm } from "@/components/director-event-form";
import { RunControlPanel } from "@/components/run-control-panel";
import { getRun, listAgents } from "@/lib/api";

type RunPageProps = {
  params: Promise<{ runId: string }>;
};

export default async function RunPage({ params }: RunPageProps) {
  const { runId } = await params;
  const [run, agentList] = await Promise.all([getRun(runId), listAgents(runId)]);
  const agentCount = agentList.agents.length;
  const isRunning = run?.status === "running";

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(247,243,232,0.9),_rgba(238,245,241,0.94)_38%,_rgba(248,250,252,1))]">
      {/* 头部 */}
      <div className="flex items-center justify-between border-b border-white/60 bg-white/70 px-6 py-4 backdrop-blur">
        <div className="flex items-center gap-4">
          <Link href="/" className="group flex items-center gap-1.5 text-sm text-slate-500 hover:text-moss">
            <svg className="h-4 w-4 transition group-hover:-translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>控制台</span>
          </Link>
          <div className="h-4 w-px bg-slate-300" />
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-ink">{run?.name ?? "Run"}</h1>
            <span className={`h-2 w-2 rounded-full ${isRunning ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span className="text-sm text-slate-500">
              Tick {run?.current_tick ?? 0} · {agentCount} 位居民
            </span>
          </div>
        </div>
        <div className="text-sm text-slate-400">{runId.slice(0, 8)}</div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            {/* 世界状态 + 控制 */}
            <section className="flex items-center justify-between rounded-xl border border-white/70 bg-white/75 p-3 shadow-sm backdrop-blur">
              <div className="flex items-center gap-3">
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isRunning ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}>
                  {isRunning ? (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium text-ink">
                  {isRunning ? "运行中" : "已暂停"}
                </span>
              </div>
              <RunControlPanel runId={runId} status={run?.status} />
            </section>

            {/* 快捷入口 */}
            <section className="grid gap-3 sm:grid-cols-2">
              <Link
                href={`/runs/${runId}/world`}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:border-moss hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6l9-4 9 4v12l-9 4-9-4V6z" />
                    <path d="M12 22V12" />
                    <path d="M12 12L3 6" />
                    <path d="M12 12l9-6" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-medium text-ink">World Viewer</h3>
                  <p className="truncate text-sm text-slate-400">地图 · 事件 · 居民</p>
                </div>
              </Link>

              <Link
                href={`/runs/${runId}/timeline`}
                className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:border-ink hover:shadow-md"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 3" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-medium text-ink">Timeline</h3>
                  <p className="truncate text-sm text-slate-400">事件回溯 · 行为链路</p>
                </div>
              </Link>
            </section>

            {/* 导演事件注入 - 直接放表单 */}
            <section className="rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
              <DirectorEventForm runId={runId} />
            </section>
          </div>

          {/* 侧边栏 - 居民列表 */}
          <aside className="min-h-0">
            <section className="rounded-xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-medium text-slate-600">居民</h3>
                <span className="text-sm text-slate-400">{agentCount}</span>
              </div>

              <div className="space-y-1">
                {agentList.agents.length === 0 ? (
                  <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">暂无居民</p>
                ) : (
                  agentList.agents.map((agent) => (
                    <Link
                      key={agent.id}
                      href={`/runs/${runId}/agents/${agent.id}`}
                      className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-moss/20 to-moss/5 text-sm font-medium text-moss">
                        {agent.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{agent.name}</p>
                        <p className="truncate text-xs text-slate-400">{agent.occupation ?? "居民"}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
