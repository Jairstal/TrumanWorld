export type RunSummary = {
  id: string;
  name: string;
  status: string;
  current_tick?: number;
  tick_minutes?: number;
};

export type TimelineEvent = {
  id: string;
  tick_no: number;
  event_type: string;
  importance?: number;
  payload: Record<string, unknown>;
};

export type AgentDetails = {
  run_id: string;
  agent_id: string;
  name: string;
  occupation?: string;
  current_goal?: string;
  status?: Record<string, unknown>;
  recent_events: TimelineEvent[];
  memories: Array<{
    id: string;
    memory_type: string;
    summary?: string;
    content: string;
    importance?: number;
  }>;
  relationships: Array<{
    other_agent_id: string;
    familiarity: number;
    trust: number;
    affinity: number;
    relation_type: string;
  }>;
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000/api";

async function safeFetch<T>(path: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return fallback;
    }

    return (await response.json()) as T;
  } catch {
    return fallback;
  }
}

export async function getRun(runId: string): Promise<RunSummary | null> {
  return safeFetch<RunSummary | null>(`/runs/${runId}`, null);
}

export async function getTimeline(runId: string): Promise<{ run_id: string; events: TimelineEvent[] }> {
  return safeFetch(`/runs/${runId}/timeline`, { run_id: runId, events: [] });
}

export async function getAgent(runId: string, agentId: string): Promise<AgentDetails | null> {
  return safeFetch<AgentDetails | null>(`/runs/${runId}/agents/${agentId}`, null);
}
