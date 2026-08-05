# ADR-002: Candidate Application & Verification Architecture

- **Status:** Accepted
- **Date:** August 5, 2026

## Context
Candidates submit rich biographical, vision/mission, and PDF document data. A clean separation was needed between candidate nomination management and public website display toggles.

## Decision
1. `candidate` module (`candidates` table) owns candidate records, document verification, and publication status (`Published` / `Unpublished`).
2. Candidate CMS settings (`section_title`, `registration_status`, `publication_message`) are managed in `system_configurations` under group `candidate_section`.
3. Candidate public API (`GET /api/v1/public/candidates`) queries candidates where `publication_status = 'Published'`.

## Consequences
- Clean separation between admin candidate management (`/admin/candidates`) and public candidate directory (`/kandidat`).
