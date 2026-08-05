# Engineering Governance & Code Review Policy

## Governance Principles
1. **Architecture First:** Architecture takes absolute priority over implementation speed.
2. **Single Source of Truth (SSOT):** No duplicate tables, endpoints, UI components, or settings.
3. **Mandatory 3-Step Review:** Business, Architecture, and Product reviews before any code is written.

## Code Review Policy
Every Pull Request / commit must be reviewed for:
- Adherence to Go & TypeScript coding standards.
- Inclusion of validation, authorization, and audit logging.
- Zero broken foreign keys or missing database indexes.
- Complete documentation updates (`README`, `.env.example`, `docs/`).
- Passing builds (`go build ./...`, `go test ./...`, `npm run build`, `docker compose config`).
