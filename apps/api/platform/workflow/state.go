package workflow

import (
	"context"
)

type State string
type Event string

// Standardized states for various entities
const (
	// Event States
	StateEventDraft                State = "DRAFT"
	StateEventPublished            State = "PUBLISHED"
	StateEventRegistrationOpen     State = "REGISTRATION_OPEN"
	StateEventRegistrationClosed   State = "REGISTRATION_CLOSED"
	StateEventCandidateVerification State = "CANDIDATE_VERIFICATION"
	StateEventCampaign             State = "CAMPAIGN"
	StateEventVoting               State = "VOTING"
	StateEventCompleted            State = "COMPLETED"
	StateEventArchived             State = "ARCHIVED"

	// Participant States
	StateParticipantPending   State = "PENDING"
	StateParticipantApproved  State = "APPROVED"
	StateParticipantRejected  State = "REJECTED"
	StateParticipantCheckedIn State = "CHECKED_IN"

	// Candidate States
	StateCandidatePending     State = "PENDING"
	StateCandidateVerified    State = "VERIFIED"
	StateCandidateRejected    State = "REJECTED"
	StateCandidateCampaigning State = "CAMPAIGNING"

	// Voting Session States
	StateVotingNotStarted State = "NOT_STARTED"
	StateVotingRunning    State = "RUNNING"
	StateVotingPaused     State = "PAUSED"
	StateVotingClosed     State = "CLOSED"
)

// TransitionValidator allows injecting custom business logic (e.g. checks if quota is exceeded)
type TransitionValidator func(ctx context.Context, entityID string) error

// Transition defines a valid path between two states
type Transition struct {
	From              State
	To                State
	Event             Event
	RequiredRole      []string // Which roles can trigger this? (Empty = any)
	RequiredPermission string  // Which RBAC permission is required?
	Validator         TransitionValidator
}

// Definition encapsulates all valid transitions for a specific domain entity
type Definition struct {
	EntityName  string
	Transitions []Transition
}
