# Deployment Architecture

## Container Topology (`deploy/docker-compose.yml`)
- `muskom-db`: PostgreSQL 16 container with persistent data volume.
- `muskom-redis`: Redis Alpine container for session caching and rate-limiting.
- `muskom-api`: Go Fiber API service running on port 8080.
- `muskom-frontend`: Next.js production build running on port 3000.
- `muskom-nginx`: Nginx reverse proxy serving port 80/443, routing `/api/v1` to API and `/` to Next.js, and serving local static media uploads.

## Environment Files
- Development / Deployment configuration stored in `deploy/.env`.
- Template defined in `deploy/.env.example`.
