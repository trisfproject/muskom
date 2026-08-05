# Release Process & Quality Gates

## Release Validation Steps
1. **Backend Verification:** `go build ./...` and `go test ./...` in `apps/api`.
2. **Frontend Verification:** `npm run build` in `apps/frontend`.
3. **Docker Compose Validation:** `docker compose config` in `deploy/`.
4. **Regression Check:** Verify Login, CMS Landing Page, Participant Registration, Candidate Showcase, Admin Portal.
5. **Git Conventional Commit:** Commit with standard scope (e.g. `feat(participant): ...`, `fix(voting): ...`).
6. **Sprint Signoff:** Generate formal Release Report with readiness scores.
