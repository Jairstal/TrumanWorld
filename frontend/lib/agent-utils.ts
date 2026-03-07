// Agent 状态类型
export type AgentStatus = "idle" | "working" | "talking" | "moving" | "resting";

// 根据事件推断 Agent 状态（可在服务端和客户端使用）
export function inferAgentStatus(
  agentId: string,
  recentEvents: Array<{ actor_agent_id?: string; target_agent_id?: string; event_type: string }>
): AgentStatus {
  const relevantEvents = recentEvents.filter(
    (e) => e.actor_agent_id === agentId || e.target_agent_id === agentId
  );

  if (relevantEvents.length === 0) return "idle";

  const latest = relevantEvents[0];
  switch (latest.event_type) {
    case "talk":
      return "talking";
    case "work":
      return "working";
    case "move":
      return "moving";
    case "rest":
      return "resting";
    default:
      return "idle";
  }
}
