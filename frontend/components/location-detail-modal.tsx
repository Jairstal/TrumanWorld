"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { WorldSnapshot } from "@/lib/api";
import { AgentAvatar } from "@/components/agent-avatar";
import { inferAgentStatus } from "@/lib/agent-utils";
import { EventCard } from "@/components/event-card";

type LocationDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  world: WorldSnapshot;
  locationId: string;
  onLocationChange: (locationId: string) => void;
  runId: string;
};

function locationTone(locationType: string) {
  if (locationType === "cafe") return "border-amber-200 bg-amber-50 text-amber-900";
  if (locationType === "plaza") return "border-sky-200 bg-sky-50 text-sky-900";
  if (locationType === "park") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (locationType === "shop") return "border-violet-200 bg-violet-50 text-violet-900";
  if (locationType === "home") return "border-pink-200 bg-pink-50 text-pink-900";
  return "border-slate-200 bg-white text-slate-700";
}

function locationBeat(locationId: string, events: WorldSnapshot["recent_events"]) {
  const latest = events.find((event) => event.location_id === locationId);
  if (!latest) return "quiet";
  if (latest.event_type === "talk") return "conversation";
  if (latest.event_type === "move") return "arrival";
  if (latest.event_type === "work") return "working";
  if (latest.event_type === "rest") return "resting";
  return "quiet";
}

function beatBadge(beat: string) {
  const map: Record<string, { cls: string; label: string }> = {
    conversation: { cls: "bg-rose-100 text-rose-900", label: "对话中" },
    arrival: { cls: "bg-emerald-100 text-emerald-900", label: "有人抵达" },
    working: { cls: "bg-amber-100 text-amber-900", label: "工作中" },
    resting: { cls: "bg-slate-100 text-slate-800", label: "休息中" },
    quiet: { cls: "bg-white/80 text-slate-500", label: "安静" },
  };
  return map[beat] ?? { cls: "bg-slate-100 text-slate-700", label: beat };
}

export function LocationDetailModal({
  isOpen,
  onClose,
  world,
  locationId,
  onLocationChange,
  runId,
}: LocationDetailModalProps) {
  const { agentNameMap, locationNameMap, locationEvents } = useMemo(() => {
    const namesByAgent: Record<string, string> = {};
    const namesByLocation: Record<string, string> = {};

    for (const location of world.locations) {
      namesByLocation[location.id] = location.name;
      for (const agent of location.occupants) {
        namesByAgent[agent.id] = agent.name;
      }
    }

    const events = world.recent_events.filter((event) => event.location_id === locationId);

    return {
      agentNameMap: namesByAgent,
      locationNameMap: namesByLocation,
      locationEvents: events,
    };
  }, [world, locationId]);

  const location = world.locations.find((l) => l.id === locationId);
  const beat = location ? beatBadge(locationBeat(location.id, world.recent_events)) : null;
  const latestTick = locationEvents[0]?.tick_no ?? world.run.current_tick ?? 0;

  if (!isOpen || !location) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">聚焦地点</p>
            <h2 className="text-xl font-semibold text-ink">{location.name}</h2>
            <p className="text-sm text-slate-500">{location.location_type}</p>
          </div>
          <div className="flex items-center gap-3">
            {/* 地点切换 */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  const currentIndex = world.locations.findIndex((l) => l.id === locationId);
                  const prevIndex = currentIndex > 0 ? currentIndex - 1 : world.locations.length - 1;
                  onLocationChange(world.locations[prevIndex].id);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-moss hover:text-moss"
                title="上一个地点"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="px-2 text-xs text-slate-500">
                {world.locations.findIndex((l) => l.id === locationId) + 1} / {world.locations.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  const currentIndex = world.locations.findIndex((l) => l.id === locationId);
                  const nextIndex = currentIndex < world.locations.length - 1 ? currentIndex + 1 : 0;
                  onLocationChange(world.locations[nextIndex].id);
                }}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-moss hover:text-moss"
                title="下一个地点"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            {/* 关闭按钮 */}
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-500"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-3 gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-3">
          <div className="text-center">
            <p className="text-2xl font-semibold text-ink">{location.occupants.length}</p>
            <p className="text-xs text-slate-400">当前人数</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-ink">{location.capacity}</p>
            <p className="text-xs text-slate-400">容量</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-semibold text-ink">{locationEvents.length}</p>
            <p className="text-xs text-slate-400">相关事件</p>
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto">
          {/* 当前居民 */}
          <div className="border-b border-slate-100 p-6">
            <div className="mb-3 flex items-center gap-2">
              <h3 className="text-sm font-medium text-ink">当前居民</h3>
              {beat && (
                <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${beat.cls}`}>
                  {beat.label}
                </span>
              )}
            </div>
            {location.occupants.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-4 text-sm text-slate-500">
                这里暂时没有居民。
              </p>
            ) : (
              <div className="space-y-2">
                {location.occupants.map((agent) => (
                  <Link
                    key={agent.id}
                    href={`/runs/${runId}/agents/${agent.id}`}
                    onClick={onClose}
                    className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 transition hover:border-moss hover:shadow-sm"
                  >
                    <AgentAvatar
                      agentId={agent.id}
                      name={agent.name}
                      occupation={agent.occupation}
                      status={inferAgentStatus(agent.id, world.recent_events)}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink group-hover:text-moss">
                        {agent.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {agent.current_goal ?? "暂无公开目标"}
                      </p>
                    </div>
                    <span className="text-xs text-slate-400">{agent.occupation ?? "居民"}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* 地点事件 */}
          <div className="p-6">
            <h3 className="mb-3 text-sm font-medium text-ink">地点事件</h3>
            {locationEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-3 text-sm">该地点暂无事件记录</p>
              </div>
            ) : (
              <div className="space-y-2">
                {locationEvents.slice(0, 10).map((event, index) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    index={index}
                    isLatest={event.tick_no === latestTick}
                    agentNameMap={agentNameMap}
                    locationNameMap={locationNameMap}
                  />
                ))}
                {locationEvents.length > 10 && (
                  <p className="text-center text-xs text-slate-500">
                    还有 {locationEvents.length - 10} 条事件
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
