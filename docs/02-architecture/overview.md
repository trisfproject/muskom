# Architectural Overview

## System Architecture Diagram
```
[ Client Browsers / Mobile ]
           │
           ▼
   [ Nginx Reverse Proxy ] (SSL Termination, Static Media Routing)
     ├── / -> [ Next.js Frontend ] (Port 3000)
     └── /api/v1 -> [ Go Fiber Backend API ] (Port 8080)
                         │
                         ├── PostgreSQL Database (Port 5432)
                         ├── Redis Cache & Session Store (Port 6379)
                         └── Local Storage / Uploads Volume
```

## Layering & Principles
- **Monorepo Structure:** `apps/api` (Go Fiber), `apps/frontend` (Next.js 16 App Router), `database/` (PostgreSQL Migrations).
- **Domain-Driven Design (DDD):** Modular backend architecture divided into single-responsibility domains under `apps/api/internal/modules/`.
- **Single Source of Truth (SSOT):** Strict domain boundaries preventing entity duplication.
