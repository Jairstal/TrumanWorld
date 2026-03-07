import Link from "next/link";

import { DirectorEventForm } from "@/components/director-event-form";
import { MetricChip } from "@/components/metric-chip";
import { RunControlPanel } from "@/components/run-control-panel";
import { getRun, listAgents } from "@/lib/api";

type RunPageProps = {
  params: Promise<{ runId: string }>;
};

export default async function RunPage({ params }: RunPageProps) {
  const { runId } = await params;
  const [run, agentList] = await Promise.all([getRun(runId), listAgents(runId)]);
  const agentCount = agentList.agents.length;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(247,243,232,0.9),_rgba(238,245,241,0.94)_38%,_rgba(248,250,252,1))]">
      <div className="border-b border-white/60 bg-white/70 px-8 py-5 backdrop-blur">
        <Link href="/" className="text-xs uppercase tracking-[0.25em] text-moss hover:text-ink">
          ← 导演控制台
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-ink">{run ? run.name : "Run"}</h1>
            <p className="mt-1 text-sm text-slate-500">
              运行编号 {runId.slice(0, 8)}... · 当前用于导播控制、世界观察和事件注入
            </p>
          </div>
          <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs text-slate-600 shadow-sm">
            导演驾驶舱
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_340px]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-sm backdrop-blur">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-moss">世界状态</p>
                  <h2 className="mt-2 text-2xl font-semibold text-ink">
                    {run?.status === "running" ? "世界正在推进" : "世界暂停中"}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    这里是当前 run 的总览页。优先查看世界节奏，再决定进入地图视图、时间线，或直接注入事件。
                  </p>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">当前主任务</p>
                  <p className="mt-1 text-sm font-medium text-ink">观察状态，必要时干预剧情</p>
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <MetricChip label="Run" value={run?.name ?? "-"} />
                <MetricChip label="Status" value={run?.status ?? "-"} />
                <MetricChip label="Tick" value={run?.current_tick ?? "-"} />
                <MetricChip label="Residents" value={agentCount} />
              </div>

              <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-5">
                <RunControlPanel runId={runId} status={run?.status} />
              </div>
            </section>

            <section className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)_minmax(280px,0.8fr)]">
              <Link
                href={`/runs/${runId}/world`}
                className="group rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(228,239,232,0.92))] p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-moss hover:shadow-md"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-moss">Primary View</p>
                <h2 className="mt-3 text-2xl font-semibold text-ink">进入 World Viewer</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  查看小镇地图、地点状态、居民分布和实时事件，适合追踪当前世界节奏。
                </p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition group-hover:text-moss">
                  打开地图视图 <span aria-hidden>→</span>
                </div>
              </Link>

              <Link
                href={`/runs/${runId}/timeline`}
                className="group rounded-[28px] border border-slate-200 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(241,244,249,0.92))] p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-ink hover:shadow-md"
              >
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Event Flow</p>
                <h2 className="mt-3 text-2xl font-semibold text-ink">查看 Timeline</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  按 tick 回溯事件流，适合确认导演注入是否生效，或者分析角色行为链路。
                </p>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition group-hover:text-moss">
                  打开时间线 <span aria-hidden>→</span>
                </div>
              </Link>

              <div className="rounded-[28px] border border-slate-200 bg-white/80 p-6 shadow-sm">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Residents</p>
                <h2 className="mt-3 text-2xl font-semibold text-ink">{agentCount}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  右侧面板可直接进入居民详情，查看个人记忆、关系和最近行为。
                </p>
                <div className="mt-6 space-y-2">
                  {agentList.agents.slice(0, 3).map((agent) => (
                    <div key={agent.id} className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      {agent.name}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-white/70 bg-white/75 p-6 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">导演事件注入</p>
              <p className="mt-2 mb-5 max-w-2xl text-sm leading-6 text-slate-500">
                用一条公共事件改变世界氛围，观察居民如何响应。这里先保留底层表单能力，同时提供更清晰的操作说明。
              </p>
              <DirectorEventForm runId={runId} />
            </section>
          </div>

          <aside className="min-h-0 space-y-4">
            <section className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">居民列表</p>
              <h2 className="mt-2 text-xl font-semibold text-ink">{agentCount} 位居民</h2>
              <p className="mt-1 text-sm text-slate-500">从这里进入单个角色详情，追踪其状态与目标。</p>

              <div className="mt-5 space-y-2">
                {agentList.agents.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">当前 run 还没有 agents。</p>
                ) : (
                  agentList.agents.map((agent) => (
                    <Link
                      key={agent.id}
                      href={`/runs/${runId}/agents/${agent.id}`}
                      className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-moss hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">{agent.name}</p>
                          <p className="mt-1 truncate text-xs text-slate-400">
                            {agent.occupation ?? "resident"} · {agent.current_goal ?? "暂无公开目标"}
                          </p>
                        </div>
                        <span className="rounded-full bg-mist px-2 py-1 text-[10px] uppercase tracking-wide text-moss">
                          Agent
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">建议路径</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>1. 先看世界状态和运行节奏。</p>
                <p>2. 进入 World Viewer 定位当前活跃地点。</p>
                <p>3. 必要时注入事件，再回 Timeline 验证效果。</p>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
