from __future__ import annotations

from typing import Any

from app.agent.config_loader import AgentConfig


class ContextBuilder:
    """Builds simulation context for planner, reactor, and reflector."""

    def build_base_context(
        self,
        agent: AgentConfig,
        world: dict[str, Any] | None = None,
        memory: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        filtered_world = self._filter_world_for_role(agent.world_role, world or {})
        return {
            "agent_id": agent.id,
            "agent_name": agent.name,
            "world_role": agent.world_role,
            "occupation": agent.occupation,
            "home": agent.home,
            "personality": agent.personality,
            "world": filtered_world,
            "memory": memory or {},
            "role_context": self._build_role_context(agent.world_role, filtered_world),
            "scene_guidance": self._build_scene_guidance(agent.world_role, filtered_world),
        }

    def build_planner_context(
        self,
        agent: AgentConfig,
        world: dict[str, Any] | None = None,
        memory: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        context = self.build_base_context(agent=agent, world=world, memory=memory)
        context["task"] = "planner"
        return context

    def build_reactor_context(
        self,
        agent: AgentConfig,
        world: dict[str, Any] | None = None,
        memory: dict[str, Any] | None = None,
        event: dict[str, Any] | None = None,
        recent_events: list[dict[str, Any]] | None = None,
    ) -> dict[str, Any]:
        context = self.build_base_context(agent=agent, world=world, memory=memory)
        context["task"] = "reactor"
        context["event"] = event or {}
        context["recent_events"] = recent_events or []
        return context

    def build_reflector_context(
        self,
        agent: AgentConfig,
        world: dict[str, Any] | None = None,
        memory: dict[str, Any] | None = None,
        daily_summary: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        context = self.build_base_context(agent=agent, world=world, memory=memory)
        context["task"] = "reflector"
        context["daily_summary"] = daily_summary or {}
        return context

    def _filter_world_for_role(
        self,
        world_role: str,
        world: dict[str, Any],
    ) -> dict[str, Any]:
        if world_role == "truman":
            return {
                key: value
                for key, value in world.items()
                if not key.startswith("director_") and not key.startswith("cast_")
            }
        return dict(world)

    def _build_role_context(self, world_role: str, world: dict[str, Any]) -> dict[str, Any]:
        if world_role == "truman":
            return {
                "perspective": "subjective",
                "focus": "以普通居民的身份体验世界，只根据亲身经历理解周围发生的事",
                "current_suspicion_score": world.get("self_status", {}).get("suspicion_score", 0.0),
                "guidance": [
                    "不要假设自己知道幕后信息",
                    "优先依据眼前线索和熟悉的日常节奏做判断",
                ],
            }
        if world_role == "cast":
            return {
                "perspective": "supporting_cast",
                "focus": "优先保持自然、熟悉、不过分用力的日常互动",
                "guidance": [
                    "优先做自然、连续、不会突然破坏日常节奏的动作",
                    "场景提示只是软参考，不需要生硬执行",
                    "如果信息不足，选择最稳妥、最像熟人日常的回应",
                ],
            }
        return {
            "perspective": "background",
            "focus": "保持低风险、背景化、自然的存在感",
            "guidance": ["优先做简单稳定的动作"],
        }

    def _build_scene_guidance(self, world_role: str, world: dict[str, Any]) -> dict[str, Any]:
        if world_role != "cast":
            return {}

        scene_goal = world.get("director_scene_goal")
        if not scene_goal:
            return {}

        return {
            "scene_goal": scene_goal,
            "priority": world.get("director_priority", "advisory"),
            "message_hint": world.get("director_message_hint"),
            "target_agent_id": world.get("director_target_agent_id"),
            "location_hint": world.get("director_location_hint"),
            "reason": world.get("director_reason"),
            "is_advisory": True,
        }
