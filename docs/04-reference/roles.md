# Roles Reference

Default RBAC roles defined in `roles` table:

1. **ADMIN / SUPER_ADMIN:** Granted all permissions (`system.manage`, `musyawarah.manage`, `participant.manage`, `candidate.manage`, `attendance.manage`, `voting.manage`, `website.manage`, `audit.view`).
2. **COMMITTEE:** Granted event, participant, candidate, attendance, and voting management permissions.
3. **VERIFIER:** Granted `participant.manage` and `candidate.manage` for inspecting applications and document verification.
4. **OPERATOR:** Granted `attendance.manage` for dedicated QR code check-in scanning.
5. **PARTICIPANT:** Granted voting access (`/vote/cast`) during active election sessions.
6. **GUEST:** Public unauthenticated access to home, info, candidates, and registration form.
