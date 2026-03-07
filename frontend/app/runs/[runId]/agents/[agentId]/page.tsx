import Link from "next/link";

import { MetricChip } from "@/components/metric-chip";
import { getAgent } from "@/lib/api";

type AgentPageProps = {
  params: Promise<{ runId: string; agentId: string }>;
};

export default async function AgentPage({ params }: AgentPageProps) {
  const { runId, agentId } = await params;
  const agent = await getAgent(runId, agentId);

  if (!agent) {
    return (
      <div className="flex h-full flex-col overflow-hidden">
        <div className="flex-shrink-0 border-b border-slate-200/60 bg-white/60 px-8 py-4 backdrop-blur">
          <Link href={`/runs/${runId}`} className="text-xs uppercase tracking-[0.25em] text-moss hover:text-ink">
            ← Run Detail
          </Link>
          <h1 className="mt-1 text-xl font-semibold text-ink">未找到 Agent</h1>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-slate-500">未获取到 agent 数据，可能是后端未启动或 agent 不存在。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* 顶部标题栏 */}
      <div className="flex-shrink-0 border-b border-slate-200/60 bg-white/60 px-8 py-4 backdrop-blur">
        <Link href={`/runs/${runId}`} className="text-xs uppercase tracking-[0.25em] text-moss hover:text-ink">
          ← Run Detail
        </Link>
        <h1 className="mt-1 text-xl font-semibold text-ink">
          {agent.name}
          <span className="ml-2 text-sm font-normal text-slate-400">{agent.occupation}</span>
        </h1>
      </div>

      {/* 状态概览条 */}
      <div className="flex-shrink-0 border-b border-slate-200/40 bg-white/40 px-8 py-4">
        <div className="grid grid-cols-5 gap-3">
          <MetricChip label="Name" value={agent.name} />
          <MetricChip label="Occupation" value={agent.occupation ?? "-"} />
          <MetricChip label="Goal" value={agent.current_goal ?? "-"} />
          <MetricChip label="Events" value={agent.recent_events.length} />
          <MetricChip label="Relationships" value={agent.relationships.length} />
        </div>
      </div>

      {/* 主内容区：三栏 */}
      <div className="flex min-h-0 flex-1 overflow-hidden">

        {/* 左栏：近期事件 */}
        <div className="flex flex-1 flex-col overflow-hidden border-r border-slate-200/60">
          <div className="flex-shrink-0 border-b border-slate-200/40 px-6 py-3">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              近期事件 <span className="ml-1 text-slate-300">({agent.recent_events.length})</span>
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {agent.recent_events.length === 0 ? (
              <p className="p-2 text-sm text-slate-500">暂无 recent events。</p>
            ) : (
              <div className="space-y-2">
                {agent.recent_events.map((event) => {
                  const message = event.payload.message as string | undefined;
                  return (
                    <div key={event.id} className="rounded-xl bg-white/60 px-4 py-3 text-sm shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium text-ink">
                          {event.event_type === "talk" && event.target_name ? (
                            <span>
                              与 <span className="text-pink-600">{event.target_name}</span> 交谈
                            </span>
                          ) : event.event_type === "move" && event.location_name ? (
                            <span>前往 <span className="text-emerald-600">{event.location_name}</span></span>
                          ) : (
                            event.event_type
                          )}
                        </div>
                        <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                          Tick {event.tick_no}
                        </span>
                      </div>
                      {message && (
                        <div className="mt-2 rounded-lg bg-white/70 px-3 py-2 text-slate-700 italic">
                          &ldquo;{message}&rdquo;
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap gap-1.5 text-xs">
                        {event.actor_name && (
                          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-700">
                            {event.actor_name}
                          </span>
                        )}
                        {event.target_name && (
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-rose-700">
                            → {event.target_name}
                          </span>
                        )}
                        {event.location_name && (
                          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                            📍 {event.location_name}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 中栏：记忆 */}
        <div className="flex flex-1 flex-col overflow-hidden border-r border-slate-200/60">
          <div className="flex-shrink-0 border-b border-slate-200/40 px-6 py-3">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              记忆 <span className="ml-1 text-slate-300">({agent.memories.length})</span>
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {agent.memories.length === 0 ? (
              <p className="p-2 text-sm text-slate-500">暂无 memories。</p>
            ) : (
              <div className="space-y-2">
                {agent.memories.map((memory) => (
                  <div key={memory.id} className="rounded-xl bg-white/60 px-4 py-3 text-sm shadow-sm">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-ink leading-snug">
                        {memory.summary ?? memory.memory_type}
                      </div>
                      <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs uppercase tracking-wider text-slate-500">
                        {memory.memory_type}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{memory.content}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-slate-400">importance {memory.importance ?? 0}</span>
                      {memory.related_agent_name && (
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs text-rose-600">
                          👤 {memory.related_agent_name}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 右栏：关系 */}
        <div className="flex w-72 flex-shrink-0 flex-col overflow-hidden">
          <div className="flex-shrink-0 border-b border-slate-200/40 px-6 py-3">
            <p className="text-xs uppercase tracking-widest text-slate-400">
              居民关系 <span className="ml-1 text-slate-300">({agent.relationships.length})</span>
            </p>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {agent.relationships.length === 0 ? (
              <p className="p-2 text-sm text-slate-500">暂无 relationships。</p>
            ) : (
              <div className="space-y-2">
                {agent.relationships.map((relationship) => (
                  <div key={relationship.other_agent_id} className="rounded-xl bg-white/60 px-4 py-4 text-sm shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium text-ink">
                        {relationship.other_agent_name || relationship.other_agent_id}
                      </div>
                      <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-600 shadow-sm">
                        {relationship.relation_type}
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div>
                        <div className="text-xs text-slate-400">Familiarity</div>
                        <div className="mt-0.5 font-medium text-ink">{relationship.familiarity.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Trust</div>
                        <div className="mt-0.5 font-medium text-ink">{relationship.trust.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400">Affinity</div>
                        <div className="mt-0.5 font-medium text-ink">{relationship.affinity.toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
