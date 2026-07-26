# Contributing to MUSKOM

Thank you for your interest in contributing to MUSKOM (Musyawarah KOMITKABE Management System)!

## Branch Strategy
We use Trunk-Based Development / GitFlow hybrid:
- `main`: The production-ready branch.
- `develop`: The integration branch (if applicable).
- Features should be branched off `main` or `develop` using the format `feature/issue-id-short-desc`.
- Bug fixes should use `fix/issue-id-short-desc`.

## Commit Convention
We strictly follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` A new feature.
- `fix:` A bug fix.
- `docs:` Documentation only changes.
- `style:` Changes that do not affect the meaning of the code (white-space, formatting, etc).
- `refactor:` A code change that neither fixes a bug nor adds a feature.
- `test:` Adding missing tests or correcting existing tests.
- `chore:` Changes to the build process or auxiliary tools.

## Pull Request Rules
- All PRs must target the `main` or `develop` branch.
- Ensure the CI pipeline (Lint, Format, Test) passes.
- PR titles must follow the commit convention (e.g., `feat(api): add user authentication`).
- Provide a clear description of the changes using the provided PR template.
- At least one code review approval is required before merging.

## Coding Standard
- **Backend (Go)**: Code must be formatted using `gofmt` or `goimports`. Adhere to standard Go idioms.
- **Frontend (TypeScript)**: Strictly typed. Run ESLint and Prettier before committing.
