---
Title: ADR 0004 One Public Endpoint
Purpose: Documentation regarding adr 0004 one public endpoint
Owner: Engineering Team
Last Updated: 2026-08-01
Related Documents: .ai/README.md
---
# ADR 0004: One Public Endpoint

## Status
Accepted

## Reason
The landing page relies on various datasets: active events, timelines, candidates, announcements, and configuration settings. Fetching these individually creates a waterfall effect on the client and increases connection overhead.

## Decision
The public landing page will utilize exactly ONE backend endpoint (`GET /api/v1/public/home`) which aggregates all necessary data. This endpoint must NEVER return a 500 error due to empty data; it must always return 200 OK with proper empty structures.

## Consequences
Simplifies frontend fetching logic (single React Query call) and significantly boosts perceived performance. Aggregation logic sits fully in the backend.
