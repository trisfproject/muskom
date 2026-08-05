# Product Goals & Objectives

## Primary Objectives for RC-1
1. **Production Stability:** Deliver a zero-crash backend service (Go Fiber) and SSR-safe Next.js frontend capable of serving multi-thousand delegate assemblies.
2. **Data Model Integrity:** Standardize domain entities around `Musyawarah`, `Participant`, `Candidate`, `Attendance`, and `Voting`, completely eliminating legacy deprecated structures.
3. **Security & RBAC:** Enforce strict role-based access control (`checker.RequirePermission`) across 100% of administrative endpoints.
4. **Seamless Delegate Experience:** Allow public visitors to inspect event timelines, register, check verification status, scan QR codes for attendance, and cast secret votes without operational friction.

## Key Performance Indicators (KPIs)
- **Check-in Speed:** QR scan processing time under 500ms per delegate.
- **Voting Tally Accuracy:** 100% secret ballot cryptographic integrity and real-time quorum validation.
- **Uptime Target:** 99.9% uptime during active event windows.
