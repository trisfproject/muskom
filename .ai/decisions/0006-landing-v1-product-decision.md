# ADR 0006 — Public Landing v1 Product Decision

**Date:** 2026-08-01
**Owner:** Product Owner
**Status:** APPROVED — PERMANENT

---

## Context

The MUSKOM Public Landing is an official event portal for Musyawarah KOMITKABE.
It is NOT a company profile, corporate website, SaaS landing page, or product landing page.

---

## Decisions

### Sections Allowed

| Section | Status |
|---|---|
| Navbar | ✅ Allowed |
| Hero | ✅ Allowed |
| Timeline | ✅ Allowed |
| Candidates | ✅ Allowed |
| Announcements | ✅ Allowed |
| Location | ✅ Allowed (via Hero card) |
| Footer | ✅ Allowed (minimal) |

### Sections Permanently Removed

| Section | Reason |
|---|---|
| FAQ | MUSKOM is not a company website. Users come for official event info. |
| Help / Contact / Support | Support info belongs in footer only. |

### Footer — Allowed Content

- Navigation links
- Contact (email + WhatsApp)
- Copyright

### Footer — Permanently Removed

- Legal / Privacy / Terms links
- Social Media links
- Administrator Access link

---

## Registration

There are TWO independent registration workflows:

1. **Participant Registration** — Register attendees of the Musyawarah.
2. **Candidate Registration** — Register as candidate for Ketua Umum.

These MUST NOT share wording or business logic.
CTA labels are dynamic based on the active timeline phase.
The backend sets `open: true/false` — frontend never calculates registration eligibility.

---

## Single Source of Truth

Timeline is master data. All of the following are derived from it:
- Current Phase
- Countdown
- Hero Status
- Registration CTA state (`open`)
- Candidate visibility
- Announcement context

Frontend must never calculate phase, date comparisons, or registration eligibility.

---

## This Decision is Permanent

- Do NOT recreate removed sections.
- Do NOT introduce corporate website elements.
- Do NOT duplicate business rules in frontend.
- Do NOT hardcode business data in components.
