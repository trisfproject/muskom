# MUSKOM Software Development Lifecycle (SDLC)

**Version:** RC-1  
**Status:** Mandatory Governance Framework  

## The 8-Phase SDLC Trajectory

```mermaid
flowchart TD
    P0["Phase 0: Discovery"] --> P1["Phase 1: Analysis"]
    P1 --> P2["Phase 2: Design Specification"]
    P2 --> P3["Phase 3: RFC Review & Approval"]
    P3 --> P4["Phase 4: Implementation (Code & Small Commits)"]
    P4 --> P5["Phase 5: Verification (Build, Tests, Docker & Regression)"]
    P5 --> P6["Phase 6: Release Sign-Off & Migration"]
    P6 --> P7["Phase 7: Post-Release Monitoring & Tech Debt Registry"]
```

## Phase Deliverables Summary
- **Phase 0 (Discovery):** Business domain ownership check, duplication search.
- **Phase 1 (Analysis):** 7-vector analysis (Business, Architecture, UX, DB, API, Deployment, Risk).
- **Phase 2 (Design):** API contract, workflow diagram, DB changes, acceptance criteria.
- **Phase 3 (Review):** Formal RFC created in `docs/rfc/` and approved.
- **Phase 4 (Implementation):** Incremental code changes following Go & TypeScript coding standards.
- **Phase 5 (Verification):** Build validation (`go build ./...`, `go test ./...`, `npm run build`, `docker compose config`).
- **Phase 6 (Release):** Migration execution, rollback plan verification, release notes update.
- **Phase 7 (Post-Release):** Log inspection, Known Issues & Technical Debt update.
