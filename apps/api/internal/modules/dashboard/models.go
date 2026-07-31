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
	TotalParticipants    int `json:"total_participants"`
	ApprovedParticipants int `json:"approved_participants"`
	TotalCandidates      int `json:"total_candidates"`
	CheckedIn            int `json:"checked_in"`
	VotesCast            int `json:"votes_cast"`
	PendingNotifications int `json:"pending_notifications"`
}

type RecentActivity struct {
	ID        string    `json:"id"`
	Action    string    `json:"action"`
	Actor     string    `json:"actor"`
	Role      string    `json:"role"`
	Timestamp time.Time `json:"timestamp"`
}

type DashboardData struct {
	EventID        string           `json:"event_id"`
	Health         SystemHealth     `json:"health"`
	Status         EventStatus      `json:"status"`
	Summary        DashboardSummary `json:"summary"`
	RecentActivity []RecentActivity `json:"recent_activity"`
}
