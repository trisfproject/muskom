---
Title: MUSKOM AI Workspace Master Index
Purpose: Complete entry point and operating manual for all AI agents working on MUSKOM.
Owner: Engineering Lead
Last Updated: 2026-08-01
Related Documents: .ai/project-state.md, .ai/business-context.md
---
# MUSKOM AI WORKSPACE

Welcome to the MUSKOM AI Workspace. This directory is the single source of truth and the complete operating manual for the entire project.

**Every AI assistant working on MUSKOM must read this workspace before implementing any feature.**

## Purpose
This workspace governs the architectural, design, engineering, and product constraints of the MUSKOM platform. It ensures no knowledge is lost, no duplicated components are created, and high standards of structural integrity are maintained.

## Workspace Structure
- **`project-state.md`**: Live dashboard tracking the active development sprint and immediate next steps.
- **`business-context.md`**: Business logic, core definitions, and user personas.
- **`ai-governance.md`**: Defines the workflow, stop rules, and decision matrix for AI assistants.
- **`architecture.md`**: System topologies, data flow, and deployment rules.
- **`design-system.md`**: The UI Constitution, colors, typography, spacing, and interaction rules.
- **`engineering-standards.md`**: Strict rules for git workflows, coding styles, backend patterns, and frontend rendering.
- **`product-lifecycle.md`**: Roadmaps, backlogs, milestones, and historical release archives.
- **`definition-of-done.md`**: Strict quality gate that must be passed before a sprint is complete.
- **`/decisions`**: Architectural Decision Records (ADRs) dictating major engineering choices.
- **`/templates`**: Standardized markdown formats for sprints, features, bugs, etc.

## Reading Order
When onboarding or starting a new sprint, follow this reading order:
1. `.ai/project-state.md` - Understand the current dashboard and active sprint.
2. `.ai/business-context.md` - Understand the business goals and user profiles.
3. `.ai/ai-governance.md` - Internalize the rules of AI operation.
4. `.ai/engineering-standards.md` - Internalize the strict engineering boundaries.
5. `.ai/design-system.md` - Absorb the MUSKOM UI Constitution.
6. Specific domains (`architecture.md`, `product-lifecycle.md`, `/decisions`) as relevant to the task.

## Update Workflow & Contribution Rules
- **Non-Duplication:** Always verify if a rule or component exists before adding a new one. Merge intelligently.
- **Metadata Requirement:** Every new document must contain YAML frontmatter (Title, Purpose, Owner, Last Updated, Related Documents).
- **Synchronous Layout:** Frontend changes must respect the layout-sync rule.
- **No Source Code Changes During Governance:** When maintaining `.ai`, do not touch application code.

## Document Ownership
All documents must maintain an `Owner` in the metadata to clarify responsibility (e.g., Engineering Lead, Product Owner, Lead Designer).

## Engineering Rules (Summary)
- **Incremental Development**: Every sprint must produce visible progress.
- **One Sprint = One Objective = One Deliverable = One Commit**.
- **File Limit**: Target 5–15 modified files per sprint. No massive refactoring unless requested.
- **UI Principle**: Layout is synchronous. Content is asynchronous.

## Stop Conditions
- Before making major architectural changes.
- After every sprint, before proceeding to the next.
- When ambiguity arises that affects the product vision or engineering rules.
