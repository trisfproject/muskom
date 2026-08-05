# Core Business Rules

## 1. Registration Rules
- **Registration Window:** Registrations are only accepted if `time.Now()` falls between `registration_open` and `registration_close` of the active Musyawarah.
- **Quota Limit:** Registrations are rejected with `ErrQuotaReached` if total active participants exceed `registration_limit`.
- **Unique Email:** Email addresses must be unique per Musyawarah (`ErrDuplicateEmail`).

## 2. Participant Verification Rules
- Status transitions: `Pending` -> `Verified` or `Rejected`.
- Status transition to `Verified` generates a digital QR token and sends a confirmation email.
- Status transition to `Rejected` requires a reason and sends a notification email.

## 3. Candidate Rules
- Candidates must belong to an active Musyawarah event.
- Candidates require profile details, biography, vision, mission, and work program statements.
- Candidate publication status (`Published` / `Unpublished`) controls display on the public website.

## 4. Attendance Rules
- Only participants with status `Verified` are eligible for check-in.
- Check-in records timestamp, operator ID, and marks delegate present for quorum calculation.

## 5. Voting Rules
- Voting is permitted only during an active `VOTING_SESSION` with status `RUNNING`.
- Only verified delegates who have checked in (attendance record present) are eligible to vote.
- Delegates may vote only once per session (`uq_votes_event_participant`).
