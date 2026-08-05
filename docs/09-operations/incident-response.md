# Incident Response Guide

## Incident Severity Level Definitions
- **SEV-1 (Critical):** Database crash, API down, or e-voting / attendance check-in paralyzed during an active convention.
- **SEV-2 (High):** Admin portal UI error or broken public candidate display.
- **SEV-3 (Low):** Minor styling flaw or cosmetic log warning.

## Response Procedure for SEV-1
1. **Isolate:** Inspect Nginx access logs and container status (`docker compose logs -f --tail=100 muskom-api`).
2. **Recover:** Execute database/container rollback procedure if a recent deployment caused failure.
3. **Notify:** Record incident details in audit logs and generate postmortem report.
