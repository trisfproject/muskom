package reporting

import (
	"time"
)

type ReportType string
type FileFormat string

const (
	ReportOfficialResult   ReportType = "OFFICIAL_RESULT"
	ReportAttendanceSummary ReportType = "ATTENDANCE_SUMMARY"
	ReportParticipantList   ReportType = "PARTICIPANT_LIST"
	ReportCandidateList     ReportType = "CANDIDATE_LIST"
	
	FormatPDF  FileFormat = "PDF"
	FormatCSV  FileFormat = "CSV"
	FormatXLSX FileFormat = "XLSX"
	FormatJSON FileFormat = "JSON"
)

type ReportHistory struct {
	ID          string     `json:"id" db:"id"`
	EventID     string     `json:"event_id" db:"event_id"`
	ReportType  ReportType `json:"report_type" db:"report_type"`
	FileFormat  FileFormat `json:"file_format" db:"file_format"`
	GeneratedBy string     `json:"generated_by" db:"generated_by"`
	FileURL     string     `json:"file_url" db:"file_url"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
}

type CandidateResult struct {
	CandidateID string `json:"candidate_id"`
	Name        string `json:"name"`
	Number      int    `json:"number"`
	TotalVotes  int    `json:"total_votes"`
}

type OfficialResult struct {
	TotalRegistered      int               `json:"total_registered"`
	ApprovedParticipants int               `json:"approved_participants"`
	CheckedIn            int               `json:"checked_in"`
	EligibleVoters       int               `json:"eligible_voters"`
	TotalVotes           int               `json:"total_votes"`
	Abstain              int               `json:"abstain"`
	ParticipationPct     float64           `json:"participation_pct"`
	WinningCandidate     *CandidateResult  `json:"winning_candidate"`
	CandidateResults     []CandidateResult `json:"candidate_results"`
}
