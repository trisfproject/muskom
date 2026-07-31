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

## Integration & Automation Platform
To strictly prevent business domains from leaking into external integrations, all side-effects must be brokered via the `Integration Platform`.

### Event Flow (Pub/Sub)
1. **Domain Event**: An operation occurs (e.g., Attendance is checked in). The domain constructs an `EventEnvelope` and pushes it to the `EventBus` (e.g., `EventAttendanceCheckedIn`).
2. **Synchronous Dispatch**: The `SyncBus` immediately spawns a goroutine to execute registered subscribers without blocking the primary HTTP request.
3. **Future Extension**: The abstract allows pivoting from `SyncBus` to an asynchronous broker (Kafka/Redis) gracefully.

### Automation Pipeline
The `Automation Engine` bridges the internal PubSub to External Providers through configurable `automation_rules`.
- **Rule Example**: `WHEN ParticipantApproved THEN Trigger WhatsAppProvider to send approval_msg`.
- **Integration Providers**: External systems are strictly boxed into the `Provider` contract, preventing global SDK sprawl.
- **Observability**: Every integration attempt generates an `integration_logs` entry capturing `Status, Duration, Retries, and ErrorMessage` for strict auditing.

## Voting Domain
The core business capability of MUSKOM, designed around absolute integrity and auditability.
- **Session Lifecycle**: Admin-controlled state machine decoupled from the parent Event state. A `VotingSession` tracks distinct states (`NOT_STARTED`, `RUNNING`, `PAUSED`, `CLOSED`), ensuring voting can be temporarily paused for technical reasons.
- **Eligibility Validation**: A strict sequence verifies:
  1. Target Event has `voting_enabled = true`.
  2. Voting Session is `RUNNING`.
  3. Participant is `APPROVED` and `CHECKED_IN`.
  4. The exact `registration_id` does NOT already exist in the `votes` table.
- **Double-Vote Prevention**: Enforced fundamentally at the database level via a `UNIQUE(event_id, registration_id)` constraint, eliminating application-level race conditions.
- **Event Bus Dispatch**: Casting a vote synchronously inserts into DB and fires an `EventVoteSubmitted` Domain Event.
- **Anonymity vs Accountability**: Since Physical Booth setups are supported, an `OPERATOR` may technically execute the `CastVote` API. The Audit Log tracks the Operator JWT as the actor, while the actual `Vote` row binds to the Participant's `registration_id`, guaranteeing booth accountability.

## Reporting & Official Result Domain
Designed as a read-only aggregation layer, ensuring business rules remain within their respective authoritative domains.
- **Official Result Aggregation**: Calculates live statistics directly from the database schema:
  - `TotalRegistered`: Count of all `registrations` for the event.
  - `EligibleVoters`: Unique `registration_id` mapped in the `attendance` table (Check-Ins).
  - `TotalVotes`: Derived from the `votes` table.
  - `Abstain`: Implicitly calculated (`EligibleVoters` - `TotalVotes`), strictly preventing any DB mutations just for "Blank/Abstain" ballots while perfectly mapping to physical booth realities.
- **Export Architecture**: Features an abstract `Exporter` interface (`Export(ctx, reportType, format, data)`). The underlying HTTP handler (`GenerateExport`) logs the operation in `report_history`, guaranteeing a permanent audit trail for all downloaded artifacts.

## Notification Domain
The outbound communications engine, designed to reliably handle high volumes of messages without blocking standard HTTP API requests.
- **Provider Architecture**: Outbound channels (Email, WhatsApp, Telegram) are abstracted under a strict `Provider` interface. The `ProviderRegistry` allows the application to inject concrete or mock drivers dynamically at runtime.
- **Queue Lifecycle**:
  - `PENDING`: The initial state when a job is created by the application (e.g. via the `EventBus` triggering an email).
  - `PROCESSING`: Picked up by the background worker lock, preventing dual-sends.
  - `SENT`: The provider successfully dispatched the message. A `NotificationHistory` record is generated.
  - `FAILED`: The provider returned a fatal error, or retries exceeded. History is logged with the exact `error_message`.
- **Worker Process**: The background worker runs continuously in an isolated goroutine. It polls `notification_jobs` for `PENDING` states. This async approach guarantees that if an upstream API (like WhatsApp) goes down, the core MUSKOM event flow continues unaffected while messages queue safely.

## Operations Dashboard
The Dashboard (`dashboard` module) serves as a pure presentation layer designed using the Backend-For-Frontend (BFF) pattern.
- **Aggregation Layer**: Instead of forcing the frontend to execute 6 different `fetch()` calls for each domain widget (which causes waterfall loading and client overhead), the `dashboard` Go service directly queries the required domains concurrently on the server.
- **Data Source Map**:
  - `SummaryMetricsGrid` aggregates from Registration, Candidate, Attendance, Voting, and Notification tables.
  - `RecentActivityFeed` draws directly from `audit_logs`.
  - `QuickActionsPanel` provides central navigation to operational workflows.

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

## Audit Flow
The Audit Domain (`apps/api/internal/modules/audit`) provides a centralized, read-only system to track all mutations across MUSKOM RC2. 

### Core Concepts
1. **Immutability**: Audit logs are completely immutable. The `AuditRepository` intentionally omits `Update` or `Delete` methods.
2. **Schema Enhancements**: We extended the `audit_logs` table to explicitly store `actor_role` and `reason` alongside `metadata JSONB` for superior indexed querying.
3. **Decentralized Writes, Centralized Reads**: 
   - **Writes**: Domains like `Attendance` or `Voting` write to `audit_logs` using their own database transaction (`tx`) to guarantee ACID compliance when mutating state.
   - **Reads**: The `AuditService` acts as the universal read-layer, providing offset-pagination and filtering across all modules.

### Shared UI Components
The Audit domain provides reusable Next.js components for frontend developers:
- `AuditTimeline`: Visualizes a vertical history of events for a specific entity.
- `AuditTable` & `AuditFilterBar`: Standardized data grids for searching global system activity.
- `AuditDrawer`: Displays the raw `metadata JSONB` payloads for debugging system events.
