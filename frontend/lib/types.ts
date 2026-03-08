import type { EventType } from "@/lib/simulation-protocol";

export type RunSummary = {
  id: string;
  name: string;
  status: string;
  scenario_type?: string;
  current_tick?: number;
  tick_minutes?: number;
  was_running_before_restart?: boolean;
  agent_count?: number;
  location_count?: number;
  event_count?: number;
};

export type CreateRunResponse = {
  id: string;
  name: string;
  status: string;
  scenario_type?: string;
};

export type TickResponse = {
  run_id: string;
  tick_no: number;
  accepted_count: number;
  rejected_count: number;
};

export type TimelineEvent = {
  id: string;
  tick_no: number;
  event_type: EventType;
  importance?: number;
  payload: Record<string, unknown>;
};

export type WorldClock = {
  iso: string;
  date: string;
  time: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number;
  weekday_name: string;
  weekday_name_cn: string;
  is_weekend: boolean;
  time_period: string;
  time_period_cn: string;
};

export type AgentSummary = {
  id: string;
  name: string;
  occupation?: string;
  current_goal?: string;
  current_location_id?: string;
  config_id?: string; // agent 配置 ID，用于加载自定义 logo
};

export type WorldEvent = {
  id: string;
  tick_no: number;
  event_type: EventType;
  location_id?: string;
  actor_agent_id?: string;
  target_agent_id?: string;
  actor_name?: string;
  target_name?: string;
  location_name?: string;
  payload: Record<string, unknown>;
};

export type WorldLocation = {
  id: string;
  name: string;
  location_type: string;
  x: number;
  y: number;
  capacity: number;
  occupants: AgentSummary[];
};

export type WorldSnapshot = {
  run: RunSummary;
  world_clock?: WorldClock;
  locations: WorldLocation[];
  recent_events: WorldEvent[];
};

export type AgentRecentEvent = {
  id: string;
  tick_no: number;
  event_type: EventType;
  actor_agent_id?: string;
  actor_name?: string;
  target_agent_id?: string;
  target_name?: string;
  location_id?: string;
  location_name?: string;
  payload: Record<string, unknown>;
};

export type AgentMemory = {
  id: string;
  memory_type: string;
  summary?: string;
  content: string;
  importance?: number;
  related_agent_id?: string;
  related_agent_name?: string;
};

export type AgentRelationship = {
  other_agent_id: string;
  other_agent_name?: string;
  familiarity: number;
  trust: number;
  affinity: number;
  relation_type: string;
};

export type AgentDetails = {
  run_id: string;
  agent_id: string;
  name: string;
  occupation?: string;
  current_goal?: string;
  status?: Record<string, unknown>;
  config_id?: string; // agent 配置 ID，用于加载自定义 logo
  recent_events: AgentRecentEvent[];
  memories: AgentMemory[];
  relationships: AgentRelationship[];
};
