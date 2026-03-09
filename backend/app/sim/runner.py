from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from app.sim.action_resolver import ActionIntent, ActionResolver, ActionResult
from app.sim.world import WorldState


@dataclass
class TickResult:
    tick_no: int
    world_time: str
    accepted: list[ActionResult]
    rejected: list[ActionResult]


class SimulationRunner:
    """Coordinates simulation ticks for a run."""

    def __init__(self, world: WorldState, resolver: ActionResolver | None = None) -> None:
        self.world = world
        self.resolver = resolver or ActionResolver()
        self.tick_no = 0

    def tick(self, intents: Iterable[ActionIntent]) -> TickResult:
        accepted: list[ActionResult] = []
        rejected: list[ActionResult] = []

        intent_list = list(intents)
        self.resolver.reset_tick()
        # Pre-scan all talk intents so both actor and target are in _talked_agents
        # before any resolve() call, ensuring order-independent suppression of
        # concurrent non-talk actions from agents already in a conversation.
        self.resolver.prefill_talked_agents(intent_list, self.world)
        for intent in intent_list:
            result = self.resolver.resolve(self.world, intent)
            if result.accepted:
                accepted.append(result)
            else:
                rejected.append(result)

        world_time = self.world.advance_tick().isoformat()
        self.tick_no += 1
        return TickResult(
            tick_no=self.tick_no,
            world_time=world_time,
            accepted=accepted,
            rejected=rejected,
        )
