from __future__ import annotations

from dataclasses import dataclass

from app.director.observer import DirectorAssessment
from app.store.models import Agent


@dataclass
class DirectorPlan:
    scene_goal: str
    target_cast_ids: list[str]
    priority: str
    message_hint: str | None = None
    location_hint: str | None = None
    target_agent_id: str | None = None
    reason: str | None = None


class DirectorPlanner:
    """Rule-based planner that turns observation into low-frequency advisory guidance."""

    def build_plan(
        self,
        *,
        assessment: DirectorAssessment,
        agents: list[Agent],
    ) -> DirectorPlan | None:
        cast_agents = [
            agent for agent in agents if (agent.profile or {}).get("world_role") == "cast"
        ]
        if not cast_agents or assessment.truman_agent_id is None:
            return None

        primary_cast = self._pick_primary_cast(cast_agents)
        if primary_cast is None:
            return None

        if assessment.suspicion_level == "high":
            return DirectorPlan(
                scene_goal="soft_check_in",
                target_cast_ids=[primary_cast.id],
                priority="advisory",
                message_hint=(
                    "如果你刚好和 Truman 有自然互动，可以顺着熟悉的话题聊几句，"
                    "保持日常节奏，不必刻意安抚。"
                ),
                target_agent_id=assessment.truman_agent_id,
                reason="Truman 的警觉明显升高，适合通过自然熟人互动轻微稳住场面。",
            )

        if assessment.continuity_risk in {"critical", "elevated"}:
            return DirectorPlan(
                scene_goal="keep_scene_natural",
                target_cast_ids=[primary_cast.id],
                priority="advisory",
                message_hint=(
                    "如果场景里出现互动，优先保持连续、熟悉、低突兀感的回应，"
                    "不要主动放大最近的小异常。"
                ),
                target_agent_id=assessment.truman_agent_id,
                reason="当前场景连续性开始变脆弱，适合用轻微日常互动维持自然感。",
            )

        return None

    def _pick_primary_cast(self, cast_agents: list[Agent]) -> Agent | None:
        sorted_agents = sorted(
            cast_agents,
            key=lambda agent: (
                (agent.profile or {}).get("agent_config_id") not in {"spouse", "friend"},
                agent.name,
            ),
        )
        return sorted_agents[0] if sorted_agents else None
