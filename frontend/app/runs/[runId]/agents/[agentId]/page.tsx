import Link from "next/link";

import { AgentAvatar } from "@/components/agent-avatar";
import { inferAgentStatus } from "@/lib/agent-utils";
import { MetricChip } from "@/components/metric-chip";
import { getAgent } from "@/lib/api";

type AgentPageProps = {
  params: Promise<{ runId: string; agentId: string }>;
};

function describeAgentEvent(event: NonNullable<Awaited<ReturnType<typeof getAgent>>>["recent_events"][number]) {
  if (event.event_type === "talk" && event.target_name) {
    return `与 ${event.target_name} 对话`;
  }
  if (event.event_type === "move" && event.location_name) {
    return `前往 ${event.location_name}`;
  }
  if (event.event_type === "work" && event.location_name) {
    return `在 ${event.location_name} 工作`;
  }
  if (event.event_type === "rest" && event.location_name) {
    return `在 ${event.location_name} 休息`;
  }
  return event.event_type;
}

function relationshipTone(value: number) {
  if (value >= 0.75) return "bg-emerald-500";
  if (value >= 0.45) return "bg-amber-400";
  return "bg-slate-300";
}

export default async function AgentPage({ params }: AgentPageProps) {
  const { runId, agentId } = await params;
  const agent = await getAgent(runId, agentId);

  if (!agent) {
    return (
      <div className="flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_#f7f3e8,_#eef5f1_48%,_#f8fafc)]">
        <div className="border-b border-white/60 bg-white/65 px-8 py-5 backdrop-blur">
          <Link href={`/runs/${runId}`} className="text-xs uppercase tracking-[0.25em] text-moss hover:text-ink">
            ← 返回 run 总览
          </Link>
          <h1 className="mt-3 text-2xl font-semibold text-ink">未找到 Agent</h1>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-sm text-slate-500">未获取到 agent 数据，可能是后端未启动或 agent 不存在。</p>
        </div>
      </div>
    );
  }

  const status = inferAgentStatus(agent.agent_id, agent.recent_events);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_#f7f3e8,_#eef5f1_48%,_#f8fafc)]">
      <div className="border-b border-white/60 bg-white/65 px-8 py-5 backdrop-blur">
        <Link href={`/runs/${runId}`} className="text-xs uppercase tracking-[0.25em] text-moss hover:text-ink">
          ← 返回 run 总览
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <AgentAvatar
              agentId={agent.agent_id}
              name={agent.name}
              occupation={agent.occupation}
              status={status}
              size="lg"
            />
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Resident Profile</p>
              <h1 className="mt-2 text-3xl font-semibold text-ink">{agent.name}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {agent.occupation ?? "resident"} · 当前目标 {agent.current_goal ?? "暂无公开目标"}
              </p>
            </div>
          </div>
          <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs text-slate-600 shadow-sm">
            角色观察面板
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
        <div className="space-y-6">
          <section className="rounded-[30px] border border-white/70 bg-white/78 p-6 shadow-sm backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-moss">角色概览</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">当前状态</h2>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  这里汇总角色近期行为、记忆和关系，适合观察单个居民是如何理解世界并采取行动的。
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-right">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">当前状态标签</p>
                <p className="mt-1 text-sm font-medium text-ink">{status}</p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-5">
              <MetricChip label="Name" value={agent.name} />
              <MetricChip label="Occupation" value={agent.occupation ?? "-"} />
              <MetricChip label="Goal" value={agent.current_goal ?? "-"} />
              <MetricChip label="Events" value={agent.recent_events.length} />
              <MetricChip label="Links" value={agent.relationships.length} />
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <section className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">关系网络</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">{agent.relationships.length} 条关系</h2>
                <div className="mt-4 space-y-3">
                  {agent.relationships.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">这个角色暂时没有公开关系数据。</p>
                  ) : (
                    agent.relationships.map((relationship) => (
                      <div key={relationship.other_agent_id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-ink">
                              {relationship.other_agent_name || relationship.other_agent_id}
                            </p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                              {relationship.relation_type}
                            </p>
                          </div>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500">
                            familiar {relationship.familiarity.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-4 space-y-2">
                          <StatBar label="信任" value={relationship.trust} />
                          <StatBar label="亲近" value={relationship.affinity} />
                          <StatBar label="熟悉" value={relationship.familiarity} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">阅读提示</p>
                <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <p>近期事件适合看“刚发生了什么”，记忆更适合看角色“是怎么记住这件事的”。</p>
                  <p>如果关系分数突然变化，通常可以回看最近对话或导演注入事件。</p>
                </div>
              </section>
            </aside>

            <div className="grid gap-6 xl:grid-cols-2">
              <section className="flex min-h-[520px] flex-col rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">近期事件</p>
                    <h2 className="mt-1 text-xl font-semibold text-ink">角色行为流</h2>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                    {agent.recent_events.length} 条
                  </span>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                  {agent.recent_events.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">暂无近期事件。</p>
                  ) : (
                    agent.recent_events.map((event) => {
                      const message = event.payload.message as string | undefined;
                      return (
                        <article key={event.id} className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-ink">{describeAgentEvent(event)}</p>
                              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                                {event.event_type}
                              </p>
                            </div>
                            <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                              Tick {event.tick_no}
                            </span>
                          </div>

                          {message ? (
                            <div className="mt-3 rounded-2xl bg-slate-50 px-3 py-3 text-sm italic text-slate-700">
                              “{message}”
                            </div>
                          ) : null}

                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {event.actor_name ? (
                              <span className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-[11px] text-sky-700">
                                {event.actor_name}
                              </span>
                            ) : null}
                            {event.target_name ? (
                              <span className="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[11px] text-rose-700">
                                → {event.target_name}
                              </span>
                            ) : null}
                            {event.location_name ? (
                              <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[11px] text-emerald-700">
                                📍 {event.location_name}
                              </span>
                            ) : null}
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </section>

              <section className="flex min-h-[520px] flex-col rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">记忆</p>
                    <h2 className="mt-1 text-xl font-semibold text-ink">内部记忆栈</h2>
                  </div>
                  <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                    {agent.memories.length} 条
                  </span>
                </div>

                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                  {agent.memories.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">暂无记忆数据。</p>
                  ) : (
                    agent.memories.map((memory) => (
                      <article key={memory.id} className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-medium leading-6 text-ink">{memory.summary ?? memory.memory_type}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">{memory.memory_type}</p>
                          </div>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
                            重要度 {memory.importance ?? 0}
                          </span>
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{memory.content}</p>
                        {memory.related_agent_name ? (
                          <div className="mt-3">
                            <span className="rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[11px] text-rose-700">
                              关联角色 {memory.related_agent_name}
                            </span>
                          </div>
                        ) : null}
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  const percentage = Math.max(0, Math.min(100, value * 100));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span>{value.toFixed(2)}</span>
      </div>
      <div className="h-2 rounded-full bg-slate-100">
        <div
          className={`h-2 rounded-full ${relationshipTone(value)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
