from __future__ import annotations

import pytest

from app.scenario.open_world.scenario import OpenWorldScenario
from app.sim.world_loader import load_tick_data
from app.store.models import Agent, Location, SimulationRun


@pytest.mark.asyncio
async def test_load_tick_data_preserves_location_and_agent_work_fields(db_session):
    run = SimulationRun(id="run-world-loader", name="world-loader", status="running")
    hospital = Location(
        id="run-world-loader-hospital",
        run_id=run.id,
        name="海湾医院",
        location_type="hospital",
        capacity=8,
    )
    spouse = Agent(
        id="run-world-loader-spouse",
        run_id=run.id,
        name="Meryl",
        occupation="医院职员",
        home_location_id=hospital.id,
        current_location_id=hospital.id,
        current_goal="work",
        personality={},
        profile={
            "agent_config_id": "spouse",
            "world_role": "cast",
            "workplace_location_id": hospital.id,
        },
        status={},
        current_plan={},
    )

    db_session.add_all([run, hospital, spouse])
    await db_session.commit()

    loaded = await load_tick_data(
        session=db_session,
        run_id=run.id,
        scenario=OpenWorldScenario(db_session),
    )

    location_state = loaded.world.locations[hospital.id]
    agent_state = loaded.world.agents[spouse.id]
    assert location_state.location_type == "hospital"
    assert agent_state.occupation == "医院职员"
    assert agent_state.workplace_id == hospital.id
