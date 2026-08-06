---
Title: Definition of Done
Purpose: Defines the minimum quality gate and requirements before any sprint can be considered complete.
Owner: Engineering Lead
Last Updated: 2026-08-01
Related Documents: .ai/engineering-standards.md, .ai/ai-governance.md
---
# DEFINITION OF DONE & SPRINT QUALITY GATE

**A sprint is NOT finished because the code compiles.**  
A sprint is finished only when users can successfully use the delivered functionality. Every sprint must satisfy ALL requirements listed in this Quality Gate.

This document applies to every module: Landing, Registration, Candidate, Attendance, Voting, Reporting, Admin.

---

## 1. ENGINEERING
- [x] Build passes
- [x] Lint passes
- [x] No console errors
- [x] No hydration warnings
- [x] No runtime errors
- [x] Docker build succeeds

## 2. UI
- [x] Desktop
- [x] Tablet
- [x] Mobile
- [x] Light Theme
- [x] Dark Theme
- [x] Responsive
- [x] No broken layout

## 3. UX
- [x] No unnecessary loading
- [x] Layout renders immediately
- [x] Loading State implemented
- [x] Empty State implemented
- [x] Loaded State implemented
- [x] Smooth transitions

## 4. PERFORMANCE
- [x] No duplicated API requests
- [x] No unnecessary re-render
- [x] Fast initial render
- [x] Minimal layout shift

## 5. BACKEND
- [x] No HTTP 500
- [x] Empty collections handled
- [x] API contract respected
- [x] Validation completed

## 6. DESIGN SYSTEM
- [x] Existing components reused
- [x] No duplicated UI
- [x] Typography consistent
- [x] Color system respected
- [x] Spacing consistent

## 7. DOCUMENTATION
- [x] `project-state.md` updated
- [x] Roadmap updated
- [x] ADR updated if architecture changed

## 8. PRODUCT OWNER REVIEW
Every sprint completion must provide:
- Summary
- Modified files
- Screenshots
- Known limitations
- Next recommendation

---

## FAIL CONDITIONS
A sprint automatically FAILS if:
- Approved UI disappears
- New loading screen appears
- HTTP 500 introduced
- Performance becomes worse
- Responsive layout breaks
- Existing functionality regresses

## FINAL RULE
**No sprint may continue until the Product Owner approves the current deliverable.**
