# Release Readiness Checklist (RC-1 Gate)

## Functional & Technical Gate
- [x] **Backend Build:** `go build ./...` passes without errors.
- [x] **Backend Tests:** `go test ./...` passes without failing assertions.
- [x] **Frontend Build:** `npm run build` in `apps/frontend` completes without SSR/CSR errors.
- [x] **Docker Validation:** `docker compose config` in `deploy/` is valid.
- [x] **RBAC Enforcement:** All administrative routes protected by JWT and `checker.RequirePermission`.
- [x] **Database Integrity:** Zero broken foreign keys or missing indexes.
- [x] **No Placeholder Pages:** All admin and public pages fully functional without `#coming-soon` or `TODO` shortcuts.
- [x] **Documentation Sync:** `README.md`, `.env.example`, and `docs/` knowledge base synchronized.

