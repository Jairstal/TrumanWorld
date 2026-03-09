from datetime import UTC, datetime, timedelta

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent.memory_mcp_server import (
    _format_memory_result,
    _get_memories_about_agent,
    _get_memories_by_location,
    _get_recent_memories,
    _search_memories,
)
from app.store.models import Agent, Location, Memory, SimulationRun


@pytest_asyncio.fixture
async def memory_test_data(db_session: AsyncSession):
    run_id = "run-memory-mcp"
    agent_id = f"{run_id}-alice"
    other_agent_id = f"{run_id}-bob"
    location_id = f"{run_id}-cafe"
    engine = db_session.bind
    assert engine is not None

    db_session.add_all(
        [
            SimulationRun(id=run_id, name="memory-mcp", status="running"),
            Agent(
                id=agent_id,
                run_id=run_id,
                name="Alice",
                occupation="barista",
                personality={},
                profile={},
                status={},
                current_plan={},
            ),
            Agent(
                id=other_agent_id,
                run_id=run_id,
                name="Bob",
                occupation="resident",
                personality={},
                profile={},
                status={},
                current_plan={},
            ),
            Location(
                id=location_id,
                run_id=run_id,
                name="Cafe",
                location_type="cafe",
                capacity=5,
            ),
        ]
    )

    now = datetime.now(UTC)
    db_session.add_all(
        [
            Memory(
                id="mem-long-bob",
                run_id=run_id,
                agent_id=agent_id,
                tick_no=5,
                memory_type="episodic_long",
                memory_category="long_term",
                content="Talked with Bob about the cafe renovation.",
                summary="Talked with Bob",
                importance=0.9,
                related_agent_id=other_agent_id,
                location_id=location_id,
                created_at=now - timedelta(minutes=5),
                metadata_json={},
            ),
            Memory(
                id="mem-short-cafe",
                run_id=run_id,
                agent_id=agent_id,
                tick_no=6,
                memory_type="episodic_short",
                memory_category="short_term",
                content="Served coffee at the cafe.",
                summary="Served coffee",
                importance=0.4,
                location_id=location_id,
                created_at=now - timedelta(minutes=1),
                metadata_json={},
            ),
            Memory(
                id="mem-long-park",
                run_id=run_id,
                agent_id=agent_id,
                tick_no=3,
                memory_type="episodic_long",
                memory_category="long_term",
                content="Walked alone in the park.",
                summary="Park walk",
                importance=0.5,
                created_at=now - timedelta(minutes=10),
                metadata_json={},
            ),
            Memory(
                id="mem-other-agent",
                run_id=run_id,
                agent_id=other_agent_id,
                tick_no=7,
                memory_type="episodic_long",
                memory_category="long_term",
                content="Bob remembers something else.",
                summary="Bob memory",
                importance=0.3,
                created_at=now,
                metadata_json={},
            ),
        ]
    )
    await db_session.commit()

    return {
        "engine": engine,
        "run_id": run_id,
        "agent_id": agent_id,
        "other_agent_id": other_agent_id,
        "location_id": location_id,
    }


def test_format_memory_result_handles_empty_and_populated_records():
    assert _format_memory_result([]) == "没有找到相关记忆。"

    formatted = _format_memory_result(
        [
            {
                "tick_no": 5,
                "memory_category": "long_term",
                "summary": "Talked with Bob",
                "related_agent_name": "Bob",
            }
        ]
    )

    assert "找到以下记忆：" in formatted
    assert "[Tick 5] [long_term] Talked with Bob" in formatted
    assert "相关人物: Bob" in formatted


@pytest.mark.asyncio
async def test_search_memories_filters_by_query_category_and_agent(memory_test_data):
    results = await _search_memories(
        memory_test_data["engine"],
        memory_test_data["agent_id"],
        query="Bob",
        limit=5,
        category="long_term",
    )

    assert [memory["id"] for memory in results] == ["mem-long-bob"]
    assert results[0]["related_agent_name"] == "Bob"


@pytest.mark.asyncio
async def test_get_recent_memories_returns_latest_and_respects_category(memory_test_data):
    all_results = await _get_recent_memories(
        memory_test_data["engine"],
        memory_test_data["agent_id"],
        limit=2,
        category="all",
    )
    long_term_only = await _get_recent_memories(
        memory_test_data["engine"],
        memory_test_data["agent_id"],
        limit=5,
        category="long_term",
    )

    assert [memory["id"] for memory in all_results] == ["mem-short-cafe", "mem-long-bob"]
    assert [memory["id"] for memory in long_term_only] == ["mem-long-bob", "mem-long-park"]


@pytest.mark.asyncio
async def test_get_memories_about_agent_resolves_agent_by_name(memory_test_data):
    results = await _get_memories_about_agent(
        memory_test_data["engine"],
        memory_test_data["agent_id"],
        other_agent_id="Bob",
        run_id=memory_test_data["run_id"],
        limit=5,
    )

    assert [memory["id"] for memory in results] == ["mem-long-bob"]
    assert results[0]["related_agent_id"] == memory_test_data["other_agent_id"]
    assert results[0]["related_agent_name"] == "Bob"


@pytest.mark.asyncio
async def test_get_memories_by_location_uses_location_name(memory_test_data):
    results = await _get_memories_by_location(
        memory_test_data["engine"],
        memory_test_data["agent_id"],
        location_id=memory_test_data["location_id"],
        limit=5,
    )

    assert [memory["id"] for memory in results] == ["mem-short-cafe", "mem-long-bob"]
    assert all(memory["location_name"] == "Cafe" for memory in results)
