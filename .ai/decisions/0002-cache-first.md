---
Title: ADR 0002 Cache First
Purpose: Documentation regarding adr 0002 cache first
Owner: Engineering Team
Last Updated: 2026-08-01
Related Documents: .ai/README.md
---
# ADR 0002: Cache First

## Status
Accepted

## Reason
The public landing page and event portals are expected to receive high traffic spikes, especially during active governance events. Direct database queries for read-heavy public data pose a scalability risk.

## Decision
All public-facing, read-heavy data will adopt a "Cache First" approach. The backend will attempt to serve this data from Redis. The cache is invalidated or updated asynchronously when the underlying data changes in PostgreSQL.

## Consequences
Increases architectural complexity slightly but guarantees high availability and ultra-fast response times for public users.
