# ADR-003: Delegate Registration & Verification Pipeline

- **Status:** Accepted
- **Date:** August 5, 2026

## Context
Public delegate registration requires registration window date validation, quota checking, unique email enforcement, and automated email receipts.

## Decision
1. `PublicRegister` endpoint validates active Musyawarah date bounds (`registration_open` to `registration_close`) and capacity limits (`registration_limit`).
2. New registrants are inserted into `participants` table with status `Pending` and auto-generated registration number `PAR-XXXX-XXXXXXXX`.
3. Committee verification via `/admin/participants` updates status to `Verified` (sending QR code confirmation email) or `Rejected` (sending rejection email with reason).

## Consequences
- Single registration pipeline serving public delegates and administrative verifiers.
