"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import type { WorldEvent, WorldSnapshot } from "@/lib/types";
import { AgentAvatar } from "@/components/agent-avatar";
import { inferAgentStatus } from "@/lib/agent-utils";
import { EventCard } from "@/components/event-card";
import { TownMap } from "@/components/town-map";
import { IntelligenceStreamModal } from "@/components/intelligence-stream-modal";
import { LocationDetailModal } from "@/components/location-detail-modal";
import { useWorld } from "@/components/world-context";
import {
  beatBadge,
  buildWorldNameMaps,
  eventMatchesFilter,
  filterWorldEvents,
  formatGoal,
  formatSimTime,
  locationBeat,
  locationTone,
  type EventFilter,
} from "@/lib/world-utils";

const EVENT_FILTERS: Array<{ id: EventFilter; label: string }> = [
  { id: "all", label: "全部事件" },
  { id: "social", label: "对话" },
  { id: "activity", label: "动作" },
  { id: "movement", label: "移动" },
];

type Props = {
  runId: string;
};

export function WorldCanvas({ runId }: Props) {
  const router = useRouter();
  const { world } = useWorld();
  const [highlightedLocationId, setHighlightedLocationId] = useState<string | null>(null);
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [locationFilter, setLocationFilter] = useState<string | null>(null);
  const [isStreamExpanded, setIsStreamExpanded] = useState(false);
  const [isLocationExpanded, setIsLocationExpanded] = useState(false);

  const latestTick = world?.recent_events[0]?.tick_no ?? world?.run.current_tick ?? 0;

  useEffect(() => {
    if (!world || world.locations.length === 0) {
      return;
    }
    setHighlightedLocationId((current) =>
      current && world.locations.some((location) => location.id === current) ? current : world.locations[0].id,
    );
  }, [world]);

  const { agentNameMap, locationNameMap, visibleEvents, activeConversations, activeLocations } =
    useMemo(() => {
      if (!world) {
        return {
          agentNameMap: {} as Record<string, string>,
          locationNameMap: {} as Record<string, string>,
          visibleEvents: [] as WorldEvent[],
          activeConversations: 0,
          activeLocations: 0,
        };
      }

      const { agentNameMap, locationNameMap } = buildWorldNameMaps(world);
      const filtered = filterWorldEvents(world.recent_events, eventFilter, locationFilter);
      const conversationCount = world.recent_events.filter((event) => event.event_type === "talk").length;
      const activeLocationCount = world.locations.filter((location) =>
        world.recent_events.some((event) => event.location_id === location.id),
      ).length;

      return {
        agentNameMap,
        locationNameMap,
        visibleEvents: filtered,
        activeConversations: conversationCount,
        activeLocations: activeLocationCount,
      };
    }, [eventFilter, locationFilter, world]);

  if (!world) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white/80 p-8 text-center text-sm text-slate-500">
        未获取到世界快照，可能是后端未启动或 run 不存在。
      </div>
    );
  }

  const isRunning = world.run.status === "running";
  const selectedLocation =
    world.locations.find((location) => location.id === highlightedLocationId) ?? world.locations[0] ?? null;
  const selectedLocationBeat = selectedLocation ? beatBadge(locationBeat(selectedLocation.id, world.recent_events)) : null;
  const residentCount = world.locations.reduce((count, location) => count + location.occupants.length, 0);
  const latestEvent = world.recent_events[0] ?? null;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-4">
      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1.75fr)_380px]">
        <div className="min-h-0 flex-1">
          <TownMap
            world={world}
            agentNameMap={agentNameMap}
            highlightedLocationId={highlightedLocationId}
            onLocationClick={(locationId) => {
              setHighlightedLocationId(locationId);
              setLocationFilter(locationId);
            }}
            onAgentClick={(agentId) => {
              router.push(`/runs/${runId}/agents/${agentId}`);
            }}
          />
        </div>

        <div className="grid min-h-0 gap-4 xl:grid-rows-[auto_auto_minmax(0,1fr)]">
          <div className="rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-[0.22em] text-moss">小镇概况</div>
                <h2 className="mt-1 text-lg font-semibold text-ink">当前运行摘要</h2>
              </div>
              <span className="text-xs text-slate-400">实时</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { label: "地点", value: world.locations.length },
                { label: "居民", value: residentCount },
                { label: "活跃", value: activeLocations },
                { label: "对话", value: activeConversations },
                { label: "Tick", value: latestTick },
                { label: "状态", value: world.run.status === "running" ? "运行中" : "暂停" },
              ].map(({ label, value }) => (
                <motion.div
                  key={label}
                  layout
                  className="rounded-xl bg-mist px-2 py-2 text-center"
                >
                  <motion.div
                    key={`${label}-${String(value)}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-lg font-semibold text-ink"
                  >
                    {value}
                  </motion.div>
                  <div className="text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white/80 p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">聚焦地点</p>
                <h2 className="mt-1 text-xl font-semibold text-ink">{selectedLocation?.name ?? "暂无地点"}</h2>
                <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                  {selectedLocation?.location_type ?? "-"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {selectedLocationBeat ? (
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${selectedLocationBeat.cls}`}>
                    {selectedLocationBeat.label}
                  </span>
                ) : null}
                <button
                  type="button"
                  onClick={() => setIsLocationExpanded(true)}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:border-moss hover:text-moss"
                  title="放大查看地点详情"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </button>
              </div>
            </div>

            {selectedLocation ? (
              <>
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                  <span className={`rounded-full border px-2.5 py-1 font-medium ${locationTone(selectedLocation.location_type)}`}>
                    {selectedLocation.occupants.length} / {selectedLocation.capacity} 人
                  </span>
                  <span
                    className="cursor-default rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-mono tracking-tight"
                    title={selectedLocation.id}
                  >
                    #{selectedLocation.id.slice(0, 8)}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  {selectedLocation.occupants.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">这里暂时没有居民。</p>
                  ) : (
                    selectedLocation.occupants.map((agent) => (
                      <Link
                        key={agent.id}
                        href={`/runs/${runId}/agents/${agent.id}`}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 transition hover:border-moss hover:shadow-sm"
                      >
                        <AgentAvatar
                          agentId={agent.id}
                          name={agent.name}
                          occupation={agent.occupation}
                          status={inferAgentStatus(agent.id, world.recent_events)}
                          size="sm"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-ink group-hover:text-moss">{agent.name}</p>
                          <p className="truncate text-xs text-slate-500">{formatGoal(agent.current_goal)}</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                          {agent.occupation ?? "居民"}
                        </span>
                      </Link>
                    ))
                  )}
                </div>
              </>
            ) : null}
          </div>

          <div className="flex min-h-0 flex-col rounded-[28px] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">近期事件</p>
                <h2 className="mt-1 text-lg font-semibold text-ink">世界情报流</h2>
                {latestEvent ? (
                  <p className="mt-1 text-xs text-slate-500">
                    最近一条来自 T{latestEvent.tick_no}，可用筛选器快速聚焦某类行为。
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setIsStreamExpanded(true)}
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm transition hover:border-moss hover:text-moss"
                title="放大查看情报流"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </div>
            <div className="mb-2 flex flex-wrap gap-1">
              {EVENT_FILTERS.map((filter) => {
                const active = filter.id === eventFilter;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setEventFilter(filter.id)}
                    className={`rounded-full px-2.5 py-1 text-[11px] transition ${
                      active
                        ? "bg-ink text-white"
                        : "border border-slate-200 bg-white text-slate-500 hover:border-moss hover:text-moss"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
            <div className="mb-3 flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setLocationFilter(null)}
                className={`rounded-full px-2.5 py-1 text-[11px] transition ${
                  locationFilter === null
                    ? "bg-ink text-white"
                    : "border border-slate-200 bg-white text-slate-500 hover:border-moss hover:text-moss"
                }`}
              >
                全部地点
              </button>
              {world.locations.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setLocationFilter(loc.id === locationFilter ? null : loc.id)}
                  className={`rounded-full px-2.5 py-1 text-[11px] transition ${
                    locationFilter === loc.id
                      ? "border border-moss/40 bg-moss/20 text-moss"
                      : "border border-slate-200 bg-white text-slate-500 hover:border-moss hover:text-moss"
                  }`}
                >
                  {loc.name}
                </button>
              ))}
            </div>
            <div className="min-h-0 space-y-2 overflow-auto pr-1">
              {visibleEvents.length === 0 ? (
                <p className="text-sm text-slate-500">当前筛选条件下没有公开事件。</p>
              ) : (
                <AnimatePresence mode="popLayout">
                  {visibleEvents.slice(0, 5).map((event, index) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      index={index}
                      isLatest={event.tick_no === latestTick}
                      agentNameMap={agentNameMap}
                      locationNameMap={locationNameMap}
                    />
                  ))}
                </AnimatePresence>
              )}
              {visibleEvents.length > 5 && (
                <button
                  type="button"
                  onClick={() => setIsStreamExpanded(true)}
                  className="w-full rounded-xl border border-dashed border-slate-300 py-2 text-xs text-slate-500 transition hover:border-moss hover:text-moss"
                >
                  还有 {visibleEvents.length - 5} 条事件，点击查看全部 →
                </button>
              )}
            </div>
          </div>

          {world && (
            <IntelligenceStreamModal
              isOpen={isStreamExpanded}
              onClose={() => setIsStreamExpanded(false)}
              world={world}
              runId={runId}
            />
          )}

          {world && selectedLocation && (
            <LocationDetailModal
              isOpen={isLocationExpanded}
              onClose={() => setIsLocationExpanded(false)}
              world={world}
              locationId={selectedLocation.id}
              onLocationChange={(locId) => setHighlightedLocationId(locId)}
              runId={runId}
            />
          )}
        </div>
      </div>
    </div>
  );
}
