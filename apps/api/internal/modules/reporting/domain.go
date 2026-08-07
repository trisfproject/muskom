package reporting

import (
	"context"
	"time"
)

// ReportConfig defines parameters for a generated report
type ReportConfig struct {
	EventID     string `json:"event_id"`
	ReportType  string `json:"report_type"` // ATTENDANCE, VOTING, AUDIT
	Format      string `json:"format"`      // PDF, XLSX, CSV
	GeneratedBy string `json:"generated_by"`
}

// ReportResult contains the generated file data
type ReportResult struct {
	ID          string `json:"id"`
	Config      ReportConfig
	DownloadURL string    `json:"download_url"`
	CreatedAt   time.Time `json:"created_at"`
	FileSize    int64     `json:"file_size"`
}

// ReportingService defines the logic for generating reports
type ReportingService interface {
	Generate(ctx context.Context, config ReportConfig) (*ReportResult, error)
	Preview(ctx context.Context, config ReportConfig) ([]byte, error)
	Download(ctx context.Context, reportID string) ([]byte, error)
	History(ctx context.Context, eventID string) ([]ReportResult, error)
}
