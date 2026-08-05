# Known Issues Register (RC-1 Release Gate)

| Issue ID | Module | Severity | Description | Resolution / Workaround | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **ISSUE-01** | `attendance` | **CRITICAL** | `attendance` table foreign key references legacy `registrations(id)`. | Applied migration `054_fix_attendance_votes_participants_fk.sql`. | **CLOSED (RESOLVED RC-1)** |
| **ISSUE-02** | `voting` | **CRITICAL** | `votes` table foreign key references legacy `registrations(id)`. | Applied migration `054_fix_attendance_votes_participants_fk.sql`. | **CLOSED (RESOLVED RC-1)** |
| **ISSUE-03** | `rbac` | **CRITICAL** | 10 out of 13 admin route groups under `/admin` lack `checker.RequirePermission` middleware. | Applied RBAC middleware across all admin routes in `cmd/server/main.go`. | **CLOSED (RESOLVED RC-1)** |
| **ISSUE-04** | `public` | **HIGH** | `GET /public/home` queries legacy tables instead of CMS tables. | Verified `public/repository.go` fetches from CMS tables & `participants`. | **CLOSED (RESOLVED RC-1)** |
| **ISSUE-05** | `participant`| **MEDIUM** | `PublicRegister` missing `registration_open`/`close` date bounds validation. | Added date bounds check in `participant/service.go`. | **CLOSED (RESOLVED RC-1)** |

