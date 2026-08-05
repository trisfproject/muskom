# Contribution Workflow & Git Guidelines

## Git Branching & Commit Conventions
1. **Branch Names:** `feature/<domain>-<name>`, `fix/<domain>-<name>`, `chore/<scope>-<name>`.
2. **Conventional Commit Format:**
   ```
   <type>(<scope>): <short description>
   ```
   Allowed types: `feat`, `fix`, `refactor`, `docs`, `perf`, `test`, `chore`, `style`.
3. **Commit Rule:** Commit after every completed logical task. Never accumulate multiple unrelated changes into one commit.

## Definition of Done Checklist
- [ ] Code implemented and reviewed.
- [ ] Backend build (`go build ./...`) and tests (`go test ./...`) pass.
- [ ] Frontend build (`npm run build`) passes.
- [ ] Docker compose config (`docker compose config`) valid.
- [ ] Documentation updated in `docs/`.
- [ ] Conventional commit created.
