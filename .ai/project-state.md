---
Title: MUSKOM Project State
Purpose: Live dashboard tracking the active development and immediate next steps of MUSKOM.
Owner: Product Owner
Last Updated: 2026-08-01
Related Documents: .ai/README.md, .ai/product-lifecycle.md
---
# MUSKOM Project State

This is the live dashboard tracking the active development of MUSKOM.

## Current Increment

**Increment 1 — Public Landing**
- **Status:** IN PROGRESS
- **Phase:** Build Mode → Feature Complete → Review

### Completed Builds
- `BUILD-001.1` — Hero Polish & Product Alignment (Feature Complete)
- `BUILD-001.2` — Navigation & Footer Simplification (Feature Complete)
- `BUILD-000` — AI Workspace Synchronization (IN PROGRESS)

### Remaining
- Backend integration for `/api/public/home` endpoint
- QA (after all BUILD tasks reach Feature Complete)

---

## Next Increment

**Increment 2 — Website CMS**
- Admin can manage landing page content (event info, phase, countdown, CTA, announcements)
- Content changes propagate to public landing via ISR (60s cache)

---

## Backlog

### Increment 3 — Participant Registration Module
- **Status:** TODO — Not Started
- Full registration workflow for Musyawarah attendees (`/register`)

### Increment 4 — Candidate Registration Module
- **Status:** TODO — Not Started
- **Trigger:** Added by BUILD-001.1 (2026-08-01)
- **Scope:** Build Candidate Registration workflow (`/register/candidate`).
  Currently a placeholder CTA exists in the Hero.
  Do NOT implement until explicitly prioritized by the Product Owner.
- **Dependency:** Requires Increment 3 (Participant Registration) to be complete first.

---

## Known Issues
- `deploy_muskom_data` and other old volumes/networks exist but are harmless.
- Host machine running the build in target CI MUST enforce Node >= 20.9.0.
- `middleware.ts` deprecation warning in build output (cosmetic — no functional impact).
