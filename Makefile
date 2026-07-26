.PHONY: help up down restart logs ps shell-api shell-db

# Target the base config and the dev override
COMPOSE := docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.override.yml

help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start all services in the background
	$(COMPOSE) up -d

down: ## Stop and remove all services
	$(COMPOSE) down -v

restart: ## Restart all services
	$(COMPOSE) restart

logs: ## Tail logs for all services
	$(COMPOSE) logs -f

ps: ## List running services
	$(COMPOSE) ps

shell-api: ## Access the API container shell
	$(COMPOSE) exec api sh

shell-db: ## Access the Database container shell
	$(COMPOSE) exec postgres sh -c 'psql -U $$POSTGRES_USER -d $$POSTGRES_DB'
