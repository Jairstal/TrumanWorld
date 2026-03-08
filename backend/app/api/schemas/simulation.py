from __future__ import annotations

from pydantic import BaseModel, Field

from app.protocol.simulation import EventType


class StatusResponse(BaseModel):
    run_id: str
    status: str


class RunDetailResponse(BaseModel):
    id: str
    name: str
    status: str
    scenario_type: str
    current_tick: int
    tick_minutes: int


class TimelineEventResponse(BaseModel):
    id: str
    tick_no: int
    event_type: EventType
    importance: float | None = None
    payload: dict = Field(default_factory=dict)


class TimelineResponse(BaseModel):
    run_id: str
    events: list[TimelineEventResponse]


class DirectorObservationResponse(BaseModel):
    run_id: str
    current_tick: int
    truman_agent_id: str | None = None
    truman_suspicion_score: float
    suspicion_level: str
    continuity_risk: str
    focus_agent_ids: list[str]
    notes: list[str]


class AgentSummaryResponse(BaseModel):
    id: str
    name: str
    occupation: str | None = None
    current_goal: str | None = None
    current_location_id: str | None = None
    config_id: str | None = None


class AgentsListResponse(BaseModel):
    run_id: str
    agents: list[AgentSummaryResponse]


class AgentEventResponse(BaseModel):
    id: str
    tick_no: int
    event_type: EventType
    actor_agent_id: str | None = None
    actor_name: str | None = None
    target_agent_id: str | None = None
    target_name: str | None = None
    location_id: str | None = None
    location_name: str | None = None
    payload: dict = Field(default_factory=dict)


class AgentMemoryResponse(BaseModel):
    id: str
    memory_type: str
    summary: str | None = None
    content: str
    importance: float | None = None
    related_agent_id: str | None = None
    related_agent_name: str | None = None


class AgentRelationshipResponse(BaseModel):
    other_agent_id: str
    other_agent_name: str | None = None
    familiarity: float
    trust: float
    affinity: float
    relation_type: str


class AgentDetailResponse(BaseModel):
    run_id: str
    agent_id: str
    name: str
    occupation: str | None = None
    status: dict = Field(default_factory=dict)
    current_goal: str | None = None
    config_id: str | None = None
    recent_events: list[AgentEventResponse]
    memories: list[AgentMemoryResponse]
    relationships: list[AgentRelationshipResponse]


class WorldClockResponse(BaseModel):
    iso: str
    date: str
    time: str
    year: int
    month: int
    day: int
    hour: int
    minute: int
    weekday: int
    weekday_name: str
    weekday_name_cn: str
    is_weekend: bool
    time_period: str
    time_period_cn: str


class WorldLocationResponse(BaseModel):
    id: str
    name: str
    location_type: str
    x: int
    y: int
    capacity: int
    occupants: list[AgentSummaryResponse]


class WorldEventResponse(BaseModel):
    id: str
    tick_no: int
    event_type: EventType
    location_id: str | None = None
    actor_agent_id: str | None = None
    target_agent_id: str | None = None
    actor_name: str | None = None
    target_name: str | None = None
    location_name: str | None = None
    payload: dict = Field(default_factory=dict)


class WorldSnapshotRunResponse(BaseModel):
    id: str
    name: str
    status: str
    scenario_type: str
    current_tick: int
    tick_minutes: int


class WorldSnapshotResponse(BaseModel):
    run: WorldSnapshotRunResponse
    world_clock: WorldClockResponse
    locations: list[WorldLocationResponse]
    recent_events: list[WorldEventResponse]
