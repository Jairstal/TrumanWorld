# AI Truman World MVP 代码量与实现规模预估

- 版本：`v0.1.0`
- 状态：`估算`
- 最后更新：`2026-03-07`

## 1. 结论

基于当前已经收缩过的 MVP 方案，整体实现规模大致如下：

- 后端：`4k - 7k` 行
- 前端：`1.5k - 3k` 行
- 配置与文档：`500 - 1.5k` 行

合计：

- **不含测试：`6k - 11k` 行**
- **含基础测试：`8k - 14k` 行**

这是一个中小型 MVP 的量级，不算很大，但也绝不是“几百行脚本”能完成的项目。

## 2. 估算前提

这个估算基于以下前提：

- 后端使用 `Python + FastAPI`
- 前端使用 `TypeScript + Next.js`
- 智能体认知使用 `Claude Agent SDK`
- 数据库使用 `Postgres + pgvector`
- 只实现精简版 MVP
- 不包含复杂地图动画
- 不包含完整 replay 动画系统
- 不包含复杂经济/政治/组织系统

## 3. 后端代码量预估

后端预计总量：

- **`4k - 7k` 行**

### 3.1 api

预计：

- `600 - 1200` 行

包括：

- run 控制接口
- director event injection 接口
- timeline 查询接口
- agent 详情接口
- schema / DTO
- 基础错误处理

### 3.2 sim

预计：

- `1200 - 2200` 行

包括：

- `SimulationRunner`
- `RunManager`
- `WorldState`
- `ActionResolver`
- tick 推进逻辑
- routine 行为执行
- relationship 派生更新

这是后端最容易膨胀的部分之一。

### 3.3 agent

预计：

- `1200 - 2200` 行

包括：

- `registry.py`
- `config_loader.py`
- `prompt_loader.py`
- `runtime.py`
- `context_builder.py`
- `planner.py`
- `reactor.py`
- `reflector.py`

这里的主要复杂度不在 Claude SDK 调用本身，而在：

- 配置加载
- prompt/context 组装
- 模型输出解析
- 与仿真状态对接

### 3.4 store

预计：

- `800 - 1600` 行

包括：

- SQLAlchemy models
- db session
- repository / query 层
- event persistence
- memory retrieval
- run state persistence

### 3.5 infra / 启动层

预计：

- `200 - 600` 行

包括：

- settings
- logging
- app startup
- 数据库初始化
- 环境变量管理

## 4. 前端代码量预估

前端预计总量：

- **`1.5k - 3k` 行**

这是基于“只做 3 个核心页面”的前提。

### 4.1 页面

预计：

- `600 - 1200` 行

包括：

- run 概览页
- timeline 页
- agent 详情页

### 4.2 组件

预计：

- `500 - 1000` 行

包括：

- 事件列表
- agent 卡片
- 状态面板
- run 控制按钮
- 注入事件表单

### 4.3 数据访问与状态管理

预计：

- `300 - 800` 行

包括：

- API client
- hooks
- loading / error state
- 基础数据转换

## 5. 配置与文档规模预估

预计：

- **`500 - 1500` 行**

包括：

- `pyproject.toml`
- `package.json`
- `.env.example`
- `docker-compose.yml`
- alembic 初始迁移
- agent 模板
- README
- docs

## 6. 测试代码量预估

如果做基础测试，建议预留：

- **`1.5k - 3k` 行**

### 测试重点

- sim 流程测试
- action resolver 测试
- API 测试
- agent config loader / registry 测试
- memory / event 写入测试

### 如果不做测试的风险

- 仿真逻辑容易悄悄回归
- action legality 更难验证
- 配置驱动的 agent 容易出现加载错误
- 后续迭代时维护成本会明显上升

## 7. 更细的目录级估算

如果按推荐目录拆分，规模大致如下：

```text
backend/
  app/
    api/        600 - 1200
    sim/        1200 - 2200
    agent/      1200 - 2200
    store/      800 - 1600
    infra/      200 - 600

frontend/
  app/          400 - 900
  components/   700 - 1300
  lib/          300 - 800

agents/
  _template/    100 - 250
  examples/     200 - 600
```

## 8. 最容易失控的部分

从经验看，这几个模块最容易超出预估：

### 8.1 SimulationRunner

原因：

- tick 调度
- 世界状态推进
- 异常恢复
- agent 执行顺序

### 8.2 context_builder

原因：

- 要拼接 world context
- 要拼接 memory retrieval
- 要处理不同 agent 的差异

### 8.3 action resolver

原因：

- 所有模型输出都必须被约束
- 非法动作要降级处理
- 需要兼容导演层注入事件

### 8.4 memories

原因：

- recent / episodic / reflection 的边界容易膨胀
- retrieval 逻辑很容易写复杂

## 9. 可进一步压缩到什么程度

如果目标是“尽快做出最小可运行版本”，还可以继续压缩。

### 方案 A：当前精简 MVP

- 不含测试：`6k - 11k`
- 含测试：`8k - 14k`

### 方案 B：超轻量 MVP

条件：

- 不做前端，只做 API
- 不做 MCP / skills / subagents
- 不做 reflection，只做 recent + episodic
- 不做导演注入事件，只做 start/pause/resume

则总量可压到：

- **`4k - 7k` 行**

### 方案 C：研究原型版

条件：

- 单进程
- 无前端
- 文件存储或极简数据库
- 无 pause/resume

则总量可压到：

- **`2k - 4k` 行**

但这会明显偏离你当前要做的“可持续运行、可观察、可导演干预”的产品方向。

## 10. 按阶段的实现规模

### 阶段 1：后端骨架

预计：

- `1.5k - 2.5k` 行

包括：

- db model
- FastAPI
- run lifecycle
- SimulationRunner 骨架

### 阶段 2：智能体认知接入

预计：

- `1k - 2k` 行

包括：

- agent registry
- config loader
- Claude runtime
- planner / reactor / reflector

### 阶段 3：记忆与关系闭环

预计：

- `800 - 1500` 行

包括：

- event -> memory 写入
- retrieval
- relationship update

### 阶段 4：导演层和前端

预计：

- `1.5k - 3k` 行

包括：

- 页面
- timeline
- agent inspector
- event injection

## 11. 人天预估

如果由一个熟悉 Python、FastAPI、React、LLM agent 的开发者完成，大致可估为：

- 最小可运行骨架：`5 - 8` 天
- 可用 MVP：`12 - 20` 天
- 带基础测试和打磨：`20 - 30` 天

如果是边探索边调整 agent 设计，周期大概率会继续上浮。

## 12. 最终判断

当前这个项目的 MVP 规模大约就是一个：

- 后端中等复杂度项目
- 前端轻中等复杂度控制台
- 配置驱动的 agent runtime

从代码量上看，它适合按阶段推进，而不适合一口气完整实现。

最稳的路径仍然是：

1. 先做后端主干
2. 再接 Claude Agent SDK
3. 再做记忆和关系闭环
4. 最后补导演层前端
