# Platform Foundation Architecture (RC2)

This document formalizes the platform guidelines and standards expected for all future domains.

## Domain Contracts

Each domain in the backend must strictly expose a unified Service Interface containing all business operations to prevent logic leakage into Handlers or Repositories.

- **Attendance**: `CheckIn`, `UndoCheckIn`, `GetAttendance`, `GetSummary`, `Search`
- **Voting**: `StartSession`, `StopSession`, `CastVote`, `GetSummary`, `IsVotingOpen`
- **Notification**: `Queue`, `Send`, `Broadcast`, `Retry`, `Status`
- **Reporting**: `Generate`, `Preview`, `Download`, `History`

## Domain Events

To support decoupling, the platform utilizes asynchronous Domain Events defined in `apps/api/platform/events/`:
- `ParticipantApproved`, `CandidateApproved`
- `AttendanceCheckedIn`, `AttendanceUndone`
- `VotingStarted`, `VotingStopped`, `VoteSubmitted`
- `NotificationQueued`

## Frontend Service Structure

Every future domain (e.g., `services/voting/`, `services/notification/`) MUST follow this uniform structural pattern:

```text
services/[domain]/
├── index.ts      // Central export hub
├── queries.ts    // TanStack Query (useQuery) hooks
├── mutations.ts  // TanStack Query (useMutation) hooks
├── mapper.ts     // Transforms backend DTOs into frontend models
└── types.ts      // Domain-specific UI/State interfaces
```

## Node Environment Constraints

> [!WARNING]
> MUSKOM RC2 strictly utilizes Next.js >= 16.2. 
> Because of this dependency, the Frontend requires **Node >= 20.9.0**.
> Running builds on Node 18 will trigger immediate `EBADENGINE` compatibility failures. Do not silently ignore Node version warnings.

## Realtime Architecture

All frontend modules must utilize the `LiveProvider` and `useRealtimeSync` abstractions.
Components must never directly instantiate WebSockets or SSE `EventSource` connections. This allows the Platform team to globally upgrade the transport protocol from standard HTTP Polling to WebSockets or Server-Sent Events later without breaking the UI.

## Shared Components and Configuration

- **Feature Flags**: Managed centrally in `config/features.ts`.
- **Constants**: Mapped structurally in `shared/constants/` (e.g., `roles.ts`, `status.ts`, `permissions.ts`, `event-phase.ts`).
- **UI Components**: Generic patterns (`DataTable`, `SummaryCard`, `Pagination`) are strictly imported from `components/shared/` to enforce UI conformity.
