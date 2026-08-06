---
Title: AI Governance
Purpose: Defines the workflow, stop rules, and decision matrix for AI assistants working on MUSKOM.
Owner: Engineering Lead
Last Updated: 2026-08-01
Related Documents: .ai/README.md, .ai/engineering-standards.md
---


# AI DEVELOPMENT WORKFLOW

This document defines the complete lifecycle of every engineering task performed by AI assistants. Every feature follows the exact same lifecycle. 
**AI must never skip phases. AI must never continue indefinitely. Every sprint has a clear beginning and end.**

## Phase 0: Bootstrap
1. Read `.ai/README.md`
2. Read `.ai/context/business.md`
3. Read `.ai/project-state.md`
4. Read `.ai/architecture/`
5. Read `.ai/design/`
6. Read `.ai/engineering/`
7. Read `.ai/product/roadmap.md`

## Phase 1: Understand
- Review current implementation.
- Identify constraints.
- Identify dependencies.
- **Do not write code yet.**

## Phase 2: Planning
Explain:
- Objective
- Scope
- Affected files
- Risks
- Expected result

Wait if clarification is needed.

## Phase 3: Implementation
Follow:
- Design System
- Engineering Rules
- Architecture

- Do not modify unrelated files.
- Keep changes incremental.

## Phase 4: Validation
Verify:
- Compilation
- Lint
- Tests
- Responsive
- Performance
- Accessibility
- No console errors.

## Phase 5: Review
Summarize:
- Modified files
- Reason
- Screenshots
- Known limitations

## Phase 6: Stop
Wait for Product Owner review.
**Never continue automatically.**

---

## APPROVED DEVELOPMENT WORKFLOW

```
Backlog → Increment → Build Mode → Feature Complete → Review → QA → Release
```

- QA is performed **only after Feature Complete**.
- Do not perform QA during Build Mode.

## SPRINT RULE
One Sprint ➔ One Deliverable ➔ One Review ➔ Stop

## FAILURE RULE
If requirements are unclear:
**Stop. Ask. Never guess.**

## DOCUMENT UPDATE
- If architecture changes: Update ADR (`.ai/decisions/`).
- If UI changes: Update Design System (`.ai/design/`).
- If roadmap changes: Update Roadmap (`.ai/product/roadmap.md`).
- If sprint completes: Update PROJECT_STATE (`.ai/project-state.md`).


# AI CHARTER v1.0

This document defines how AI assistants make decisions while working on the MUSKOM project.
**It complements engineering rules. It does not replace them.**

## CORE VALUES
Every decision should prioritize, in order:
1. Correctness
2. User Experience
3. Readability
4. Consistency
5. Performance
6. Maintainability
7. Simplicity

## DECISION RULES
If multiple valid solutions exist, prefer the solution that:
- matches the existing architecture
- reuses existing components
- introduces the least complexity
- improves maintainability

## WHEN REQUIREMENTS ARE UNCLEAR
- Do not guess.
- Do not invent business rules.
- Do not silently change scope.
- Instead: identify assumptions, explain the impact, and ask for clarification if required.

## DESIGN DECISIONS
- Follow the Design Constitution (`.ai/design/constitution.md`).
- Do not redesign approved pages.
- Improve polish only unless explicitly requested.

## ENGINEERING DECISIONS
- Avoid unnecessary abstractions.
- Avoid premature optimization.
- Avoid large refactors.
- Deliver incrementally.

## DOCUMENTATION
Documentation is part of the product.
- Architecture changes require ADR updates (`.ai/decisions/`).
- UI changes require Design System updates (`.ai/design/`).
- Workflow changes require Workflow updates (`.ai/WORKFLOW.md`).

## COMMUNICATION
When reporting work, always provide:
- Objective
- Implementation summary
- Modified files
- Validation
- Known limitations
- Next recommendation

## STOP RULE
After completing the requested scope, **stop.**
Wait for Product Owner review. Do not continue automatically.

## SUCCESS
The best solution is not the most complex.
The best solution is the one that future engineers can immediately understand.
