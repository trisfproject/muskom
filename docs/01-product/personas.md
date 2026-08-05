# User Personas

## 1. Super Administrator
- **Role Code:** `ADMIN` / `SUPER_ADMIN`
- **Needs:** Full system control, global settings, RBAC role assignment, system health monitoring, audit trail inspection.
- **Key Views:** `/admin/dashboard`, `/admin/users`, `/admin/audit`, `/admin/musyawarah`.

## 2. Administrator / Panitia Exec
- **Role Code:** `ADMIN`
- **Needs:** Event lifecycle configuration, location setup, timeline phase management, CMS customization, global statistics oversight.
- **Key Views:** `/admin/musyawarah/*`, `/admin/website/*`.

## 3. Committee Verifier
- **Role Code:** `VERIFIER`
- **Needs:** Fast, focused workflow to inspect delegate applications, review uploaded identity documents, and Approve/Reject registrants.
- **Key Views:** `/admin/participants`, `/admin/candidates`.

## 4. Attendance Operator
- **Role Code:** `OPERATOR` / `COMMITTEE`
- **Needs:** Dedicated mobile/tablet QR code scanner to check in arriving delegates and view live quorum percentages.
- **Key Views:** `/admin/attendance`.

## 5. Participant / Delegate
- **Role Code:** `PARTICIPANT`
- **Needs:** Public registration, receipt confirmation email, status check, digital QR ticket presentation, secret ballot casting during active voting sessions.
- **Key Views:** `/register`, `/profil`, `/voting`.

## 6. Public Visitor
- **Role Code:** `GUEST`
- **Needs:** Inspect event theme, browse timeline agenda, review published candidates, read official announcements, contact committee.
- **Key Views:** `/`, `/informasi`, `/kandidat`.
