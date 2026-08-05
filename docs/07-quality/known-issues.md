# Known Issues Register

| Issue ID | Module | Severity | Description | Workaround | Target Sprint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ISSUE-01** | `attendance` | **CRITICAL** | `attendance` table foreign key references legacy `registrations(id)`. | Run migration `054_fix_attendance_votes_participants_fk.sql`. | Sprint 1 |
| **ISSUE-02** | `voting` | **CRITICAL** | `votes` table foreign key references legacy `registrations(id)`. | Run migration `054_fix_attendance_votes_participants_fk.sql`. | Sprint 1 |
| **ISSUE-03** | `rbac` | **CRITICAL** | 10 out of 13 admin route groups under `/admin` lack `checker.RequirePermission` middleware. | Apply permission middleware in `cmd/server/main.go`. | Sprint 1 |
| **ISSUE-04** | `public` | **HIGH** | `GET /public/home` queries legacy tables instead of CMS tables. | Update `public/service.go` to fetch from CMS tables. | Sprint 2 |
| **ISSUE-05** | `participant`| **MEDIUM** | `PublicRegister` missing `registration_open`/`close` date bounds validation. | Add date check against active Musyawarah in `participant/service.go`. | Sprint 1 |
