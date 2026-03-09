import pytest

import app.sim.run_lifecycle as run_lifecycle_module
from app.store.models import Agent, SimulationRun
from app.store.repositories import RunRepository


class FakeScheduler:
    def __init__(self, *, running: bool) -> None:
        self.running = running
        self.started: list[tuple[str, float, object]] = []
        self.stopped: list[str] = []

    def is_running(self, run_id: str) -> bool:
        return self.running

    async def start_run(self, run_id: str, interval_seconds: float, callback) -> None:
        self.started.append((run_id, interval_seconds, callback))

    async def stop_run(self, run_id: str) -> None:
        self.stopped.append(run_id)


class FakePool:
    def __init__(self) -> None:
        self.warmup_calls: list[list[str]] = []
        self.cleanup_calls: list[str] = []

    async def warmup(self, agent_ids: list[str]) -> int:
        self.warmup_calls.append(agent_ids)
        return len(agent_ids)

    async def cleanup_run(self, run_id: str) -> int:
        self.cleanup_calls.append(run_id)
        return 1


class FakeService:
    def __init__(self) -> None:
        self.run_tick_calls: list[tuple[str, object]] = []

    async def run_tick_isolated(self, run_id: str, engine) -> None:
        self.run_tick_calls.append((run_id, engine))


@pytest.mark.asyncio
async def test_ensure_run_started_updates_status_when_scheduler_already_running(db_session):
    run = SimulationRun(id="run-lifecycle-1", name="demo", status="paused")
    db_session.add(run)
    await db_session.commit()

    scheduler = FakeScheduler(running=True)
    monkeypatch = pytest.MonkeyPatch()
    monkeypatch.setattr(run_lifecycle_module, "get_scheduler", lambda: scheduler)
    try:
        updated = await run_lifecycle_module.ensure_run_started(db_session, run)
    finally:
        monkeypatch.undo()

    refreshed = await RunRepository(db_session).get("run-lifecycle-1")
    assert updated.status == "running"
    assert refreshed is not None
    assert refreshed.status == "running"
    assert scheduler.started == []


@pytest.mark.asyncio
async def test_ensure_run_started_warms_pool_and_registers_tick_callback(db_session, tmp_path):
    run = SimulationRun(
        id="run-lifecycle-2",
        name="demo",
        status="draft",
        scenario_type="truman_world",
    )
    db_session.add_all(
        [
            run,
            Agent(
                id="run-lifecycle-2-alice",
                run_id="run-lifecycle-2",
                name="Alice",
                occupation="barista",
                profile={"agent_config_id": "spouse"},
                personality={},
                status={},
                current_plan={},
            ),
            Agent(
                id="run-lifecycle-2-bob",
                run_id="run-lifecycle-2",
                name="Bob",
                occupation="resident",
                profile={},
                personality={},
                status={},
                current_plan={},
            ),
        ]
    )
    await db_session.commit()

    scheduler = FakeScheduler(running=False)
    pool = FakePool()
    created_registry_paths: list[object] = []
    created_runtimes: list[tuple[object, object]] = []
    created_services: list[FakeService] = []
    scenario = object()
    fake_engine = object()

    class FakeRegistry:
        def __init__(self, path) -> None:
            created_registry_paths.append(path)

    class FakeRuntime:
        def __init__(self, registry, connection_pool) -> None:
            created_runtimes.append((registry, connection_pool))

    def fake_build_scenario(scenario_type: str):
        assert scenario_type == "truman_world"
        return scenario

    def fake_create_for_scheduler(agent_runtime, scenario):
        assert scenario is not None
        service = FakeService()
        created_services.append(service)
        return service

    monkeypatch = pytest.MonkeyPatch()
    monkeypatch.setattr(run_lifecycle_module, "get_scheduler", lambda: scheduler)
    monkeypatch.setattr(run_lifecycle_module, "get_settings", lambda: type("S", (), {"project_root": tmp_path})())
    monkeypatch.setattr(run_lifecycle_module, "get_connection_pool", lambda: _return_async(pool))
    monkeypatch.setattr(run_lifecycle_module, "AgentRegistry", FakeRegistry)
    monkeypatch.setattr(run_lifecycle_module, "AgentRuntime", FakeRuntime)
    monkeypatch.setattr(run_lifecycle_module.SimulationService, "build_scenario", fake_build_scenario)
    monkeypatch.setattr(
        run_lifecycle_module.SimulationService,
        "create_for_scheduler",
        fake_create_for_scheduler,
    )
    monkeypatch.setattr(run_lifecycle_module, "async_engine", fake_engine)
    try:
        updated = await run_lifecycle_module.ensure_run_started(db_session, run)
        callback = scheduler.started[0][2]
        await callback("run-lifecycle-2")
    finally:
        monkeypatch.undo()

    assert updated.status == "running"
    assert created_registry_paths == [tmp_path / "agents"]
    assert len(created_runtimes) == 1
    assert created_runtimes[0][1] is pool
    assert pool.warmup_calls == [["run-lifecycle-2:spouse", "run-lifecycle-2:run-lifecycle-2-bob"]] or pool.warmup_calls == [["run-lifecycle-2:run-lifecycle-2-bob", "run-lifecycle-2:spouse"]]
    assert scheduler.started
    assert scheduler.started[0][0] == "run-lifecycle-2"
    assert scheduler.started[0][1] == 5.0
    assert len(created_services) == 1
    assert created_services[0].run_tick_calls == [("run-lifecycle-2", fake_engine)]


