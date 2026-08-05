# QA Integration Checklist

## End-to-End QA Test Cases
- [ ] **TC-01 (Admin Auth):** Login with default admin credentials -> Token issued -> Access `/admin/dashboard`.
- [ ] **TC-02 (Event Setup):** Create new Musyawarah -> Set dates, location, quota -> Mark `PUBLISHED` & `IsActive`.
- [ ] **TC-03 (Public Landing):** Open `/` -> Verify active Musyawarah title, hero, announcements, timeline, candidate preview.
- [ ] **TC-04 (Delegate Register):** Submit `/register` -> Verify `Pending` participant created -> Check confirmation email triggered.
- [ ] **TC-05 (Verification):** Admin opens `/admin/participants` -> Click `Verify` -> Check status `Verified` & QR email sent.
- [ ] **TC-06 (Candidate Application):** Submit candidate application & PDF document -> Admin verifies in `/admin/candidates` -> Toggle `Published`.
- [ ] **TC-07 (Attendance Check-In):** Open `/admin/attendance` -> Scan participant QR token -> Verify check-in recorded & live quorum updated.
- [ ] **TC-08 (E-Voting):** Admin opens `/admin/voting` session -> Delegate opens `/voting` -> Cast secret vote -> Verify single-vote constraint & tally update.
