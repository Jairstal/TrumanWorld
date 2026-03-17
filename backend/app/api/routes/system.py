from __future__ import annotations

from fastapi import APIRouter, Header

from app.api.auth import DEMO_ADMIN_HEADER, has_demo_admin_access, is_demo_write_protected
from app.api.schemas.auth import DemoAccessStatusResponse
from app.api.schemas.simulation import COMMON_RESPONSES, SystemOverviewResponse
from app.infra.system_overview import get_system_overview_payload

router = APIRouter()


@router.get(
    "/system/overview",
    response_model=SystemOverviewResponse,
    summary="项目运行总览",
    description="返回 backend/frontend/postgres 的聚合资源占用，供前端状态面板使用。",
    responses={
        **COMMON_RESPONSES,
        200: {"description": "系统运行总览", "model": SystemOverviewResponse},
    },
)
async def system_overview() -> SystemOverviewResponse:
    return SystemOverviewResponse.model_validate(get_system_overview_payload())


@router.get(
    "/system/access",
    response_model=DemoAccessStatusResponse,
    summary="演示权限状态",
    description="返回当前环境是否处于只读演示模式，以及当前请求是否已解锁管理员写权限。",
    responses={
        **COMMON_RESPONSES,
        200: {"description": "演示权限状态", "model": DemoAccessStatusResponse},
    },
)
async def system_access(
    demo_admin_password: str | None = Header(default=None, alias=DEMO_ADMIN_HEADER),
) -> DemoAccessStatusResponse:
    return DemoAccessStatusResponse(
        write_protected=is_demo_write_protected(),
        admin_authorized=has_demo_admin_access(demo_admin_password),
    )
