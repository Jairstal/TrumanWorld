import type { WorldEvent, WorldSnapshot } from "@/lib/types";
export type LocationBeat = "conversation" | "arrival" | "working" | "resting" | "quiet";
export type EventFilter = "all" | "social" | "activity" | "movement";

export function buildWorldNameMaps(world: WorldSnapshot) {
  const agentNameMap: Record<string, string> = {};
  const locationNameMap: Record<string, string> = {};

  for (const location of world.locations) {
    locationNameMap[location.id] = location.name;
    for (const agent of location.occupants) {
      agentNameMap[agent.id] = agent.name;
    }
  }

  return { agentNameMap, locationNameMap };
}

export function filterWorldEvents(
  events: WorldEvent[],
  eventFilter: EventFilter,
  locationFilter: string | null = null,
) {
  return events
    .filter((event) => eventMatchesFilter(event, eventFilter))
    .filter((event) => locationFilter === null || event.location_id === locationFilter);
}

export function locationTone(locationType: string) {
  if (locationType === "cafe") return "border-amber-200 bg-amber-50 text-amber-900";
  if (locationType === "plaza") return "border-sky-200 bg-sky-50 text-sky-900";
  if (locationType === "park") return "border-emerald-200 bg-emerald-50 text-emerald-900";
  if (locationType === "shop") return "border-violet-200 bg-violet-50 text-violet-900";
  if (locationType === "home") return "border-pink-200 bg-pink-50 text-pink-900";
  return "border-slate-200 bg-white text-slate-700";
}

export function eventMatchesFilter(event: WorldEvent, filter: EventFilter) {
  if (filter === "all") return true;
  if (filter === "social") return event.event_type === "talk";
  if (filter === "movement") return event.event_type === "move";
  return event.event_type === "work" || event.event_type === "rest";
}

export function locationBeat(locationId: string, events: WorldSnapshot["recent_events"]): LocationBeat {
  const latest = events.find((event) => event.location_id === locationId);
  if (!latest) return "quiet";
  if (latest.event_type === "talk") return "conversation";
  if (latest.event_type === "move") return "arrival";
  if (latest.event_type === "work") return "working";
  if (latest.event_type === "rest") return "resting";
  return "quiet";
}

export function beatBadge(beat: LocationBeat | string) {
  const map: Record<LocationBeat, { cls: string; label: string }> = {
    conversation: { cls: "bg-rose-100 text-rose-900", label: "对话中" },
    arrival: { cls: "bg-emerald-100 text-emerald-900", label: "有人抵达" },
    working: { cls: "bg-amber-100 text-amber-900", label: "工作中" },
    resting: { cls: "bg-slate-100 text-slate-800", label: "休息中" },
    quiet: { cls: "bg-white/80 text-slate-500", label: "安静" },
  };

  return map[beat as LocationBeat] ?? { cls: "bg-slate-100 text-slate-700", label: beat };
}

export function formatGoal(goal?: string) {
  if (!goal) {
    return "暂无公开目标";
  }

  return goal.length > 28 ? `${goal.slice(0, 28)}...` : goal;
}

export function formatSimTime(world: WorldSnapshot) {
  const tickMinutes = world.run.tick_minutes ?? 5;
  const totalMinutes = (world.run.current_tick ?? 0) * tickMinutes;
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}
