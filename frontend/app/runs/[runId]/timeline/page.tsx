import Link from "next/link";

import { getTimeline, type TimelineEvent } from "@/lib/api";

type TimelinePageProps = {
  params: Promise<{ runId: string }>;
};

const EVENT_LABELS: Record<string, { icon: string; label: string }> = {
  talk: { icon: "💬", label: "对话" },
  move: { icon: "🚶", label: "移动" },
  work: { icon: "⚒️", label: "工作" },
  rest: { icon: "😴", label: "休息" },
  director_inject: { icon: "📢", label: "导演注入" },
  plan: { icon: "📋", label: "制定计划" },
  reflect: { icon: "🔍", label: "反思" },
};

function describeTimelineEvent(event: TimelineEvent): string {
  const p = event.payload;
  if (event.event_type === "talk") {
    const msg = p.message ? `：「${String(p.message)}」` : "";
    const actor = String(p.actor_name ?? p.actor_agent_id ?? "某人");
    const target = String(p.target_name ?? p.target_agent_id ?? "某人");
    return `${actor} 和 ${target} 展开了交谈${msg}`;
  }
  if (event.event_type === "move") {
    const actor = String(p.actor_name ?? p.actor_agent_id ?? "某人");
    const to = String(p.to_location_name ?? p.to_location_id ?? "某地");
    return `${actor} 前往了 ${to}`;
  }
  if (event.event_type === "work") {
    const actor = String(p.actor_name ?? p.actor_agent_id ?? "某人");
    return `${actor} 专心工作中`;
  }
  if (event.event_type === "rest") {
    const actor = String(p.actor_name ?? p.actor_agent_id ?? "某人");
    return `${actor} 暂时休息`;
  }
  if (event.event_type === "director_inject") {
    return `导演播报：${String(p.message ?? "发生了一件大事")}`;
  }
  if (event.event_type === "plan") {
    const actor = String(p.actor_name ?? p.actor_agent_id ?? "某人");
    return `${actor} 制定了今日计划`;
  }
  if (event.event_type === "reflect") {
    const actor = String(p.actor_name ?? p.actor_agent_id ?? "某人");
    return `${actor} 进行了深度反思`;
  }
  // fallback: show key payload fields
  const keys = Object.keys(p).filter((k) => !["id", "run_id"].includes(k)).slice(0, 3);
  if (keys.length === 0) return event.event_type;
  return keys.map((k) => `${k}: ${String(p[k])}`).join(" · ");
}

export default async function TimelinePage({ params }: TimelinePageProps) {
  const { runId } = await params;
  const timeline = await getTimeline(runId);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* 顶部标题栏 */}
      <div className="flex-shrink-0 border-b border-slate-200/60 bg-white/60 px-8 py-5 backdrop-blur">
        <Link href={`/runs/${runId}`} className="text-xs uppercase tracking-[0.25em] text-moss hover:text-ink">
          ← Run Detail
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-ink">Timeline</h1>
      </div>

      {/* 滚动内容区 */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-8 py-6">
          <div className="space-y-2">
            {timeline.events.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-white/60 px-6 py-12 text-center text-sm text-slate-500">
                暂无事件。世界运行后居民的行为会展示在这里。
              </div>
            ) : (
              (() => {
                const groups = timeline.events.reduce<Record<number, typeof timeline.events>>(
                  (acc, ev) => {
                    (acc[ev.tick_no] ??= []).push(ev);
                    return acc;
                  },
                  {},
                );
                return Object.entries(groups)
                  .sort(([a], [b]) => Number(b) - Number(a))
                  .map(([tick, events]) => (
                    <div key={tick} className="space-y-1">
                      <div className="sticky top-0 z-10 flex items-center gap-3 bg-gradient-to-r from-[#f4f0e8] to-transparent py-2">
                        <span className="rounded-full bg-moss/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-widest text-moss">
                          Tick {tick}
                        </span>
                        <span className="h-px flex-1 bg-slate-200" />
                      </div>
                      {events.map((event) => {
                        const meta = EVENT_LABELS[event.event_type] ?? { icon: "•", label: event.event_type };
                        return (
                          <div
                            key={event.id}
                            className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 text-sm transition hover:border-slate-200 hover:shadow-sm"
                          >
                            <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-mist text-base">
                              {meta.icon}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-ink">{describeTimelineEvent(event)}</p>
                              {event.importance != null && event.importance >= 7 ? (
                                <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                                  重要 ★{event.importance}
                                </span>
                              ) : null}
                            </div>
                            <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                              {meta.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ));
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

