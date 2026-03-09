import pytest

from app.store.models import Agent, Event, LlmCall, SimulationRun
from app.store.repositories import (
    AgentRepository,
    EventRepository,
    LlmCallRepository,
    RelationshipRepository,
    RunRepository,
)


@pytest.mark.asyncio
async def test_run_repository_create_and_get(db_session):
    repo = RunRepository(db_session)
    run = SimulationRun(id="run-repo-1", name="repo-run", status="draft")

    await repo.create(run)
    fetched = await repo.get("run-repo-1")

    assert fetched is not None
    assert fetched.name == "repo-run"
    assert fetched.status == "draft"


@pytest.mark.asyncio
async def test_event_repository_orders_events_by_tick_desc(db_session):
    run = SimulationRun(id="run-repo-2", name="timeline", status="running")
    db_session.add(run)
    db_session.add_all(
        [
            Event(id="event-a", run_id="run-repo-2", tick_no=1, event_type="move", payload={}),
            Event(id="event-b", run_id="run-repo-2", tick_no=3, event_type="talk", payload={}),
            Event(id="event-c", run_id="run-repo-2", tick_no=2, event_type="rest", payload={}),
        ]
    )
    await db_session.commit()

    repo = EventRepository(db_session)
    events = await repo.list_for_run("run-repo-2")

    assert [event.id for event in events] == ["event-b", "event-a", "event-c"]


@pytest.mark.asyncio
async def test_relationship_repository_upserts_and_clamps_values(db_session):
    run = SimulationRun(id="run-repo-3", name="relations", status="running")
    db_session.add(run)
    await db_session.commit()

    repo = RelationshipRepository(db_session)
    relation = await repo.upsert_interaction(
        run_id="run-repo-3",
        agent_id="alice",
        other_agent_id="bob",
        familiarity_delta=0.7,
        trust_delta=0.6,
        affinity_delta=0.4,
    )
    updated = await repo.upsert_interaction(
        run_id="run-repo-3",
        agent_id="alice",
        other_agent_id="bob",
        familiarity_delta=0.7,
        trust_delta=0.7,
        affinity_delta=0.8,
    )

    assert relation.other_agent_id == "bob"
    assert updated.familiarity == 1.0
    assert updated.trust == 1.0
    assert updated.affinity == 1.0


@pytest.mark.asyncio
async def test_list_recent_events_prioritises_talk_and_move_over_work_rest(db_session):
    """talk/move events must be returned before work/rest events even when the
    work/rest events occurred in more recent ticks, so that LLM context windows
    are not dominated by repetitive noise."""
    run = SimulationRun(id="run-priority", name="priority", status="running")
    agent = Agent(
        id="agent-p",
        run_id="run-priority",
        name="Alpha",
        occupation="tester",
        personality={},
        profile={},
        status={},
        current_plan={},
    )
    db_session.add_all([run, agent])

    # Two work events at high ticks, one talk event at a low tick
    db_session.add_all(
        [
            Event(
                id="ev-work-10",
                run_id="run-priority",
                tick_no=10,
                event_type="work",
                actor_agent_id="agent-p",
                payload={"agent_id": "agent-p"},
            ),
            Event(
                id="ev-work-11",
                run_id="run-priority",
                tick_no=11,
                event_type="work",
                actor_agent_id="agent-p",
                payload={"agent_id": "agent-p"},
            ),
            Event(
                id="ev-talk-5",
                run_id="run-priority",
                tick_no=5,
                event_type="talk",
                actor_agent_id="agent-p",
                payload={"agent_id": "agent-p", "message": "hello"},
            ),
            Event(
                id="ev-move-3",
                run_id="run-priority",
                tick_no=3,
                event_type="move",
                actor_agent_id="agent-p",
                payload={"agent_id": "agent-p"},
            ),
        ]
    )
    await db_session.commit()

    repo = AgentRepository(db_session)
    events = await repo.list_recent_events("run-priority", "agent-p", limit=4)
    event_types = [e.event_type for e in events]

    # talk and move must appear before work entries
    assert event_types.index("talk") < event_types.index("work")
    assert event_types.index("move") < event_types.index("work")
    # Both talk and the two work events should all be present within limit=4
    assert "talk" in event_types
    assert "move" in event_types
    assert event_types.count("work") == 2


