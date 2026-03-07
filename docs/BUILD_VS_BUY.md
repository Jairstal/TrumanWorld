# AI Truman World MVP：Build vs Buy 分析

- 版本：`v0.1.0`
- 状态：`分析`
- 最后更新：`2026-03-07`

## 1. 结论

对于 TrumanWorld 这个 MVP，不应该采用“全部自己写”的策略。

更合理的划分是：

- **直接复用成熟包**：约 `60%`
- **参考已有项目并做改造**：约 `20%`
- **必须自研**：约 `20%`

这里最关键的判断是：

> 基础设施不要重写，智能体配置方式可以复用 `IssueLab` 的模式，真正要投入设计和实现的是 simulation core。

## 2. 分类标准

本文把待实现内容分为三类：

### 2.1 直接复用

已有成熟包或成熟框架，直接使用即可，不值得自己重写。

### 2.2 参考改造

已有项目或现成模式可以参考，但不能原样照搬，需要结合 TrumanWorld 的运行模型做适配。

### 2.3 必须自研

项目的核心业务逻辑，没有成熟方案可以直接替代，必须围绕 TrumanWorld 自己实现。

## 3. 逐项核对

## 3.1 API 层

### 内容

- HTTP API
- run 控制接口
- timeline 查询
- agent inspector
- WebSocket

### 结论

- **直接复用**

### 推荐方案

- `FastAPI`
- `Pydantic`

### 说明

你只需要写路由、schema 和业务逻辑，不要自己实现 Web 框架。

---

## 3.2 配置管理

### 内容

- 环境变量
- 应用配置
- 数据库连接配置
- Redis 配置

### 结论

- **直接复用**

### 推荐方案

- `pydantic-settings`

### 说明

这类能力已经是标准基础设施，没有必要自写配置系统。

---

## 3.3 数据库访问与 ORM

### 内容

- 模型定义
- 会话管理
- 查询封装
- 连接管理

### 结论

- **直接复用**

### 推荐方案

- `SQLAlchemy 2.0`
- `psycopg`

### 说明

TrumanWorld 需要自己定义数据模型，但 ORM 和数据库访问层不需要重写。

---

## 3.4 数据库迁移

### 内容

- schema versioning
- migration scripts

### 结论

- **直接复用**

### 推荐方案

- `Alembic`

### 说明

没有必要维护手工 SQL 迁移链。

---

## 3.5 向量检索基础设施

### 内容

- memory embedding 存储
- 相似度检索
- 向量索引

### 结论

- **直接复用**

### 推荐方案

- `pgvector`

### 说明

MVP 阶段完全没必要上独立向量数据库。  
你需要自己定义 memory schema，但不需要自己实现向量索引系统。

---

## 3.6 前端应用框架

### 内容

- 页面路由
- SSR / App Router
- 基础组件组织

### 结论

- **直接复用**

### 推荐方案

- `Next.js`
- `React`
- `TypeScript`

### 说明

不要自己拼一套前端工程框架。

---

## 3.7 样式与 UI 基础

### 内容

- 样式组织
- 基础布局
- 控制台 UI

### 结论

- **直接复用**

### 推荐方案

- `Tailwind CSS`

### 说明

MVP 没必要自建 design system。

---

## 3.8 Claude 执行接口

### 内容

- 调用 Claude Agent SDK
- Agent 执行入口
- MCP / subagents 接口接入

### 结论

- **直接复用 + 薄封装**

### 推荐方案

- `Claude Agent SDK`

### 说明

不要绕过 SDK 自己造一层 agent 执行协议。  
你要写的是 TrumanWorld 的 runtime 封装，而不是替代 SDK。

---

## 3.9 Agent 注册表与配置目录结构

### 内容

- `agents/<id>/agent.yml`
- `agents/<id>/prompt.md`
- 可选 `.mcp.json`
- 可选 `.claude/skills/`
- 可选 `.claude/agents/`

### 结论

- **参考改造**

### 推荐参考

- `gqy20/IssueLab`

### 说明

`IssueLab` 在这方面的模式非常值得复用：

- 配置资产化
- prompt 和配置分离
- 能力开关显式化
- agent 目录天然可扩展

但 TrumanWorld 不能直接照搬其 workflow 驱动逻辑，只能复用配置组织方式。

---

## 3.10 Agent runtime 分层

### 内容

- `registry`
- `config_loader`
- `prompt_loader`
- `runtime`
- `context_builder`
- `planner / reactor / reflector`

### 结论

