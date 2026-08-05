# Release Readiness Checklist (RC-1 Gate)

## Functional & Technical Gate
- [ ] **Backend Build:** `go build ./...` passes without errors.
- [ ] **Backend Tests:** `go test ./...` passes without failing assertions.
- [ ] **Frontend Build:** `npm run build` in `apps/frontend` completes without SSR/CSR errors.
- [ ] **Docker Validation:** `docker compose config` in `deploy/` is valid.
- [ ] **RBAC Enforcement:** All administrative routes protected by JWT and `checker.RequirePermission`.
- [ ] **Database Integrity:** Zero broken foreign keys or missing indexes.
- [ ] **No Placeholder Pages:** All admin and public pages fully functional without `#coming-soon` or `TODO` shortcuts.
- [ ] **Documentation Sync:** `README.md`, `.env.example`, and `docs/` knowledge base synchronized.
