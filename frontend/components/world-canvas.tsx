"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import useSWR from "swr";
import type { WorldSnapshot } from "@/lib/api";
import { AgentAvatar, inferAgentStatus } from "@/components/agent-avatar";
import { EventCard } from "@/components/event-card";
import { TownMap } from "@/components/town-map";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function locationTone(locationType: string) {
  if (locationType === "cafe") return "border-amber-200 bg-amber-50";
  if (locationType === "plaza") return "border-sky-200 bg-sky-50";
  if (locationType === "park") return "border-emerald-200 bg-emerald-50";
  if (locationType === "shop") return "border-violet-200 bg-violet-50";
  return "border-slate-200 bg-white";
}

function agentTone(occupation?: string) {
  if (occupation === "barista") return "bg-amber-100 text-amber-900";
  if (occupation === "resident") return "bg-sky-100 text-sky-900";
  if (occupation === "shopkeeper") return "bg-violet-100 text-violet-900";
  return "bg-slate-100 text-slate-900";
}



type WorldEvent = WorldSnapshot["recent_events"][number];



function locationBeat(
  locationId: string,
  events: WorldSnapshot["recent_events"],
) {
  const matched = events.find((e) => e.location_id === locationId);
  if (!matched) return "quiet";
  if (matched.event_type === "talk") return "conversation";
  if (matched.event_type === "move") return "arrival";
  if (matched.event_type === "work") return "working";
  if (matched.event_type === "rest") return "resting";
  return matched.event_type;
}

function beatBadge(beat: string) {
  const map: Record<string, { cls: string; label: string }> = {
    conversation: { cls: "bg-rose-100 text-rose-900", label: "💬 对话中" },
    arrival: { cls: "bg-emerald-100 text-emerald-900", label: "🚶 有人抵达" },
    working: { cls: "bg-amber-100 text-amber-900", label: "⚒️ 工作中" },
    resting: { cls: "bg-slate-100 text-slate-800", label: "😴 休息" },
    quiet: { cls: "bg-white/80 text-slate-500", label: "🌿 安静" },
  };
  return map[beat] ?? { cls: "bg-mist text-slate-700", label: beat };
}

// ---------------------------------------------------------------------------
// Fetcher for SWR
// ---------------------------------------------------------------------------

const API_BASE =
  (typeof window !== "undefined" ? process.env.NEXT_PUBLIC_API_BASE_URL : undefined) ??
  "http://127.0.0.1:8000/api";

async function worldFetcher(url: string): Promise<WorldSnapshot | null> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return null;
  return res.json() as Promise<WorldSnapshot>;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

type Props = {
  runId: string;
  initialData?: WorldSnapshot | null;
};

