# ADR 0007: Timeline Single Source of Truth (RC-1)

**Date:** 2026-08-07
**Owner:** Product Architect
**Status:** APPROVED — PERMANENT

---

## Context

Historically, the system assumed multiple events and used `event_phases` for operational lifecycles alongside `website_timeline_phases` for CMS content.
To simplify the architecture and redefine MUSKOM as a single musyawarah platform, all multi-event assumptions and synchronization layers have been removed.

---

## Decision

For RC-1 and beyond, `website_timeline_phases` is the **canonical and ONLY source of truth** for all operational scheduling.

### Consumers

The following modules MUST consume the Website Timeline directly via the Phase Resolver:
- Dashboard
- Participant Registration
- Voting
- Musyawarah Timeline
- Current Phase Resolution

### Phase Resolution

There must be ONE unified phase resolution implementation (Phase Resolver).
- Dashboard must never calculate lifecycle independently.
- Musyawarah must never calculate lifecycle independently.
- Participant Registration must not calculate lifecycle independently.
- Voting must not calculate lifecycle independently.
- All modules consume the shared Phase Resolver.

### Synchronization Removed

The derived `event_phases` and denormalized date columns (`events.registration_open/close`) are deprecated and removed. There is no synchronization layer. The platform queries the Website Timeline directly.

---

## Consequences

- Administrator configures operational dates in ONE place (`/admin/website/timeline`), which is the Website Timeline.
- All backend consumers (registration validation, lifecycle state, dashboard, voting) read consistent dates.
- The redundant musyawarah operational timeline page (`/admin/musyawarah/timeline`) is deprecated/removed.
- Candidate registration from the public website has been removed. Candidates are managed manually by administrators.
- No more out-of-sync lifecycle states.
