# MUSKOM RC2 Architecture

This document defines the architectural boundaries, domains, and abstractions prepared for Release Candidate 2 (RC2).
*For detailed platform standards, refer to [Platform Foundation](file:///home/langit/Dev/muskom/docs/architecture/platform.md).*

## Domain Responsibilities

### 1. Attendance Domain
- **Responsibility**: Track participant check-ins and generate real-time attendance statistics.
- **Interfaces**:
  - `AttendanceService`: Orchestrates check-ins (`CheckIn`, `GetSummary`, `GetStatus`).
  - `AttendanceRepository`: Persists the state (`RecordCheckIn`, `GetSummaryByEvent`).
  - **Note**: Attendance is designed to be idempotent and event-sourced. Check-ins are permanent and immutable.

### 2. Voting Domain
- **Responsibility**: Handle the lifecycle of voting sessions, securely process anonymous ballots, and generate outcome reports.
- **Interfaces**:
  - `VotingService`: Business logic for casting votes and checking eligibility (`CastVote`, `GetSessionSummary`, `InitializeSession`).
  - `VotingRepository`: High-performance data access (`SaveBallot`, `GetResults`, `GetSession`).
  - **Note**: Votes are isolated from participant identities after verification to ensure strict anonymity.

### 3. Notification Domain
- **Responsibility**: Dispatch messages to participants via configurable channels (Email, SMS, Push).
- **Interfaces**:
  - `NotificationService`: Sends payload and handles broadcast logic.
  - `NotificationRepository`: Stores notification logs for audit and tracking.

### 4. Reporting Domain
- **Responsibility**: Assemble and generate downloadable files (PDF, XLSX, CSV) summarizing the event.
- **Interfaces**:
  - `ReportingService`: Orchestrates PDF generation (`GenerateAttendanceReport`, `GenerateVotingReport`).

## Realtime Architecture

For RC2, real-time data features (such as live Attendance stats and live Voting progress) use the `useRealtimeSync` hook.

### The Strategy
The UI is completely decoupled from the transport mechanism. Instead of managing raw connections, components subscribe to a `topic` using `useRealtimeSync`.

1. **Current (RC1/RC2 Base)**: The abstraction uses React Query **short-polling** (`refetchInterval: 5000`) for simplicity and reliability.
2. **Future Upgrades**: The hook internally supports `TransportMethod = 'sse' | 'websocket'`. When the infrastructure is ready (e.g., Redis Pub/Sub backend configured), the hook can switch to pushing data directly into the React Query cache (`queryClient.setQueryData`) without ANY modifications needed to the UI components.

## Shared Frontend Components
To reduce duplication and enhance maintainability, UI elements have been standardized into the `apps/frontend/src/components/shared/` directory:

1. **`DataTable`**: A generic table layout component that replaces custom `ParticipantTable`, `CandidateTable`, and `AttendanceTable`.
2. **`DataToolbar`**: A universal search and filter bar for administration screens.
3. **`StatusBadge`**: Standardizes color logic (`APPROVED`, `PENDING`, `REJECTED`, `PRESENT`, `ABSENT`).
4. **`DetailDrawer`**: A reusable slide-out drawer wrapper.
5. **`ConfirmDialog`**: A standardized confirmation modal used before mutating sensitive state.
6. **`EmptyState`**: Consistent UI for empty search results or initial empty lists.

## Future API Contracts
Going forward, all REST responses from these newly defined domains will strictly adhere to the `ApiResponse<T>` contract defined in `apps/frontend/src/types/api.ts`.
