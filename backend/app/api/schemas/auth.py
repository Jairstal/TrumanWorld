from pydantic import BaseModel, Field


class DemoAccessStatusResponse(BaseModel):
    write_protected: bool = Field(..., description="当前环境是否启用写操作保护")
    admin_authorized: bool = Field(..., description="当前请求是否具备管理员写权限")
