package dashboard

import "time"

type SystemHealth struct {
	APIStatus      string `json:"api_status"`
	DatabaseStatus string `json:"database_status"`
	WorkerStatus   string `json:"worker_status"`
}

type EventStatus struct {
	Phase              string `json:"phase"`
	RegistrationOpen   bool   `json:"registration_open"`
	VerificationActive bool   `json:"verification_active"`
	VotingSessionState string `json:"voting_session_state"`
}

type DashboardSummary struct {
	TotalParticipants    int      `json:"total_participants"`
	ApprovedParticipants int      `json:"approved_participants"` // Verified/Approved count
	PendingParticipants  int      `json:"pending_participants"`
	RejectedParticipants int      `json:"rejected_participants"`
	WaitingList          int      `json:"waiting_list"`
	ParticipantLimit     *int     `json:"participant_limit"`
	WaitingListCapacity  *int     `json:"waiting_list_capacity"`
	CapacityMode         string   `json:"capacity_mode"`
	RemainingCapacity    *int     `json:"remaining_capacity"`
	WaitingListRemaining *int     `json:"waiting_list_remaining"`
	CapacityPercentage   float64  `json:"capacity_percentage"`
	CapacityStatus       string   `json:"capacity_status"`
	TotalCandidates      int      `json:"total_candidates"`
	CheckedIn            int      `json:"checked_in"`
	VotesCast            int      `json:"votes_cast"`
	PendingNotifications int      `json:"pending_notifications"`
}

type RecentActivity struct {
	ID        string    `json:"id"`
	Action    string    `json:"action"`
	Actor     *string   `json:"actor"`
	Role      *string   `json:"role"`
	Timestamp time.Time `json:"timestamp"`
}

type DashboardData struct {
	EventID        string           `json:"event_id"`
	Health         SystemHealth     `json:"health"`
	Status         EventStatus      `json:"status"`
	Summary        DashboardSummary `json:"summary"`
	RecentActivity []RecentActivity `json:"recent_activity"`
}

type ParticipantStats struct {
	Total                int    `json:"total"`
	Verified             int    `json:"verified"`
	Pending              int    `json:"pending"`
	Rejected             int    `json:"rejected"`
	WaitingList          int    `json:"waiting_list"`
	Limit                *int   `json:"limit"`
	CapacityMode         string `json:"capacity_mode"`
	RemainingCapacity    *int   `json:"remaining_capacity"`
	WaitingListCapacity  *int   `json:"waiting_list_capacity"`
	WaitingListRemaining *int   `json:"waiting_list_remaining"`
}

type CandidateStats struct {
	Total     int `json:"total"`
	Published int `json:"published"`
}

type AttendanceStats struct {
	Present    int     `json:"present"`
	Absent     int     `json:"absent"`
	Percentage float64 `json:"percentage"`
}

type VotingStats struct {
	SessionState     string `json:"session_state"`
	VotesSubmitted   int    `json:"votes_submitted"`
	RemainingVoters  int    `json:"remaining_voters"`
	NotYetVoted      int    `json:"not_yet_voted"`
	ReceiptsCount    int    `json:"receipts_count"`
	BallotsCount     int    `json:"ballots_count"`
	ReconciliationOK bool   `json:"reconciliation_ok"`

	// Operational failure counters (from Redis)
	AuthFailures int64 `json:"auth_failures"`
	RateLimited  int64 `json:"rate_limited"`
	VoteFailures int64 `json:"vote_failures"`
	AlreadyVoted int64 `json:"already_voted"`
}

type SystemHealthStats struct {
	API      string `json:"api"`
	Database string `json:"database"`
	Redis    string `json:"redis"`
	Storage  string `json:"storage"`
	SMTP     string `json:"smtp"`
}

type PendingRegistration struct {
	ID                 string    `json:"id" db:"id"`
	RegistrationNumber *string   `json:"registration_number" db:"registration_number"`
	FullName           string    `json:"full_name" db:"full_name"`
	Email              string    `json:"email" db:"email"`
	Status             string    `json:"status" db:"status"`
	CreatedAt          time.Time `json:"created_at" db:"created_at"`
}

type PendingCandidate struct {
	ID                string  `json:"id" db:"id"`
	Name              string  `json:"name" db:"name"`
	PhotoURL          *string `json:"photo_url" db:"photo_url"`
	Status            string  `json:"status" db:"status"`
	PublicationStatus string  `json:"publication_status" db:"publication_status"`
}

type OperationsDashboardData struct {
	PendingRegistrations      []PendingRegistration `json:"pending_registrations"`
	PendingCandidates         []PendingCandidate    `json:"pending_candidates"`
	Attendance                AttendanceStats       `json:"attendance"`
	Voting                    VotingStats           `json:"voting"`
	SystemHealth              SystemHealthStats     `json:"system_health"`
	RecentActivity            []RecentActivity      `json:"recent_activity"`
	CandidateRegistrationOpen bool                  `json:"candidate_registration_open"`
}
