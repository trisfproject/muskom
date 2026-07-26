.PHONY: help up down restart logs clean

help: ## Show this help
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

up: ## Start all services in the background
	docker compose -f deploy/docker-compose.yml up -d

down: ## Stop all services
	docker compose -f deploy/docker-compose.yml down

restart: ## Restart all services
	docker compose -f deploy/docker-compose.yml restart

logs: ## Tail logs for all services
	docker compose -f deploy/docker-compose.yml logs -f

clean: ## Remove stopped containers and unused images/volumes
	docker compose -f deploy/docker-compose.yml down -v
	docker system prune -f
