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

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* 顶部标题栏 */}
      <div className="flex-shrink-0 border-b border-slate-200/60 bg-white/60 px-8 py-4 backdrop-blur">
        <Link href="/" className="text-xs uppercase tracking-[0.25em] text-moss hover:text-ink">
          ← 导演控制台
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-ink">
          {run ? run.name : "Run"}
          <span className="ml-3 text-sm font-normal text-slate-400">{runId.slice(0, 8)}...</span>
        </h1>
      </div>

      {/* 主内容区：左右分栏 */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* 左侧主区域：状态 + 导航 + 居民 */}
        <div className="flex flex-1 flex-col overflow-hidden border-r border-slate-200/60">
          {/* 世界状态 */}
          <div className="flex-shrink-0 border-b border-slate-200/40 bg-white/40 px-6 py-4">
            <p className="mb-3 text-xs uppercase tracking-widest text-slate-400">世界状态</p>
            {run ? (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-3">
                  <MetricChip label="Name" value={run.name} />
                  <MetricChip label="Status" value={run.status} />
                  <MetricChip label="Tick" value={run.current_tick ?? "-"} />
                  <MetricChip label="Tick Minutes" value={run.tick_minutes ?? "-"} />
                </div>
                <RunControlPanel runId={runId} status={run.status} />
              </div>
            ) : (
              <p className="text-sm text-slate-500">后端暂不可用，当前展示为占位状态。</p>
            )}
          </div>

          {/* 导航卡片 */}
          <div className="flex-shrink-0 border-b border-slate-200/40 bg-white/20 px-6 py-4">
            <div className="grid grid-cols-3 gap-3">
              <Link
                href={`/runs/${runId}/world`}
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3 transition hover:border-moss hover:shadow-sm"
              >
                <div>
                  <p className="text-xs uppercase tracking-widest text-moss">Viewer</p>
                  <p className="mt-0.5 text-sm font-semibold text-ink">World Viewer</p>
                  <p className="mt-0.5 text-xs text-slate-400">小镇地图与人物分布</p>
                </div>
                <span className="text-slate-300 group-hover:text-moss">→</span>
              </Link>
              <Link
                href={`/runs/${runId}/timeline`}
                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3 transition hover:border-ink hover:shadow-sm"
              >
                <div>
                  <p className="text-xs uppercase tracking-widest text-slate-400">Events</p>
                  <p className="mt-0.5 text-sm font-semibold text-ink">Timeline</p>
                  <p className="mt-0.5 text-xs text-slate-400">按 tick 排序的事件流</p>
                </div>
                <span className="text-slate-300 group-hover:text-ink">→</span>
              </Link>
              <div className="rounded-xl border border-slate-100 bg-white/40 px-4 py-3">
                <p className="text-xs uppercase tracking-widest text-slate-300">Agents</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-400">{agentList.agents.length} 个居民</p>
                <p className="mt-0.5 text-xs text-slate-400">点击右侧居民进入详情</p>
              </div>
            </div>
          </div>

          {/* 导演事件注入（可滚动） */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <p className="mb-3 text-xs uppercase tracking-widest text-slate-400">导演事件注入</p>
            <p className="mb-4 text-xs text-slate-500">向世界中注入特殊事件，干预居民行为或创造剧情。</p>
            <DirectorEventForm runId={runId} />
          </div>
        </div>

        {/* 右侧：居民列表 */}
        <div className="flex w-72 flex-shrink-0 flex-col overflow-hidden">
          <div className="flex-shrink-0 border-b border-slate-200/40 px-5 py-4">
            <p className="text-xs uppercase tracking-widest text-slate-400">居民</p>
            <p className="mt-1 text-sm font-semibold text-ink">{agentList.agents.length} 个 Agents</p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {agentList.agents.length === 0 ? (
              <p className="text-sm text-slate-500">当前 run 还没有 agents。</p>
            ) : (
              <div className="space-y-2">
                {agentList.agents.map((agent) => (
                  <Link
                    key={agent.id}
                    href={`/runs/${runId}/agents/${agent.id}`}
                    className="flex flex-col rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm transition hover:border-moss hover:shadow-sm"
                  >
                    <span className="font-medium text-ink">{agent.name}</span>
                    <span className="mt-0.5 text-xs text-slate-400">
                      {agent.occupation ?? "-"} · {agent.current_goal ?? "no-goal"}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