- `registry / config_loader / prompt_loader`：**参考改造**
- `runtime`：**直接基于 SDK 做薄封装**
- `context_builder / planner / reactor / reflector`：**必须自研**

### 说明

原因是：

- 配置加载逻辑可以借鉴 `IssueLab`
- SDK 调用本身不必重发明
- 但 TrumanWorld 的上下文构造和 cognition 语义是世界仿真特有的

---

## 3.11 SimulationRunner

### 内容

- tick 推进
- 执行顺序
- run lifecycle
- pause / resume

### 结论

- **必须自研**

### 说明

这是 TrumanWorld 的核心，没有现成包能替你定义：

- 世界如何推进
- 何时调用 cognition
- 何时写 memory
- 何时更新 relationships

---

## 3.12 WorldState

### 内容

- 当前世界状态
- 地点占用
- agent 所在位置
- 当前时间
- 基础世界约束

### 结论

- **必须自研**

### 说明

这是项目的权威状态层，不可能直接买现成。

---

## 3.13 ActionResolver

### 内容

- 校验动作合法性
- 拒绝非法动作
- 降级处理模型输出

### 结论

- **必须自研**

### 说明

这是防止 agent 输出破坏世界一致性的关键层。

---

## 3.14 Memory 写入逻辑

### 内容

- recent / episodic / reflection 的写入规则
- importance 计算
- event 到 memory 的映射

### 结论

- **必须自研**

### 说明

包可以提供存储，不会提供符合你世界设定的记忆语义。

---

## 3.15 Memory retrieval 排序逻辑

### 内容

- recency
- importance
- semantic similarity
- related agent
- location

### 结论

- **必须自研**

### 说明

向量检索基础设施可以复用，但召回策略和加权逻辑必须自己定。

---

## 3.16 Relationship update

### 内容

- familiarity 更新
- trust 更新
- affinity 更新
- 派生 label

### 结论

- **必须自研**

### 说明

这是 TrumanWorld 社会模拟的核心逻辑之一。

---

## 3.17 导演层控制逻辑

### 内容

- start / pause / resume
- inject_event
- inspect

### 结论

- API 框架：**直接复用**
- 导演动作语义：**必须自研**

### 说明

“按钮”和接口很常规，但“导演可以注入什么事件、如何进入世界调度”是你的业务定义。

---

## 3.18 Timeline / Agent Inspector

### 内容

- timeline 列表
- 单 agent 当前状态
- 最近事件
- 关联记忆

### 结论

- 前端框架：**直接复用**
- 查询模型和展示逻辑：**参考改造 + 自研**

### 说明

前端工程本身有成熟框架，但你的 domain 展示逻辑还是业务代码。

---

## 4. 不能直接照搬的项目部分

即使 `IssueLab` 值得参考，以下部分也不能直接拿来用：

- GitHub Actions orchestration
- `workflow_dispatch`
- Issue 触发链路
- 单轮任务型上下文
- GitHub App token 分发机制

原因：

- `IssueLab` 是事件触发系统
- TrumanWorld 是持续仿真系统

这两种系统的调度模型完全不同。

## 5. 推荐的实现策略

## 5.1 直接复用

这些应立即采用现成方案：

- FastAPI
- Pydantic
- SQLAlchemy
- Alembic
- pgvector
- Next.js
- Tailwind
- Claude Agent SDK

## 5.2 参考改造

这些应参考 `IssueLab` 的模式：

- agent 目录结构
- `agent.yml`
- `prompt.md`
- 能力开关
- runtime 边界

## 5.3 必须自研

这些应集中投入开发时间：

- `SimulationRunner`
- `WorldState`
- `ActionResolver`
- `ContextBuilder`
- `MemoryWriter / MemoryRetriever`
- `RelationshipUpdater`
- 导演事件注入语义

## 6. 时间投入建议

如果按开发时间分配，我建议：

- 基础设施接入：`20%`
- agent registry / runtime 适配：`20%`
- simulation core：`40%`
- memory / relationship / director 逻辑：`20%`

也就是说，最值得投入精力的地方不是“框架怎么选”，而是：

- 世界怎么推进
- agent 怎么受控调用
- 记忆怎么闭环
- 关系怎么演化

## 7. 最终判断

TrumanWorld 不需要从零发明所有部件。

更好的策略是：

- **基础设施全复用**
- **智能体配置方式参考 `IssueLab`**
- **把主要精力投入 simulation core 和状态语义**

如果这么做，项目会明显更容易落地，也更符合 MVP 的目标。
