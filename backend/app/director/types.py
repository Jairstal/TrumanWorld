"""Director system types and data classes."""

from __future__ import annotations

from dataclasses import dataclass


@dataclass
class DirectorPlan:
    """Director intervention plan."""

    scene_goal: str
    target_cast_ids: list[str]
    priority: str
    message_hint: str | None = None
    location_hint: str | None = None
    target_agent_id: str | None = None
    reason: str | None = None
    # 新增字段
    urgency: str = "advisory"  # "advisory" | "immediate" | "emergency"
    cooldown_ticks: int = 3  # 建议的冷却时间
    # 智能决策标记
    is_intelligent_decision: bool = False  # 是否由LLM智能决策生成
    strategy: str | None = None  # 干预策略描述
