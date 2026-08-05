# Docker & Infrastructure Guidelines

## Container Rules
1. **Multi-Stage Builds:** Go backend API built using lightweight Alpine binary image. Next.js frontend built using standalone output.
2. **No Localhost Bindings:** Internal container communication must use service names (`muskom-db`, `muskom-redis`, `muskom-api`).
3. **Environment Security:** Secrets and database passwords injected via `deploy/.env` (never hardcoded in Dockerfile or compose files).
4. **Volume Mounts:** Mount host volumes for PostgreSQL data (`deploy/api/data`), Redis data, and local storage uploads.
