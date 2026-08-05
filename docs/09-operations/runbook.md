# Operations Runbook

## Daily Maintenance & Health Checks
- **Health Endpoint:** `GET /api/v1/health` -> Expect HTTP 200 `{"status": "ok"}`.
- **Docker Container Inspection:** `docker compose ps` in `deploy/`.
- **Backend Logs:** `docker compose logs -f muskom-api`.
- **Database Connection Check:** `docker compose exec muskom-db pg_isready -U postgres`.

## Service Restart Procedures
- Restart API: `docker compose restart muskom-api`
- Restart Nginx Proxy: `docker compose restart muskom-nginx`
- Full Stack Restart: `docker compose down && docker compose up -d`
