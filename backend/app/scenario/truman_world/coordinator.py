from __future__ import annotations

from typing import TYPE_CHECKING

from app.agent.providers import HeuristicDecisionProvider
from app.director.observer import DirectorAssessment, DirectorObserver
from app.director.planner import DirectorPlanner
from app.scenario.truman_world.heuristics import build_truman_world_decision
from app.sim.action_resolver import ActionIntent
from app.store.repositories import AgentRepository, EventRepository, RunRepository

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession

    from app.store.models import Agent, Event


class TrumanWorldCoordinator:
    """Coordinates Truman-world specific director and fallback behavior."""

    def __init__(self, session: AsyncSession | None = None) -> None:
        self.session = session
        self.run_repo = RunRepository(session) if session is not None else None
        self.agent_repo = AgentRepository(session) if session is not None else None
        self.event_repo = EventRepository(session) if session is not None else None
        self.observer = DirectorObserver()
        self.planner = DirectorPlanner()

    async def observe_run(self, run_id: str, event_limit: int = 20) -> DirectorAssessment:
        if self.run_repo is None or self.agent_repo is None or self.event_repo is None:
            msg = "TrumanWorldCoordinator.observe_run requires a database session"
            raise RuntimeError(msg)
        run = await self.run_repo.get(run_id)
        if run is None:
            msg = f"Run not found: {run_id}"
            raise ValueError(msg)

        agents = await self.agent_repo.list_for_run(run_id)
        events = await self.event_repo.list_for_run(run_id, limit=event_limit)
        return self.assess(
            run_id=run_id, current_tick=run.current_tick, agents=agents, events=events
        )

    async def build_director_plan(self, run_id: str, agents: list[Agent]):
        assessment = await self.observe_run(run_id)
        return self.planner.build_plan(assessment=assessment, agents=list(agents))

    def assess(
        self,
        *,
        run_id: str,
        current_tick: int,
        agents: list[Agent],
        events: list[Event],
    ) -> DirectorAssessment:
        return self.observer.assess(
            run_id=run_id,
            current_tick=current_tick,
            agents=list(agents),
            events=list(events),
        )

    def merge_agent_profile(self, agent: Agent, plan) -> dict:
        profile = dict(agent.profile or {})
        if plan and agent.id in plan.target_cast_ids:
            profile.update(
                {
                    "director_scene_goal": plan.scene_goal,
                    "director_priority": plan.priority,
                    "director_message_hint": plan.message_hint,
                    "director_target_agent_id": plan.target_agent_id,
                    "director_location_hint": plan.location_hint,
                    "director_reason": plan.reason,
                }
            )
        return profile

    def configure_runtime(self, agent_runtime) -> None:
        provider = getattr(agent_runtime, "decision_provider", None)
        if isinstance(provider, HeuristicDecisionProvider):
            provider.set_decision_hook(self.build_runtime_decision)

    def build_runtime_decision(
        self,
        world: dict,
        nearby_agent_id: str | None,
        current_location_id: str | None,
        home_location_id: str | None,
    ):
        return build_truman_world_decision(
            world=world,
            nearby_agent_id=nearby_agent_id,
            current_location_id=current_location_id,
            home_location_id=home_location_id,
        )

    def fallback_intent(
        self,
        *,
        agent_id: str,
        current_location_id: str,
        home_location_id: str | None,
        nearby_agent_id: str | None,
        world_role: str | None = None,
        current_status: dict | None = None,
        truman_suspicion_score: float = 0.0,
        director_scene_goal: str | None = None,
        director_priority: str | None = None,
    ) -> ActionIntent | None:
        decision = build_truman_world_decision(
            world={
                "world_role": world_role,
                "self_status": current_status or {},
                "truman_suspicion_score": truman_suspicion_score,
                "director_scene_goal": director_scene_goal,
                "director_priority": director_priority,
            },
            nearby_agent_id=nearby_agent_id,
            current_location_id=current_location_id,
            home_location_id=home_location_id,
        )
        if decision is not None:
            payload = dict(decision.payload)
            if decision.message:
                payload["message"] = decision.message
            return ActionIntent(
                agent_id=agent_id,
                action_type=decision.action_type,
                target_location_id=decision.target_location_id,
                target_agent_id=decision.target_agent_id,
                payload=payload,
            )

        return None
