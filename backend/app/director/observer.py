from __future__ import annotations

from dataclasses import dataclass, field

from app.store.models import Agent, Event


@dataclass
class DirectorAssessment:
    run_id: str
    current_tick: int
    truman_agent_id: str | None
    truman_suspicion_score: float
    suspicion_level: str
    continuity_risk: str
    focus_agent_ids: list[str] = field(default_factory=list)
    notes: list[str] = field(default_factory=list)


class DirectorObserver:
    """Read-only observer for world stability and Truman suspicion."""

    def assess(
        self,
        *,
        run_id: str,
        current_tick: int,
        agents: list[Agent],
        events: list[Event],
    ) -> DirectorAssessment:
        truman = next(
            (agent for agent in agents if (agent.profile or {}).get("world_role") == "truman"),
            None,
        )
        suspicion_score = (
            float((truman.status or {}).get("suspicion_score", 0.0) or 0.0) if truman else 0.0
        )

        rejected_count = sum(1 for event in events if event.event_type.endswith("_rejected"))
        director_count = sum(1 for event in events if event.event_type.startswith("director_"))
        continuity_score = min(1.0, (rejected_count * 0.18) + (director_count * 0.22))

        focus_agent_ids = [truman.id] if truman else []
        for event in events:
            for agent_id in (event.actor_agent_id, event.target_agent_id):
                if not agent_id or agent_id in focus_agent_ids:
                    continue
                focus_agent_ids.append(agent_id)
                if len(focus_agent_ids) >= 3:
                    break
            if len(focus_agent_ids) >= 3:
                break

        notes: list[str] = []
        if suspicion_score >= 0.6:
            notes.append("Truman 的怀疑度已进入需要重点观察的区间。")
        if rejected_count > 0:
            notes.append("最近存在被拒绝或受阻的动作，可能削弱世界的自然感。")
        if director_count > 0:
            notes.append("最近出现了导演级事件，需要关注连续性修补效果。")
        if not notes:
            notes.append("世界整体保持平稳，暂无明显异常信号。")

        return DirectorAssessment(
            run_id=run_id,
            current_tick=current_tick,
            truman_agent_id=truman.id if truman else None,
            truman_suspicion_score=suspicion_score,
            suspicion_level=self._label_suspicion(suspicion_score),
            continuity_risk=self._label_continuity(continuity_score),
            focus_agent_ids=focus_agent_ids,
            notes=notes,
        )

    def _label_suspicion(self, score: float) -> str:
        if score >= 0.8:
            return "high"
        if score >= 0.6:
            return "alerted"
        if score >= 0.3:
            return "guarded"
        return "low"

    def _label_continuity(self, score: float) -> str:
        if score >= 0.75:
            return "critical"
        if score >= 0.45:
            return "elevated"
        if score >= 0.15:
            return "watch"
        return "stable"
