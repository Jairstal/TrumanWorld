# AI Truman World MVP 任务拆解

- 版本：`v0.1.0`
- 状态：`执行拆解`
- 最后更新：`2026-03-07`

## 1. 目标

这份文档的目标不是重复 PRD，而是把 MVP 直接拆成可执行任务。

每项任务分为四类：

- `直接装包`
- `需要搭骨架`
- `必须写业务逻辑`
- `可以延后`

## 2. 总体优先级

MVP 推荐顺序：

1. 后端基础设施可运行
2. 数据模型和 run 生命周期
3. simulation core
4. agent registry 与 Claude runtime
5. memory / relationship 闭环
6. director API
7. 前端控制台

## 3. 后端基础设施

## 3.1 Python 项目管理

### 任务

- 配置 `pyproject.toml`
- 配置开发依赖
- 确定启动命令

### 分类

- `直接装包`
- `需要搭骨架`

### 当前状态

- 已有基础骨架

### 后续动作

- 补 dev scripts
- 补 lint/test 命令

---

## 3.2 FastAPI 应用入口

### 任务

- app factory
- API router
- health check

### 分类

- `需要搭骨架`

### 当前状态

- 已完成基础版本

### 后续动作

- 接入依赖注入
- 加统一错误处理

---

## 3.3 配置系统

### 任务

- settings
- env 管理
- 不同环境配置

### 分类

- `直接装包`
- `需要搭骨架`

### 推荐

- `pydantic-settings`

### 当前状态

- 已有基础版本

### 后续动作

- 增加 Anthropic key、database、redis 等配置项

## 4. 数据层

## 4.1 SQLAlchemy 模型

### 任务

- `simulation_runs`
- `agents`
- `locations`
- `events`
- `relationships`
- `memories`

### 分类

- `需要搭骨架`
- `必须写业务逻辑`

### 当前状态

- 已有最小模型草稿

### 后续动作

- 补字段
- 补索引
- 补外键约束

---

## 4.2 Alembic 迁移

### 任务

- 初始化 Alembic
- 生成首个 migration

### 分类

- `直接装包`
- `需要搭骨架`

### 当前状态

- 未开始

---

## 4.3 Repository / Query 层

### 任务

- run 查询
- event 查询
- agent 查询
- memory 查询

### 分类

- `需要搭骨架`
- `必须写业务逻辑`

### 当前状态

- 仅有空文件

## 5. Simulation Core

## 5.1 Run 生命周期

### 任务

- create run
- start
- pause
- resume
- 获取状态

### 分类

- `必须写业务逻辑`

### 当前状态

- API 有占位接口
- 无真实实现

---

## 5.2 SimulationRunner

### 任务

- tick 推进
- agent 遍历
- 执行顺序
- 异常处理

### 分类

- `必须写业务逻辑`

### 当前状态

- 只有类占位

### 优先级

- 最高

---

## 5.3 WorldState

### 任务

- 当前世界时间
- 地点占用
- agent 当前地点
- 当前状态装载

### 分类

- `必须写业务逻辑`

### 当前状态

- 只有类占位

---

## 5.4 ActionResolver

### 任务

- 校验动作是否合法
- move/talk/work/rest 约束
- 非法动作降级

### 分类

- `必须写业务逻辑`

### 当前状态

- 只有类占位

### 优先级

- 最高

## 6. Agent 层

## 6.1 Agent Registry

### 任务

- 扫描 `agents/*/agent.yml`
- 建立 agent 注册表

### 分类

- `参考改造`
- `需要搭骨架`

### 推荐参考

- `IssueLab`

### 当前状态

- 仅有类占位

---

## 6.2 Config Loader

### 任务

- 解析 `agent.yml`
- 加载人格、职业、能力开关

### 分类

- `参考改造`
- `必须写业务逻辑`

### 当前状态

- 仅有类占位

---

## 6.3 Prompt Loader

### 任务

- 加载 `prompt.md`
- 注入世界上下文
- 注入记忆上下文

### 分类

- `参考改造`
- `必须写业务逻辑`

### 当前状态

- 仅有类占位

---

## 6.4 Claude Runtime

### 任务

- 封装 Claude Agent SDK
- 提供统一调用入口

### 分类

- `直接装包`
- `需要搭骨架`

### 当前状态

- 仅有类占位

---

## 6.5 Planner / Reactor / Reflector

### 任务

- 早晨计划
- 特殊事件反应
- 晚间反思

### 分类

- `必须写业务逻辑`

### 当前状态

- 仅有类占位

## 7. Memory 与 Relationship

## 7.1 MemoryWriter

### 任务

- 事件写 recent
- 事件写 episodic
- 日终写 reflection

### 分类

- `必须写业务逻辑`

### 当前状态

- 未开始

---

## 7.2 MemoryRetriever

### 任务

- recency 检索
- importance 排序
- similarity 检索

### 分类

- `必须写业务逻辑`

### 当前状态

- 未开始

---

## 7.3 RelationshipUpdater

### 任务

- familiarity 更新
- trust 更新
- affinity 更新

### 分类

- `必须写业务逻辑`

### 当前状态

- 未开始

## 8. Director 层

## 8.1 Director API

### 任务

- inject_event
- inspect run
- inspect agent

### 分类

- `需要搭骨架`
- `必须写业务逻辑`

### 当前状态

- 接口占位已存在

---

## 8.2 导演事件注入语义

### 任务

- 定义允许注入的事件
- 进入世界调度
- 保证不破坏一致性

### 分类

- `必须写业务逻辑`

### 当前状态

- 未开始

## 9. 前端

## 9.1 Next.js 项目骨架

### 任务

- 基础项目配置
- 根布局
- 首页

### 分类

- `直接装包`
- `需要搭骨架`

### 当前状态

- 已完成基础版本

---

## 9.2 Run 概览页

### 任务

- run 状态展示
- start/pause/resume 控制

### 分类

- `需要搭骨架`
- `必须写业务逻辑`

### 当前状态

- 未开始

---

## 9.3 Timeline 页

### 任务

- event 列表
- director event 展示

### 分类

- `需要搭骨架`
- `必须写业务逻辑`

### 当前状态

- 未开始

---

## 9.4 Agent 详情页

### 任务

- 当前状态
- recent events
- memories
- relationships

### 分类

- `需要搭骨架`
- `必须写业务逻辑`

### 当前状态

- 未开始

## 10. 测试

## 10.1 后端测试

### 任务

- run lifecycle
- action resolver
- registry / config loader
- API smoke tests

### 分类

- `必须写业务逻辑`

### 当前状态

- 未开始

---

## 10.2 前端测试

### 任务

- 核心页面 smoke tests

### 分类

- `可以延后`

### 当前状态

- 未开始

## 11. 建议立即开工的任务

建议马上做的 6 件事：

1. 完善 SQLAlchemy 模型
2. 初始化 Alembic
3. 实现真实的 run lifecycle
4. 实现 `SimulationRunner`
5. 实现 `AgentRegistry / ConfigLoader / PromptLoader`
6. 实现 `ActionResolver`

## 12. 建议延后的任务

以下内容建议不要抢在主路径前做：

- 复杂前端视觉打磨
- 关系图可视化
- replay 动画
- MCP / subagents 的深度能力
- 复杂 memory ranking 优化

## 13. 最终判断

TrumanWorld 的真正主路径非常清楚：

- 先让 world 跑起来
- 再让 Claude agent 被受控调用
- 再让 memory 和 relationship 闭环
- 最后让导演层可见可控

如果偏离这个顺序，项目很容易提前陷入“架构很完整，但系统还跑不起来”的状态。