@pytest.mark.asyncio
async def test_ensure_run_started_skips_warmup_when_run_has_no_agents(db_session, tmp_path):
    run = SimulationRun(id="run-lifecycle-3", name="demo", status="draft")
    db_session.add(run)
    await db_session.commit()

    scheduler = FakeScheduler(running=False)
    pool = FakePool()

    class FakeRegistry:
        def __init__(self, path) -> None:
            self.path = path

    class FakeRuntime:
        def __init__(self, registry, connection_pool) -> None:
            self.registry = registry
            self.connection_pool = connection_pool

    monkeypatch = pytest.MonkeyPatch()
    monkeypatch.setattr(run_lifecycle_module, "get_scheduler", lambda: scheduler)
    monkeypatch.setattr(run_lifecycle_module, "get_settings", lambda: type("S", (), {"project_root": tmp_path})())
    monkeypatch.setattr(run_lifecycle_module, "get_connection_pool", lambda: _return_async(pool))
    monkeypatch.setattr(run_lifecycle_module, "AgentRegistry", FakeRegistry)
    monkeypatch.setattr(run_lifecycle_module, "AgentRuntime", FakeRuntime)
    monkeypatch.setattr(run_lifecycle_module.SimulationService, "build_scenario", lambda _: object())
    monkeypatch.setattr(
        run_lifecycle_module.SimulationService,
        "create_for_scheduler",
        lambda agent_runtime, scenario: FakeService(),
    )
    try:
        await run_lifecycle_module.ensure_run_started(db_session, run)
    finally:
        monkeypatch.undo()

    assert pool.warmup_calls == []
    assert len(scheduler.started) == 1


@pytest.mark.asyncio
async def test_pause_run_execution_stops_scheduler_and_cleans_pool():
    scheduler = FakeScheduler(running=True)
    pool = FakePool()

    monkeypatch = pytest.MonkeyPatch()
    monkeypatch.setattr(run_lifecycle_module, "get_scheduler", lambda: scheduler)
    monkeypatch.setattr(run_lifecycle_module, "get_connection_pool", lambda: _return_async(pool))
    try:
        await run_lifecycle_module.pause_run_execution("run-lifecycle-4")
    finally:
        monkeypatch.undo()

    assert scheduler.stopped == ["run-lifecycle-4"]
    assert pool.cleanup_calls == ["run-lifecycle-4"]


async def _return_async(value):
    return value