# ============================================================
# LlmCallRepository Tests
# ============================================================


@pytest.mark.asyncio
async def test_llm_call_repository_get_token_totals_empty(db_session):
    """空 run 的 token 总计应全为 0。"""
    run = SimulationRun(id="run-llm-0", name="llm-test", status="running")
    db_session.add(run)
    await db_session.commit()

    repo = LlmCallRepository(db_session)
    totals = await repo.get_token_totals("run-llm-0")

    assert totals["input_tokens"] == 0
    assert totals["output_tokens"] == 0
    assert totals["cache_read_tokens"] == 0
    assert totals["cache_creation_tokens"] == 0


@pytest.mark.asyncio
async def test_llm_call_repository_get_token_totals_aggregates_correctly(db_session):
    """多条 llm_call 记录应被正确汇总。"""
    run = SimulationRun(id="run-llm-1", name="llm-agg", status="running")
    agent = Agent(
        id="agent-llm-1",
        run_id="run-llm-1",
        name="Alice",
        occupation="resident",
        personality={},
        profile={},
        status={},
        current_plan={},
    )
    db_session.add_all([run, agent])
    await db_session.commit()

    records = [
        LlmCall(
            id="llm-a",
            run_id="run-llm-1",
            agent_id="agent-llm-1",
            task_type="reactor",
            tick_no=1,
            input_tokens=100,
            output_tokens=200,
            cache_read_tokens=50,
            cache_creation_tokens=30,
            total_cost_usd=0.01,
            duration_ms=500,
        ),
        LlmCall(
            id="llm-b",
            run_id="run-llm-1",
            agent_id="agent-llm-1",
            task_type="reactor",
            tick_no=2,
            input_tokens=150,
            output_tokens=300,
            cache_read_tokens=80,
            cache_creation_tokens=20,
            total_cost_usd=0.02,
            duration_ms=600,
        ),
    ]
    db_session.add_all(records)
    await db_session.commit()

    repo = LlmCallRepository(db_session)
    totals = await repo.get_token_totals("run-llm-1")

    assert totals["input_tokens"] == 250
    assert totals["output_tokens"] == 500
    assert totals["cache_read_tokens"] == 130
    assert totals["cache_creation_tokens"] == 50


@pytest.mark.asyncio
async def test_llm_call_repository_isolates_by_run_id(db_session):
    """不同 run_id 的 llm_call 不应互相干扰。"""
    run_a = SimulationRun(id="run-llm-a", name="run-a", status="running")
    run_b = SimulationRun(id="run-llm-b", name="run-b", status="running")
    agent_a = Agent(
        id="agent-llm-a",
        run_id="run-llm-a",
        name="AgentA",
        occupation="r",
        personality={},
        profile={},
        status={},
        current_plan={},
    )
    db_session.add_all([run_a, run_b, agent_a])
    await db_session.commit()

    db_session.add(
        LlmCall(
            id="llm-run-a",
            run_id="run-llm-a",
            agent_id="agent-llm-a",
            task_type="reactor",
            tick_no=1,
            input_tokens=999,
            output_tokens=888,
            cache_read_tokens=0,
            cache_creation_tokens=0,
            duration_ms=100,
        )
    )
    await db_session.commit()

    repo = LlmCallRepository(db_session)
    totals_a = await repo.get_token_totals("run-llm-a")
    totals_b = await repo.get_token_totals("run-llm-b")

    assert totals_a["input_tokens"] == 999
    assert totals_b["input_tokens"] == 0
