# ============================================
# school-api-serverless · Makefile
# ============================================

API_PID_FILE := .api.pid
API_LOG_FILE := .api.log

.PHONY: install dev stop restart status logs logs-tail build deploy \
        invoke-create invoke-get invoke-search invoke-login postman help

# ── Setup ───────────────────────────────────

install:
	@npm install

# ── Local Development ───────────────────────

dev:
	@if [ -f $(API_PID_FILE) ] && kill -0 $$(cat $(API_PID_FILE)) 2>/dev/null; then \
		echo "API already running (PID $$(cat $(API_PID_FILE))). Use: make restart"; \
	else \
		echo "Starting local API on http://localhost:3000 (background) ..."; \
		nohup sam local start-api --warm-containers eager --parameter-overrides \
			DbHost=host.docker.internal \
			DbPort=3306 \
			DbName=school_db \
			DbUser=school_user \
			DbPassword=school_pass \
			JwtSecret=dev-secret-change-in-production \
			> $(API_LOG_FILE) 2>&1 & \
		echo $$! > $(API_PID_FILE); \
		sleep 2; \
		if kill -0 $$(cat $(API_PID_FILE)) 2>/dev/null; then \
			echo "API running in background (PID $$(cat $(API_PID_FILE)))"; \
			echo "  Logs:    make logs"; \
			echo "  Stop:    make stop"; \
		else \
			echo "Failed to start. Check: make logs"; \
			rm -f $(API_PID_FILE); \
		fi; \
	fi

stop:
	@if [ -f $(API_PID_FILE) ]; then \
		PID=$$(cat $(API_PID_FILE)); \
		if kill -0 $$PID 2>/dev/null; then \
			kill $$PID 2>/dev/null; \
			echo "API stopped (PID $$PID)"; \
		else \
			echo "Process $$PID already dead, cleaning up"; \
		fi; \
		rm -f $(API_PID_FILE); \
	else \
		echo "No API running (no pid file)"; \
	fi

restart: stop
	@sleep 1
	@$(MAKE) dev

status:
	@if [ -f $(API_PID_FILE) ] && kill -0 $$(cat $(API_PID_FILE)) 2>/dev/null; then \
		echo "API is running (PID $$(cat $(API_PID_FILE)))"; \
	else \
		echo "API is not running"; \
		rm -f $(API_PID_FILE) 2>/dev/null; \
	fi

# ── Logs ────────────────────────────────────

logs:
	@if [ -f $(API_LOG_FILE) ]; then \
		tail -50 $(API_LOG_FILE); \
	else \
		echo "No log file. Start the API first: make dev"; \
	fi

logs-tail:
	@if [ -f $(API_LOG_FILE) ]; then \
		tail -f $(API_LOG_FILE); \
	else \
		echo "No log file. Start the API first: make dev"; \
	fi

logs-aws:
	@sam logs --stack-name school-api-serverless --tail

# ── Build & Deploy ──────────────────────────

build:
	@sam build

deploy:
	@sam build
	@sam deploy --no-confirm-changeset

# ── Test locally with events ────────────────

invoke-create:
	@sam local invoke CreateStudentFunction --event events/create-student.json \
		--parameter-overrides DbHost=host.docker.internal

invoke-get:
	@sam local invoke GetStudentFunction --event events/get-student.json \
		--parameter-overrides DbHost=host.docker.internal

invoke-search:
	@sam local invoke SearchStudentsFunction --event events/search-students.json \
		--parameter-overrides DbHost=host.docker.internal

invoke-login:
	@sam local invoke LoginFunction --event events/login.json \
		--parameter-overrides DbHost=host.docker.internal

# ── Postman ─────────────────────────────────

postman:
	@node scripts/generate-postman.js

# ── Help ────────────────────────────────────

help:
	@echo ""
	@echo "school-api-serverless commands:"
	@echo ""
	@echo "  make dev            Start API in background (no terminal lock)"
	@echo "  make stop           Stop the background API"
	@echo "  make restart        Stop + start"
	@echo "  make status         Check if API is running"
	@echo ""
	@echo "  make logs           Last 50 lines of API output"
	@echo "  make logs-tail      Follow logs in real-time (Ctrl+C to exit)"
	@echo "  make logs-aws       Tail CloudWatch logs (deployed)"
	@echo ""
	@echo "  make install        Install dependencies"
	@echo "  make build          Build SAM project"
	@echo "  make deploy         Build and deploy to AWS"
	@echo ""
	@echo "  make invoke-login   Test login locally"
	@echo "  make invoke-create  Test create-student locally"
	@echo "  make invoke-get     Test get-student locally"
	@echo "  make invoke-search  Test search-students locally"
	@echo "  make postman        Regenerate Postman collection"
	@echo ""
