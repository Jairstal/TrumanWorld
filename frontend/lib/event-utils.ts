import type { AgentDetails, TimelineEvent, WorldEvent } from "@/lib/types";

type EventMeta = {
  icon: string;
  label: string;
  chip: string;
  color: string;
};

const DEFAULT_EVENT_META: EventMeta = {
  icon: "✨",
  label: "未知事件",
  chip: "bg-slate-50 text-slate-700 border border-slate-100",
  color: "#6b7280",
};

export const EVENT_META: Record<string, EventMeta> = {
  talk: {
    icon: "💬",
    label: "对话",
    chip: "bg-rose-50 text-rose-700 border border-rose-100",
    color: "#ec4899",
  },
  move: {
    icon: "🚶",
    label: "移动",
    chip: "bg-emerald-50 text-emerald-700 border border-emerald-100",
    color: "#10b981",
  },
  work: {
    icon: "⚒️",
    label: "工作",
    chip: "bg-amber-50 text-amber-700 border border-amber-100",
    color: "#f59e0b",
  },
  rest: {
    icon: "😴",
    label: "休息",
    chip: "bg-indigo-50 text-indigo-700 border border-indigo-100",
    color: "#6366f1",
  },
  director_inject: {
    icon: "📢",
    label: "导演注入",
    chip: "bg-red-50 text-red-700 border border-red-100",
    color: "#dc2626",
  },
  plan: {
    icon: "📋",
    label: "计划",
    chip: "bg-violet-50 text-violet-700 border border-violet-100",
    color: "#8b5cf6",
  },
  reflect: {
    icon: "🔍",
    label: "反思",
    chip: "bg-cyan-50 text-cyan-700 border border-cyan-100",
    color: "#06b6d4",
  },
};

export function getEventMeta(eventType: string): EventMeta {
  return EVENT_META[eventType] ?? { ...DEFAULT_EVENT_META, label: eventType };
}

export function describeWorldEvent(
  event: WorldEvent,
  nameMap: Record<string, string>,
  locationMap: Record<string, string>,
): string {
  const actor = nameMap[event.actor_agent_id ?? ""] || event.actor_agent_id || "有人";
  const target = nameMap[event.target_agent_id ?? ""] || event.target_agent_id || "某人";
  const atPlace = locationMap[event.location_id ?? ""] || event.location_id || "小镇";
  const toPlace =
    locationMap[String(event.payload.to_location_id ?? "")] || String(event.payload.to_location_id || atPlace);

  switch (event.event_type) {
    case "move":
      return `${actor} 前往了 ${toPlace}`;
    case "talk":
      return `${actor} 与 ${target} 展开交谈`;
    case "work":
      return `${actor} 在 ${atPlace} 专心工作`;
    case "rest":
      return `${actor} 在 ${atPlace} 休息`;
    case "director_inject":
      return `导演播报：${String(event.payload.message || "发生了一件大事")}`;
    case "plan":
      return `${actor} 制定了新的计划`;
    case "reflect":
      return `${actor} 陷入了沉思`;
    default:
      return `${atPlace} 发生了一些事情`;
  }
}

export function describeTimelineEvent(event: Pick<TimelineEvent, "event_type" | "payload">) {
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

export function describeAgentEvent(event: AgentDetails["recent_events"][number]) {
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
