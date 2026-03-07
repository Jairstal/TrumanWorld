from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.infra.db import async_engine, get_db_session_context
from app.infra.logging import get_logger, info
from app.infra.settings import get_settings
from app.store.repositories import RunRepository

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler for startup and shutdown events."""
    # Startup: Reset all running runs to paused
    info("Application starting up, checking for running runs...")
    try:
        async for session in get_db_session_context():
            repo = RunRepository(session)
            reset_runs = await repo.reset_running_on_startup()
            if reset_runs:
                info(
                    f"Reset {len(reset_runs)} running runs to paused (marked for restore): "
                    f"{[r.id for r in reset_runs]}"
                )
            break  # Only need one session
    except Exception as e:
        logger.error(f"Failed to reset running runs on startup: {e}")

    yield  # Application runs here

    # Shutdown: cleanup if needed
    info("Application shutting down")


def create_app() -> FastAPI:
    settings = get_settings()

    info(f"Starting AI Truman World API in {settings.app_env} mode")
    info(f"Log level: {settings.log_level}")
    info(f"CORS allowed origins: {settings.cors_allowed_origins}")

    app = FastAPI(
        title="AI Truman World API",
        version="0.1.0",
        lifespan=lifespan,
        description="""
## AI Truman World - AI 社会模拟系统

一个可持续运行、可观察、可回放的 AI 社会模拟系统。创建 10-20 个拥有独立人格的 AI agent，让它们在小镇中生活、社交、成长。

### 核心功能

- **Run 管理**: 创建、启动、暂停、恢复模拟运行
- **Agent 观测**: 查看任意 agent 的状态、记忆、关系和事件
- **时间线**: 获取完整的事件时间线
- **世界快照**: 查看世界状态的实时快照
- **导演系统**: 注入事件影响世界走向

### 技术栈

- **Backend**: Python + FastAPI
- **AI Cognition**: Claude Agent SDK
- **Database**: PostgreSQL + pgvector
- **Cache**: Redis
        """,
        openapi_tags=[
            {
                "name": "health",
                "description": "健康检查接口",
            },
            {
                "name": "runs",
                "description": """
**模拟运行管理**

创建和控制 AI 模拟运行 (Run)，包括：
- 创建新 run（可选填充演示数据）
- 启动/暂停/恢复运行
- 删除 run
- 查看 run 列表和详情
- 推进 tick
                """,
            },
            {
                "name": "agents",
                "description": """
**Agent 观测**

查看模拟运行中的 agent 详细信息：
- 列出所有 agent
- 获取 agent 详情（状态、记忆、关系、事件）
                """,
            },
        ],
        openapi_url="/api/openapi.json",
        docs_url="/api/docs",
        redoc_url="/api/redoc",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.state.settings = settings
    app.include_router(api_router, prefix=settings.api_prefix)

    info(f"API routes registered with prefix: {settings.api_prefix}")
    return app


app = create_app()
