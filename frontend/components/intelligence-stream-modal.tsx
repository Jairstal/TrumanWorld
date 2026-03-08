"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { WorldSnapshot } from "@/lib/types";
import { EventCard } from "@/components/event-card";
import {
  buildWorldNameMaps,
  filterWorldEvents,
  type EventFilter,
} from "@/lib/world-utils";

type LocationFilter = string | null;

const EVENT_FILTERS: Array<{ id: EventFilter; label: string }> = [
  { id: "all", label: "全部事件" },
  { id: "social", label: "对话" },
  { id: "activity", label: "动作" },
  { id: "movement", label: "移动" },
];

type IntelligenceStreamModalProps = {
  isOpen: boolean;
  onClose: () => void;
  world: WorldSnapshot;
  runId: string;
};

export function IntelligenceStreamModal({
  isOpen,
  onClose,
  world,
  runId,
}: IntelligenceStreamModalProps) {
  const [eventFilter, setEventFilter] = useState<EventFilter>("all");
  const [locationFilter, setLocationFilter] = useState<LocationFilter>(null);

  const { agentNameMap, locationNameMap, visibleEvents, latestTick } = useMemo(() => {
    const { agentNameMap, locationNameMap } = buildWorldNameMaps(world);
    const filtered = filterWorldEvents(world.recent_events, eventFilter, locationFilter);

    const tick = world.recent_events[0]?.tick_no ?? world.run.current_tick ?? 0;

    return {
      agentNameMap,
      locationNameMap,
      visibleEvents: filtered,
      latestTick: tick,
    };
  }, [eventFilter, locationFilter, world]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/20 bg-white shadow-2xl"
      >
        <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-ink">世界情报流</h2>
              <p className="text-sm text-slate-500">实时事件监控中心</p>
            </div>
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
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="flex gap-1">
              {EVENT_FILTERS.map((filter) => {
                const active = filter.id === eventFilter;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setEventFilter(filter.id)}
                    className={`rounded-full px-3 py-1.5 text-xs transition ${
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
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setLocationFilter(null)}
                className={`rounded-full px-3 py-1.5 text-xs transition ${
                  locationFilter === null
                    ? "bg-moss text-white"
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
                  className={`rounded-full px-3 py-1.5 text-xs transition ${
                    locationFilter === loc.id
                      ? "border border-moss/40 bg-moss/20 text-moss"
                      : "border border-slate-200 bg-white text-slate-500 hover:border-moss hover:text-moss"
                  }`}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 border-b border-slate-100 bg-slate-50/50 px-6 py-3">
          {[
            { label: "总事件数", value: world.recent_events.length },
            { label: "当前 Tick", value: world.run.current_tick ?? 0 },
            { label: "活跃地点", value: world.locations.filter((location) => location.occupants.length > 0).length },
            { label: "居民总数", value: world.locations.reduce((sum, location) => sum + location.occupants.length, 0) },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl font-semibold text-ink">{value}</p>
              <p className="text-xs text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/30 p-6">
          {visibleEvents.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-slate-400">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-12 w-12">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-3 text-sm">当前筛选条件下没有事件</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {visibleEvents.map((event, index) => (
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
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 bg-white px-6 py-3">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>显示最近 {visibleEvents.length} 条事件</span>
            <Link
              href={`/runs/${runId}/timeline`}
              onClick={onClose}
              className="text-moss hover:underline"
            >
              查看完整时间线 →
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
