from __future__ import annotations

from types import SimpleNamespace

import pytest

import app.main as main_module


@pytest.mark.asyncio
async def test_lifespan_shutdown_stops_scheduler_and_closes_connection_pool(monkeypatch):
    calls: list[str] = []

    class FakeScheduler:
        async def stop_all(self) -> None:
            calls.append("scheduler.stop_all")

    async def fake_close_connection_pool() -> None:
        calls.append("connection_pool.close")

    monkeypatch.setattr(main_module, "get_db_session_context", lambda: _empty_session_context())

    import app.sim.scheduler as scheduler_module
    import app.agent.connection_pool as connection_pool_module

    monkeypatch.setattr(scheduler_module, "get_scheduler", lambda: FakeScheduler())
    monkeypatch.setattr(
        connection_pool_module,
        "close_connection_pool",
        fake_close_connection_pool,
    )

    app = SimpleNamespace()
    async with main_module.lifespan(app):
        pass

    assert calls == ["scheduler.stop_all", "connection_pool.close"]


async def _empty_session_context():
    if False:
        yield None
