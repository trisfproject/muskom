# ADR-006: Multi-Container Docker Deployment Architecture

- **Status:** Accepted
- **Date:** August 5, 2026

## Context
Deploying MUSKOM requires high reliability, secure media handling, isolated caching, and non-blocking API routing.

## Decision
1. Topology composed of 5 containers: `muskom-db` (PostgreSQL 16), `muskom-redis` (Redis 7), `muskom-api` (Go Fiber), `muskom-frontend` (Next.js standalone), and `muskom-nginx` (Nginx reverse proxy).
2. Nginx terminates HTTP on port 80, proxying `/api/v1` to the Go Fiber API and all other requests to Next.js. Nginx directly serves local media uploads (`/uploads`) from shared volumes.

## Consequences
- Clean production deployment via `docker compose up -d`.
- API process relieved from serving heavy static media assets.
