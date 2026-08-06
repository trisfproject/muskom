---
Title: Engineering Standards
Purpose: Strict rules for engineering workflow, coding style, backend/frontend patterns.
Owner: Engineering Lead
Last Updated: 2026-08-01
Related Documents: .ai/README.md, .ai/decisions/
---


# BACKEND ENGINEERING

## Public Pages Architecture
- Public pages → Cache first → One endpoint → Fast rendering.
- No multiple database round-trips for public views.
- **Business Logic belongs to Backend. Presentation belongs to Frontend.**
- Frontend must never calculate phases, dates, registration eligibility, or CTA states.

## Timeline — Single Source of Truth
The Website Timeline (`website_timeline_phases`) is the absolute master data.

**Strict Rules for Phase Resolution:**
- There must be ONE unified phase resolution implementation (Phase Resolver).
- Dashboard, Participant Registration, Voting, and Musyawarah Timeline **MUST NOT** calculate lifecycle phases or remaining time independently.
- All modules consume the shared Phase Resolver.
- The Phase Resolver derives all of the following for its consumers:
  - Current Phase
  - Countdown target date
  - CTA labels and state (`open: boolean`)
  - Participant Registration open/close state
- Candidate registration from the public website does not exist. Candidates are managed manually by administrators only.
- MUSKOM is a single musyawarah platform. There is no active event context to manage.

**Frontend only renders.** Frontend never calculates business rules or derives lifecycle phases.

## Transactional Pages Architecture
- Transactional pages → Database → Validation → Business logic.
- Ensure strict role-based access control and strict data verification.


# CODING STYLE

## File Limits
- Target: 5–15 modified files per sprint.
- Never perform large-scale refactors.
- Never modify unrelated files.

## Refactoring Limits
- Do not rename folders.
- Do not move project structure.
- Do not change architecture unless explicitly requested.

## Stop Condition
After every sprint provide:
- Summary
- Modified files
- Screenshots
- Validation result
Wait for review. Do not continue automatically.


# FRONTEND ENGINEERING

## UI Rule
- **Layout is synchronous.** 
- **Content is asynchronous.**
- Never remove sections from the DOM simply because data is missing.
- Every section must natively support:
  - Loading
  - Empty
  - Loaded

## Public Landing
Landing sections are permanently locked to:
- Hero
- Timeline
- Candidates
- Announcements
- Footer

Permanently removed (see ADR 0006):
- FAQ, Help, Support, Legal, Privacy, Terms, Social Media, Administrator Footer

Only allow:
- Bug fixes
- Performance improvements
- Backend integration
- Minor visual polish

**No redesigns. No new sections. No removed sections without Product Owner approval.**


# GIT WORKFLOW

- One sprint -> One commit.
- Commit message must clearly describe the sprint objective.
- Ensure all quality standards are met before pushing/merging.


# PERFORMANCE

- No unnecessary requests.
- No duplicated fetches.
- No page-wide loading (unless handling catastrophic failures).
- Layout rendering must be instantaneous. Content hydration is asynchronous.


# TESTING

- All UI components must be visually validated in their Empty, Loading, and Loaded states.
- Automated tests (linting, building) must pass before PR creation.
- Testing should prioritize the user journey and performance rendering rules.


# DEVELOPMENT WORKFLOW

```
Backlog → Increment → Build Mode → Feature Complete → Review → QA → Release
```

- QA is performed **only after Feature Complete**.
- One Sprint → One Deliverable → One Review → Stop.
- Never skip phases. Never continue automatically after a sprint.