export function WorldCanvas({ runId, initialData }: Props) {
  const { data: world, isValidating } = useSWR<WorldSnapshot | null>(
    `${API_BASE}/runs/${runId}/world`,
    worldFetcher,
    {
      fallbackData: initialData ?? null,
      refreshInterval: 5000,
      revalidateOnFocus: true,
    },
  );

  const latestTick =
    world?.recent_events[0]?.tick_no ?? world?.run.current_tick ?? 0;

  // Build lookup maps
  const agentNameMap: Record<string, string> = {};
  const locationNameMap: Record<string, string> = {};
  if (world) {
    for (const loc of world.locations) {
      locationNameMap[loc.id] = loc.name;
      for (const agent of loc.occupants) {
        agentNameMap[agent.id] = agent.name;
      }
    }
  }

  if (!world) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 text-center text-sm text-slate-500">
        未获取到世界快照，可能是后端未启动或 run 不存在。
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Status bar */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm text-slate-700 shadow-sm">
          <span
            className={`h-2 w-2 rounded-full ${isValidating ? "animate-pulse bg-moss" : "bg-slate-300"}`}
          />
          Tick {world.run.current_tick ?? 0} · {world.run.status}
        </span>
        <span className="rounded-full bg-white/40 px-3 py-2 text-xs text-slate-500">
          每 5 秒自动更新
        </span>
      </div>

      {/* Town Map */}
      <TownMap
        world={world}
        agentNameMap={agentNameMap}
        onLocationClick={(locId) => {
          // 可以滚动到对应的地点卡片
          const element = document.getElementById(`location-${locId}`);
          element?.scrollIntoView({ behavior: "smooth", block: "center" });
        }}
        onAgentClick={(agentId) => {
          window.location.href = `/runs/${runId}/agents/${agentId}`;
        }}
      />

      {/* Town layout grid */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        {/* Location cards */}
        <div className="grid auto-rows-[auto] gap-4 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {world.locations.map((location) => {
              const beat = locationBeat(location.id, world.recent_events);
              const badge = beatBadge(beat);
              return (
                <motion.div
                  id={`location-${location.id}`}
                  key={location.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  className={`relative rounded-3xl border px-5 py-5 shadow-sm ${locationTone(location.location_type)}`}
                >
                  {/* Glow */}
                  <div className="pointer-events-none absolute right-4 top-4 h-20 w-20 rounded-full bg-white/35 blur-2xl" />

                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-ink">{location.name}</h2>
                      <p className="mt-0.5 text-xs uppercase tracking-[0.18em] text-slate-500">
                        {location.location_type}
                      </p>
                    </div>
                    <div className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-600">
                      {location.occupants.length}/{location.capacity}
                    </div>
                  </div>

                  {/* Beat badge */}
                  <span
                    className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${badge.cls}`}
                  >
                    {badge.label}
                  </span>

                  {/* Agents */}
                  <div className="mt-4 space-y-2">
                    {location.occupants.length === 0 ? (
                      <p className="text-sm text-slate-400">这里暂时没有居民。</p>
                    ) : (
                      <AnimatePresence>
                        {location.occupants.map((agent) => (
                          <motion.div
                            key={agent.id}
                            layout
                            initial={{ opacity: 0, scale: 0.93 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: "spring", stiffness: 300, damping: 28 }}
                          >
                            <Link
                              href={`/runs/${runId}/agents/${agent.id}`}
                              className="group flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-3 py-2.5 transition hover:border-moss hover:bg-white hover:shadow-md"
                            >
                              <AgentAvatar
                                agentId={agent.id}
                                name={agent.name}
                                occupation={agent.occupation}
                                status={inferAgentStatus(agent.id, world.recent_events)}
                                size="sm"
                              />
                              <div className="min-w-0 flex-1">
                                <p className="truncate font-medium text-ink group-hover:text-moss transition-colors">{agent.name}</p>
                                <p className="truncate text-xs text-slate-500">
                                  {agent.current_goal ?? "休息中"}
                                </p>
                              </div>
                              <span className="flex-shrink-0 text-xs uppercase tracking-wide text-slate-400">
                                {agent.occupation ?? "居民"}
                              </span>
                            </Link>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Right panel: metrics + notes */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm">
            <div className="text-xs uppercase tracking-[0.22em] text-moss">小镇概况</div>
            <div className="mt-4 grid gap-3">
              {[
                { label: "地点数量", value: world.locations.length },
                {
                  label: "在场居民",
                  value: world.locations.reduce(
                    (n, l) => n + l.occupants.length,
                    0,
                  ),
                },
                { label: "最新 Tick", value: latestTick },
              ].map(({ label, value }) => (
                <motion.div
                  key={label}
                  layout
                  className="rounded-2xl bg-mist px-4 py-3"
                >
                  <div className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</div>
                  <motion.div
                    key={String(value)}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-3xl font-semibold text-ink"
                  >
                    {value}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Live Story Beats */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-ink">近期事件</h2>
          <span className="text-xs text-slate-400">观众视角 · 叙事流</span>
        </div>
        <div className="space-y-2">
          {world.recent_events.length === 0 ? (
            <p className="text-sm text-slate-500">世界还没有公开事件。</p>
          ) : (
            <AnimatePresence mode="popLayout">
              {world.recent_events.map((event, idx) => (
                <EventCard
                  key={event.id}
                  event={event}
                  index={idx}
                  isLatest={event.tick_no === latestTick}
                  agentNameMap={agentNameMap}
                  locationNameMap={locationNameMap}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
