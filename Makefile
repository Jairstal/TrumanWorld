PYTHON ?= python3
BACKEND_DIR := backend
FRONTEND_DIR := frontend

.PHONY: install backend-install frontend-install backend-dev frontend-dev lint format test migrate pre-commit dev db-start db-stop db-status db-wait db-migrate db-clean check-ports kill-ports sync-agent-logos

# 同步 agent logo 到前端 public 目录
sync-agent-logos:
	@echo "🔄 同步 agent logos..."
	@mkdir -p $(FRONTEND_DIR)/public/agents
	@for dir in agents/*/; do \
		agent_id=$$(basename "$$dir"); \
		if [ -f "$$dir/logo.svg" ]; then \
			cp "$$dir/logo.svg" "$(FRONTEND_DIR)/public/agents/$$agent_id.svg"; \
			echo "  ✓ $$agent_id"; \
		fi; \
	done
	@echo "✅ Agent logos 同步完成"

install: backend-install frontend-install sync-agent-logos

backend-install:
	cd $(BACKEND_DIR) && uv sync --extra dev

frontend-install:
	cd $(FRONTEND_DIR) && npm install

backend-dev:
	cd $(BACKEND_DIR) && uv run uvicorn app.main:app --reload --host 127.0.0.1 --port $(BACKEND_PORT)

frontend-dev: sync-agent-logos
	cd $(FRONTEND_DIR) && npm run dev -- --port $(FRONTEND_PORT)

lint:
	cd $(BACKEND_DIR) && uv run ruff check app tests

format:
	cd $(BACKEND_DIR) && uv run ruff format app tests

test:
	cd $(BACKEND_DIR) && uv run pytest

migrate:
	cd $(BACKEND_DIR) && uv run alembic upgrade head

pre-commit:
	$(PYTHON) -m pre_commit run --all-files

# 数据库配置（测试环境）
DB_CONTAINER_NAME := trumanworld-db-test
DB_PORT := 5432
DB_USER := truman
DB_PASSWORD := truman123
DB_NAME := trumanworld

# 应用端口配置
BACKEND_PORT := 18080
FRONTEND_PORT := 13000

# 检查端口是否被占用（支持 IPv4 和 IPv6）
check-ports:
	@echo "🔍 检查端口占用情况..."
	@BACKEND_PIDS=$$(ss -tlnp 2>/dev/null | grep -E ":$(BACKEND_PORT)" | grep -oP 'pid=\K[0-9]+' | sort -u); \
	FRONTEND_PIDS=$$(ss -tlnp 2>/dev/null | grep -E ":$(FRONTEND_PORT)" | grep -oP 'pid=\K[0-9]+' | sort -u); \
	if [ -n "$$BACKEND_PIDS" ] || [ -n "$$FRONTEND_PIDS" ]; then \
		echo "⚠️  检测到端口被占用:"; \
		if [ -n "$$BACKEND_PIDS" ]; then \
			echo "  - 端口 $(BACKEND_PORT) (后端) 被 PID $$BACKEND_PIDS 占用"; \
		fi; \
		if [ -n "$$FRONTEND_PIDS" ]; then \
			echo "  - 端口 $(FRONTEND_PORT) (前端) 被 PID $$FRONTEND_PIDS 占用"; \
		fi; \
		echo ""; \
		echo "运行 'make kill-ports' 终止占用进程，或手动关闭后重试"; \
		exit 1; \
	else \
		echo "✅ 端口 $(BACKEND_PORT) 和 $(FRONTEND_PORT) 可用"; \
	fi

# 终止占用端口的进程（支持 IPv4 和 IPv6）
kill-ports:
	@echo "🛑 终止占用端口的进程..."
	@BACKEND_PIDS=$$(ss -tlnp 2>/dev/null | grep -E ":$(BACKEND_PORT)" | grep -oP 'pid=\K[0-9]+' | sort -u); \
	if [ -n "$$BACKEND_PIDS" ]; then \
		for PID in $$BACKEND_PIDS; do \
			echo "终止后端端口占用 (PID: $$PID)"; \
			kill -9 $$PID 2>/dev/null || true; \
		done; \
	fi; \
	FRONTEND_PIDS=$$(ss -tlnp 2>/dev/null | grep -E ":$(FRONTEND_PORT)" | grep -oP 'pid=\K[0-9]+' | sort -u); \
	if [ -n "$$FRONTEND_PIDS" ]; then \
		for PID in $$FRONTEND_PIDS; do \
			echo "终止前端端口占用 (PID: $$PID)"; \
			kill -9 $$PID 2>/dev/null || true; \
		done; \
	fi; \
	sleep 2; \
	echo "✅ 端口已释放"

# 启动测试数据库（如果不存在则创建）
db-start:
	@echo "🐘 启动 PostgreSQL 测试数据库..."
	@if [ "$$(docker ps -q -f name=$(DB_CONTAINER_NAME))" ]; then \
		echo "数据库容器已在运行"; \
	elif [ "$$(docker ps -aq -f status=exited -f name=$(DB_CONTAINER_NAME))" ]; then \
		echo "启动已存在的数据库容器..."; \
		docker start $(DB_CONTAINER_NAME); \
	else \
		echo "创建新的数据库容器..."; \
		docker run -d \
			--name $(DB_CONTAINER_NAME) \
			-e POSTGRES_USER=$(DB_USER) \
			-e POSTGRES_PASSWORD=$(DB_PASSWORD) \
			-e POSTGRES_DB=$(DB_NAME) \
			-p $(DB_PORT):5432 \
			postgres:16; \
		echo "等待数据库启动..."; \
		sleep 3; \
	fi
	@echo "数据库连接信息: postgresql://$(DB_USER):$(DB_PASSWORD)@127.0.0.1:$(DB_PORT)/$(DB_NAME)"

# 停止测试数据库
db-stop:
	@echo "🛑 停止 PostgreSQL 测试数据库..."
	@docker stop $(DB_CONTAINER_NAME) 2>/dev/null || echo "数据库容器未运行"

# 查看数据库状态
db-status:
	@if [ "$$(docker ps -q -f name=$(DB_CONTAINER_NAME))" ]; then \
		echo "✅ 数据库容器正在运行"; \
		docker ps -f name=$(DB_CONTAINER_NAME); \
	elif [ "$$(docker ps -aq -f status=exited -f name=$(DB_CONTAINER_NAME))" ]; then \
		echo "⏸️ 数据库容器已停止"; \
	else \
		echo "❌ 数据库容器不存在，运行 'make db-start' 创建"; \
	fi

# 删除测试数据库（清理）
db-clean:
	@echo "🗑️ 删除 PostgreSQL 测试数据库..."
	@docker rm -f $(DB_CONTAINER_NAME) 2>/dev/null || echo "数据库容器不存在"

# 等待数据库就绪
db-wait:
	@echo "⏳ 等待数据库就绪..."
	@for i in 1 2 3 4 5; do \
		if docker exec $(DB_CONTAINER_NAME) pg_isready -U $(DB_USER) -d $(DB_NAME) >/dev/null 2>&1; then \
			echo "✅ 数据库已就绪"; \
			exit 0; \
		fi; \
		echo "  等待中... ($$i/5)"; \
		sleep 2; \
	done; \
	echo "❌ 数据库启动超时"; \
	exit 1

# 执行数据库迁移
db-migrate: db-wait
	@echo "🔄 执行数据库迁移..."
	@cd $(BACKEND_DIR) && uv run alembic upgrade head

# 一行命令同时启动前后端（测试环境，非 Docker）
# 使用非常用端口避免冲突：后端 18080，前端 13000
dev: check-ports db-start db-migrate sync-agent-logos
	@echo ""
	@echo "🚀 启动 Truman World 开发环境..."
	@echo "================================"
	@echo "数据库: postgresql://$(DB_USER):$(DB_PASSWORD)@127.0.0.1:$(DB_PORT)/$(DB_NAME)"
	@echo "后端:   http://127.0.0.1:$(BACKEND_PORT)"
	@echo "前端:   http://127.0.0.1:$(FRONTEND_PORT)"
	@echo "================================"
	@echo "按 Ctrl+C 停止前后端（数据库会继续运行）"
	@echo ""
	@(trap 'kill %1 %2 2>/dev/null' INT; \
		(cd $(BACKEND_DIR) && uv run uvicorn app.main:app --host 127.0.0.1 --port $(BACKEND_PORT)) & \
		(cd $(FRONTEND_DIR) && npm run dev -- --port $(FRONTEND_PORT)) & \
		wait)
