from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from app.protocol.simulation import (
    DIRECTOR_SCENE_BREAK_ISOLATION,
    DIRECTOR_SCENE_KEEP_NATURAL,
    DIRECTOR_SCENE_PREEMPTIVE_COMFORT,
    DIRECTOR_SCENE_REJECTION_RECOVERY,
    DIRECTOR_SCENE_SOFT_CHECK_IN,
)
from app.director.agent import DirectorAgent, DirectorContext
from app.director.observer import DirectorAssessment
from app.director.types import DirectorPlan
from app.infra.logging import get_logger
from app.scenario.truman_world.types import get_agent_config_id, get_world_role
from app.store.models import Agent

logger = get_logger(__name__)


class DirectorPlanner:
    """Hybrid planner that combines rule-based and LLM-based intervention decisions.

    支持的场景策略：
    - soft_check_in: 高怀疑度时的温和互动
    - preemptive_comfort: 怀疑度快速上升时的预防性干预
    - keep_scene_natural: 连续性风险时的场景维护
    - break_isolation: 打破 Truman 长时间独处
    - rejection_recovery: 处理连续被拒绝的场景

    实验性功能：当 director_agent_enabled=true 时，优先使用LLM智能决策
    """

    def __init__(self) -> None:
        self._agent = DirectorAgent()

    async def build_plan(
        self,
        *,
        assessment: DirectorAssessment,
        agents: list[Agent],
        recent_intervention_goals: list[str] | None = None,
        current_tick: int = 0,
        recent_events: list[dict[str, Any]] | None = None,
        recent_interventions: list[dict[str, Any]] | None = None,
        world_time: str = "",
        run_id: str = "",
    ) -> DirectorPlan | None:
        """构建导演干预计划

        Args:
            assessment: 世界状态评估
            agents: 所有 agent 列表
            recent_intervention_goals: 最近已执行的场景目标列表（用于避免重复）
            current_tick: 当前 tick 编号
            recent_events: 最近事件列表（用于智能决策）
            recent_interventions: 最近干预记录（用于智能决策）
            world_time: 世界时间字符串
            run_id: 运行ID

        Returns:
            DirectorPlan 或 None（无需干预时）
        """
        cast_agents = [agent for agent in agents if get_world_role(agent.profile) == "cast"]
        if not cast_agents or assessment.truman_agent_id is None:
            return None

        # 检查最近已执行的干预，避免重复
        recent_goals = set(recent_intervention_goals or [])

        # 实验性功能：尝试使用LLM智能决策
        if self._agent.is_enabled() and self._agent.should_decide(current_tick):
            try:
                context = DirectorContext(
                    run_id=run_id,
                    current_tick=current_tick,
                    assessment=assessment,
                    agents=agents,
                    recent_events=recent_events or [],
                    recent_interventions=recent_interventions or [],
                    world_time=world_time,
                )
                plan = await self._agent.decide(context, recent_goals)
                if plan is not None:
                    # 标记为智能决策
                    plan.is_intelligent_decision = True
                    logger.info(
                        f"DirectorAgent made intelligent decision at tick {current_tick}: "
                        f"{plan.scene_goal} targeting {plan.target_cast_ids}"
                    )
                    return plan
            except Exception as exc:
                logger.warning(f"DirectorAgent decision failed, falling back to rules: {exc}")

        # 回退到规则决策
        return self._build_rule_based_plan(assessment, cast_agents, recent_goals)

    def _build_rule_based_plan(
        self,
        assessment: DirectorAssessment,
        cast_agents: list[Agent],
        recent_goals: set[str],
    ) -> DirectorPlan | None:
        """基于规则的干预计划构建（回退方案）"""
        # 按优先级顺序检查各个场景策略
        # 1. 紧急场景：怀疑度快速上升
        if (plan := self._check_rapid_rise(assessment, cast_agents, recent_goals)) is not None:
            return plan

        # 2. 高优先级场景：高怀疑度
        if (plan := self._check_high_suspicion(assessment, cast_agents, recent_goals)) is not None:
            return plan

        # 3. 被拒绝恢复（比一般连续性问题更具体）
        if (
            plan := self._check_rejection_recovery(assessment, cast_agents, recent_goals)
        ) is not None:
            return plan

        # 4. 连续性问题
        if (plan := self._check_continuity_risk(assessment, cast_agents, recent_goals)) is not None:
            return plan

        # 5. 社交隔离
        if (plan := self._check_isolation(assessment, cast_agents, recent_goals)) is not None:
            return plan

        return None

    def _check_rapid_rise(
        self,
        assessment: DirectorAssessment,
        cast_agents: list[Agent],
        recent_goals: set[str],
    ) -> DirectorPlan | None:
        """检查怀疑度快速上升场景"""
        if DIRECTOR_SCENE_PREEMPTIVE_COMFORT in recent_goals:
            return None

        trend = assessment.suspicion_trend
        if trend is None or trend.trend_type != "rapid_rise":
            return None

        primary_cast = self._pick_primary_cast(cast_agents)
        if primary_cast is None:
            return None

        return DirectorPlan(
            scene_goal=DIRECTOR_SCENE_PREEMPTIVE_COMFORT,
            target_cast_ids=[primary_cast.id],
            priority="high",
            urgency="immediate",
            message_hint=(
                "Truman 最近似乎有些不安，如果自然遇到，"
                "可以用轻松的日常话题转移注意力，比如聊聊天气或最近的小事。"
            ),
            target_agent_id=assessment.truman_agent_id,
            reason=f"怀疑度快速上升（+{trend.delta:.2f}），需要提前干预防止恶化。",
            cooldown_ticks=2,
        )

    def _check_high_suspicion(
        self,
        assessment: DirectorAssessment,
        cast_agents: list[Agent],
        recent_goals: set[str],
    ) -> DirectorPlan | None:
        """检查高怀疑度场景"""
        if DIRECTOR_SCENE_SOFT_CHECK_IN in recent_goals:
            return None

        if assessment.suspicion_level != "high":
            return None

        primary_cast = self._pick_primary_cast(cast_agents)
        if primary_cast is None:
            return None

        return DirectorPlan(
            scene_goal=DIRECTOR_SCENE_SOFT_CHECK_IN,
            target_cast_ids=[primary_cast.id],
            priority="advisory",
            urgency="advisory",
            message_hint=(
                "如果你刚好和 Truman 有自然互动，可以顺着熟悉的话题聊几句，"
                "保持日常节奏，不必刻意安抚。"
            ),
            target_agent_id=assessment.truman_agent_id,
            reason="Truman 的警觉明显升高，适合通过自然熟人互动轻微稳住场面。",
            cooldown_ticks=3,
        )

    def _check_continuity_risk(
        self,
        assessment: DirectorAssessment,
        cast_agents: list[Agent],
        recent_goals: set[str],
    ) -> DirectorPlan | None:
        """检查连续性风险场景"""
        if DIRECTOR_SCENE_KEEP_NATURAL in recent_goals:
            return None

        if assessment.continuity_risk not in {"critical", "elevated"}:
            return None

        primary_cast = self._pick_primary_cast(cast_agents)
        if primary_cast is None:
            return None

        return DirectorPlan(
            scene_goal=DIRECTOR_SCENE_KEEP_NATURAL,
            target_cast_ids=[primary_cast.id],
            priority="advisory",
            urgency="advisory",
            message_hint=(
                "如果场景里出现互动，优先保持连续、熟悉、低突兀感的回应，不要主动放大最近的小异常。"
            ),
            target_agent_id=assessment.truman_agent_id,
            reason="当前场景连续性开始变脆弱，适合用轻微日常互动维持自然感。",
            cooldown_ticks=3,
        )

    def _check_rejection_recovery(
        self,
        assessment: DirectorAssessment,
        cast_agents: list[Agent],
        recent_goals: set[str],
    ) -> DirectorPlan | None:
        """检查被拒绝恢复场景"""
        if DIRECTOR_SCENE_REJECTION_RECOVERY in recent_goals:
            return None

        if assessment.recent_rejections < 2:
            return None

        primary_cast = self._pick_primary_cast(cast_agents)
        if primary_cast is None:
            return None

        return DirectorPlan(
            scene_goal=DIRECTOR_SCENE_REJECTION_RECOVERY,
            target_cast_ids=[primary_cast.id],
            priority="high",
            urgency="immediate",
            message_hint=(
                "最近有一些动作被拒绝，如果 Truman 提起，"
                "可以自然地解释为'正好有事'或'没注意'，不要显得慌张。"
            ),
            target_agent_id=assessment.truman_agent_id,
            reason="连续被拒绝可能让世界显得不自然，需要主动修补。",
            cooldown_ticks=2,
        )

    def _check_isolation(
        self,
        assessment: DirectorAssessment,
        cast_agents: list[Agent],
        recent_goals: set[str],
    ) -> DirectorPlan | None:
        """检查社交隔离场景"""
        if DIRECTOR_SCENE_BREAK_ISOLATION in recent_goals:
            return None

        if assessment.truman_isolation_ticks < 5:
            return None

        primary_cast = self._pick_primary_cast(cast_agents)
        if primary_cast is None:
            return None

        return DirectorPlan(
            scene_goal=DIRECTOR_SCENE_BREAK_ISOLATION,
            target_cast_ids=[primary_cast.id],
            priority="normal",
            urgency="advisory",
            message_hint=(
                "Truman 已经独处较长时间，如果有自然理由（如路过、办完事），"
                "可以尝试发起简单互动，比如打个招呼或聊聊日常。"
            ),
            target_agent_id=assessment.truman_agent_id,
            reason=f"Truman 已经连续 {assessment.truman_isolation_ticks} 个 tick 独处，建议适时打破隔离。",
            cooldown_ticks=4,
        )

    def _pick_primary_cast(self, cast_agents: list[Agent]) -> Agent | None:
        sorted_agents = sorted(
            cast_agents,
            key=lambda agent: (
                get_agent_config_id(agent.profile) not in {"spouse", "friend"},
                agent.name,
            ),
        )
        return sorted_agents[0] if sorted_agents else None
