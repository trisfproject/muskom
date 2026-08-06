---
Title: ADR 0003 Layout Sync
Purpose: Documentation regarding adr 0003 layout sync
Owner: Engineering Team
Last Updated: 2026-08-01
Related Documents: .ai/README.md
---
# ADR 0003: Layout Sync Rendering

## Status
Accepted

## Reason
During initial development, the UI layout shifted or disappeared based on the status of API calls (e.g., loading spinners replacing the entire page, or sections hiding if data was empty). This violated our premium feel and speed requirements.

## Decision
Layout is Synchronous. Content is Asynchronous.
The UI structure (Navbar, Hero, Timeline, Candidates, Footer) must be permanently rendered in the DOM. Each section natively handles its own `loading`, `empty`, and `loaded` states.

## Consequences
Eliminates layout shifts and blank loading screens. Requires disciplined component design to gracefully handle missing or loading data.
