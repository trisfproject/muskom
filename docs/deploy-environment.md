# Deployment Configuration and Environment Audit

This document serves as the single source of truth for the environment configuration across the MUSKOM project. It explains how variables are managed, where they are consumed, and how the deployment flow functions.

## 1. Project Directory Layout

The environment variable configuration is centralized within the `deploy` directory to avoid ambiguity during local and production deployments. 

```
/
├── apps/                 # Source Code
│   ├── api/
│   └── frontend/
├── deploy/               # Deployment Context (Single Source of Truth)
│   ├── docker-compose.yml 
│   ├── .env              # ONLY place where .env should live
│   └── .env.example      # Reference configuration template
└── Makefile              # Orchestrates deployment using deploy/ config
```

> **IMPORTANT**: We explicitly removed `.env.example` files from the root `/` and `/apps/api` folders to prevent duplicate configurations. The `deploy/.env` file is all you need for Docker Compose.

## 2. Recommended `.env` Locations & Configuration Flow

**Configuration Flow:**
1. A developer executes `make up` in the root directory.
2. The Makefile executes `docker compose -f deploy/docker-compose.yml ... up -d`.
3. Inside `deploy/docker-compose.yml`, the services are mapped to use `env_file: .env`.
4. Because the compose file context is inside `deploy/`, Docker automatically looks for `deploy/.env`.
5. Environment variables are injected into the respective containers (DB, API, Frontend) at runtime.

**Recommended Location**:
Always configure your environment variables in `deploy/.env`. Do not scatter `.env` files in other directories.

## 3. Variable Ownership & Tracking

We have audited the exact variables consumed by the application source code. Any variable not listed here is obsolete and has been removed.

### A. Docker / Database 
Consumed inherently by the `postgres` image:
| Variable | Required | Default | Consumed By |
| --- | --- | --- | --- |
| `POSTGRES_USER` | Yes | `muskom` | Postgres Initialization |
| `POSTGRES_PASSWORD` | Yes | `muskom_password` | Postgres Initialization |
| `POSTGRES_DB` | Yes | `muskom` | Postgres Initialization |

### B. Backend (API)
Consumed internally by `apps/api/platform/config/config.go`:
| Variable | Required | Default | Consumed By |
| --- | --- | --- | --- |
| `APP_ENV` | No | `development` | Logging / General |
| `PORT` | No | `8080` | Server Setup |
| `DATABASE_URL` | **Yes** | - | Postgres Connection |
| `REDIS_URL` | **Yes** | - | Cache / Session |
| `JWT_SECRET` | **Yes** | - | Authentication |
| `JWT_REFRESH_SECRET` | **Yes** | - | Authentication |
| `JWT_REFRESH_TTL` | No | `168h` | Authentication |
| `STORAGE_PROVIDER` | No | `local` | File Uploads |
| `STORAGE_ROOT` | No | `./uploads` | File Uploads |
| `STORAGE_BASE_URL` | No | `http://localhost:8080/uploads` | File Uploads |
| `MAX_UPLOAD_SIZE` | No | `5242880` (5MB) | API Limits |

### C. Frontend
Consumed inside `apps/frontend/` via `process.env`:
| Variable | Required | Default | Consumed By |
| --- | --- | --- | --- |
| `INTERNAL_API_URL` | No | `http://api:8080/api/v1` | SSR / Next.js Server |
| `NEXT_PUBLIC_API_URL` | No | `/api/v1` | Client Components |
| `NEXT_PUBLIC_FEATURE_ATTENDANCE` | No | `true` | Feature Flags |
| `NEXT_PUBLIC_FEATURE_VOTING` | No | `true` | Feature Flags |
| `NEXT_PUBLIC_FEATURE_REALTIME` | No | `true` | Feature Flags |
| `NEXT_PUBLIC_FEATURE_NOTIFICATIONS`| No | `false` | Feature Flags |
| `NEXT_PUBLIC_FEATURE_REPORTING` | No | `false` | Feature Flags |

*Note: For the Frontend, Next.js typically requires `NEXT_PUBLIC_` variables to be present during build time. However, our setup relies on strict code-level fallbacks allowing the image to build successfully without them.*
