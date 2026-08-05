# Environment Variables Reference

## API Environment Variables (`apps/api/.env` / `deploy/.env`)
- `APP_ENV`: Application environment (`development` | `production`).
- `PORT`: HTTP API port (Default: `8080`).
- `DATABASE_URL`: PostgreSQL connection string (`postgres://user:pass@host:5432/dbname?sslmode=disable`).
- `REDIS_URL`: Redis connection URL (`redis://host:6379`).
- `JWT_SECRET`: Secret key for signing authentication tokens.
- `STORAGE_PROVIDER`: File storage provider (`local`).
- `STORAGE_ROOT`: Storage root directory (`./uploads`).
- `STORAGE_BASE_URL`: Public base URL for media (`http://localhost/uploads`).
- `MAX_UPLOAD_SIZE`: Maximum upload size in bytes (`10485760` = 10MB).
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USERNAME`, `SMTP_PASSWORD`, `SMTP_FROM`: SMTP Email configuration.

## Frontend Environment Variables (`apps/frontend/.env.local`)
- `NEXT_PUBLIC_API_URL`: Base URL for API requests (`http://localhost:8080/api/v1` or `/api/v1`).
