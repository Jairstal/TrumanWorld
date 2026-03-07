import Link from "next/link";

import { getTimeline } from "@/lib/api";

type TimelinePageProps = {
  params: Promise<{ runId: string }>;
};

const EVENT_LABELS: Record<string, { icon: string; label: string; chip: string }> = {
  talk: { icon: "💬", label: "对话", chip: "bg-rose-50 text-rose-700 border border-rose-100" },
  move: { icon: "🚶", label: "移动", chip: "bg-emerald-50 text-emerald-700 border border-emerald-100" },
  work: { icon: "⚒️", label: "工作", chip: "bg-amber-50 text-amber-700 border border-amber-100" },
  rest: { icon: "😴", label: "休息", chip: "bg-indigo-50 text-indigo-700 border border-indigo-100" },
  director_inject: { icon: "📢", label: "导演注入", chip: "bg-red-50 text-red-700 border border-red-100" },
  plan: { icon: "📋", label: "制定计划", chip: "bg-violet-50 text-violet-700 border border-violet-100" },
  reflect: { icon: "🔍", label: "反思", chip: "bg-cyan-50 text-cyan-700 border border-cyan-100" },
};

function describeTimelineEvent(event: { event_type: string; payload: Record<string, unknown> }) {
  const payload = event.payload;
  if (event.event_type === "talk") {
    const msg = payload.message ? `：「${String(payload.message)}」` : "";
    const actor = String(payload.actor_name ?? payload.actor_agent_id ?? "某人");
    const target = String(payload.target_name ?? payload.target_agent_id ?? "某人");
    return `${actor} 和 ${target} 展开了交谈${msg}`;
  }
  if (event.event_type === "move") {
    const actor = String(payload.actor_name ?? payload.actor_agent_id ?? "某人");
    const to = String(payload.to_location_name ?? payload.to_location_id ?? "某地");
    return `${actor} 前往了 ${to}`;
  }
  if (event.event_type === "work") {
    const actor = String(payload.actor_name ?? payload.actor_agent_id ?? "某人");
    return `${actor} 专心工作中`;
  }
  if (event.event_type === "rest") {
    const actor = String(payload.actor_name ?? payload.actor_agent_id ?? "某人");
    return `${actor} 暂时休息`;
  }
  if (event.event_type === "director_inject") {
    return `导演播报：${String(payload.message ?? "发生了一件大事")}`;
  }
  if (event.event_type === "plan") {
    const actor = String(payload.actor_name ?? payload.actor_agent_id ?? "某人");
    return `${actor} 制定了今日计划`;
  }
  if (event.event_type === "reflect") {
    const actor = String(payload.actor_name ?? payload.actor_agent_id ?? "某人");
    return `${actor} 进行了深度反思`;
  }
  return event.event_type;
}

export default async function TimelinePage({ params }: TimelinePageProps) {
  const { runId } = await params;
  const timeline = await getTimeline(runId);
  const groups = timeline.events.reduce<Record<number, typeof timeline.events>>((acc, event) => {
    (acc[event.tick_no] ??= []).push(event);
    return acc;
  }, {});
  const ordered = Object.entries(groups).sort(([left], [right]) => Number(right) - Number(left));
  const importantCount = timeline.events.filter((event) => (event.importance ?? 0) >= 7).length;

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_#f7f3e8,_#eef5f1_48%,_#f8fafc)]">
      <div className="border-b border-white/60 bg-white/65 px-8 py-5 backdrop-blur">
        <Link href={`/runs/${runId}`} className="text-xs uppercase tracking-[0.25em] text-moss hover:text-ink">
          ← 返回 run 总览
        </Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Event Replay</p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">Timeline</h1>
            <p className="mt-1 text-sm text-slate-500">按 tick 回放事件流，适合复盘剧情节点和角色行为链路。</p>
          </div>
          <div className="rounded-full border border-white/70 bg-white/80 px-4 py-2 text-xs text-slate-600 shadow-sm">
            事件回放视图
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">
        <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-4">
            <section className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur">
              <p className="text-xs uppercase tracking-[0.22em] text-moss">回放摘要</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-mist px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">事件总数</p>
                  <p className="mt-2 text-lg font-semibold text-ink">{timeline.events.length}</p>
                </div>
                <div className="rounded-2xl bg-mist px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">最新 Tick</p>
                  <p className="mt-2 text-lg font-semibold text-ink">{timeline.events[0]?.tick_no ?? 0}</p>
                </div>
                <div className="rounded-2xl bg-mist px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">重要事件</p>
                  <p className="mt-2 text-lg font-semibold text-ink">{importantCount}</p>
                </div>
                <div className="rounded-2xl bg-mist px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Tick 组数</p>
                  <p className="mt-2 text-lg font-semibold text-ink">{ordered.length}</p>
                </div>
              </div>
            </section>

            <section className="rounded-[28px] border border-slate-200 bg-white/80 p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.22em] text-slate-400">阅读提示</p>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>先看最近 tick，再向下回溯，能更快定位一段行为链路是怎么发生的。</p>
                <p>导演注入和高重要度事件通常是剧情转折点，优先看这两类更高效。</p>
                <p>想确认空间位置时，返回 `World Viewer` 会更直观。</p>
              </div>
            </section>
          </aside>

          <section className="rounded-[32px] border border-white/70 bg-white/78 p-5 shadow-sm backdrop-blur">
            {timeline.events.length === 0 ? (
              <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-16 text-center text-sm text-slate-500">
                暂无事件。世界运行后，居民的行为和导演注入都会在这里出现。
              </div>
            ) : (
              <div className="space-y-6">
                {ordered.map(([tick, events]) => (
                  <div key={tick} className="rounded-[28px] border border-slate-200 bg-white/85 p-4 shadow-sm">
                    <div className="mb-4 flex items-center gap-3 rounded-full bg-white/90 px-3 py-2">
                      <span className="rounded-full bg-moss/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-moss">
                        Tick {tick}
                      </span>
                      <span className="text-xs text-slate-400">{events.length} 条事件</span>
                      <span className="h-px flex-1 bg-slate-200" />
                    </div>

                    <div className="space-y-3">
                      {events.map((event) => {
                        const meta = EVENT_LABELS[event.event_type] ?? {
                          icon: "•",
                          label: event.event_type,
                          chip: "bg-slate-50 text-slate-700 border border-slate-100",
                        };

                        return (
                          <article key={event.id} className="rounded-[24px] border border-slate-200 bg-white px-4 py-4 shadow-sm">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-lg shadow-sm">
                                  {meta.icon}
                                </span>
                                <div>
                                  <p className="text-sm font-medium leading-6 text-ink">{describeTimelineEvent(event)}</p>
                                  <div className="mt-2 flex flex-wrap gap-1.5">
                                    {event.payload.actor_name ? (
                                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
                                        {String(event.payload.actor_name)}
                                      </span>
                                    ) : null}
                                    {event.payload.target_name ? (
                                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
                                        {String(event.payload.target_name)}
                                      </span>
                                    ) : null}
                                    {event.payload.location_name ? (
                                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">
                                        📍 {String(event.payload.location_name)}
                                      </span>
                                    ) : null}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1">
                                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${meta.chip}`}>
                                  {meta.label}
                                </span>
                                {event.importance != null ? (
                                  <span className="text-[11px] text-slate-400">重要度 {event.importance}</span>
                                ) : null}
                              </div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
