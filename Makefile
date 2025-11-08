.PHONY: help setup generate-secret build up down logs clean restart test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Initial setup (copy .env and generate JWT secret)
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "✓ Created .env file"; \
	else \
		echo "✓ .env file already exists"; \
	fi
	@$(MAKE) generate-secret

generate-secret: ## Generate and set JWT_SECRET in .env
	@if [ ! -f .env ]; then \
		echo "Error: .env file not found. Run 'make setup' first."; \
		exit 1; \
	fi
	@SECRET=$$(openssl rand -base64 64 | tr -d '\n'); \
	if grep -q "^JWT_SECRET=" .env; then \
		sed -i.bak "s|^JWT_SECRET=.*|JWT_SECRET=$$SECRET|" .env && rm -f .env.bak; \
	else \
		echo "JWT_SECRET=$$SECRET" >> .env; \
	fi
	@echo "✓ JWT_SECRET generated and saved to .env"

build: ## Build Docker images
	docker-compose build

up: ## Start development environment
	docker-compose up -d
	@echo "Application running at http://localhost:3000"
	@echo "API docs at http://localhost:3000/api"

down: ## Stop all containers
	docker-compose down

logs: ## View application logs
	docker-compose logs -f app

logs-db: ## View database logs
	docker-compose logs -f postgres

restart: ## Restart application
	docker-compose restart app

clean: ## Remove all containers, volumes, and images
	docker-compose down -v
	docker system prune -f

shell: ## Open shell in application container
	docker-compose exec app sh

db-shell: ## Open PostgreSQL shell
	docker-compose exec postgres psql -U postgres -d drone_delivery

migrate: ## Run database migrations
	docker-compose exec app npx prisma migrate deploy

migrate-dev: ## Create and apply new migration
	docker-compose exec app npx prisma migrate dev

seed: ## Seed database
	docker-compose exec app npx prisma db seed

test: ## Run tests in container
	docker-compose exec app npm run test

test-e2e: ## Run E2E tests in container
	docker-compose exec app npm run test:e2e

prod-build: ## Build production images
	docker-compose -f docker-compose.prod.yml build

prod-up: ## Start production environment
	docker-compose -f docker-compose.prod.yml up -d

prod-down: ## Stop production environment
	docker-compose -f docker-compose.prod.yml down

prod-logs: ## View production logs
	docker-compose -f docker-compose.prod.yml logs -f

health: ## Check application health
	@curl -s http://localhost:3000/health | jq '.'

ps: ## Show running containers
	docker-compose ps
