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

        for intent in intents:
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
