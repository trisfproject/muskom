package reporting

import (
	"context"

	"go.uber.org/zap"
)

type Service interface {
	GetOfficialResult(ctx context.Context, eventID string) (*OfficialResult, error)
	GenerateExport(ctx context.Context, eventID, userID string, reportType ReportType, format FileFormat) (*ReportHistory, error)
	GetReportHistory(ctx context.Context, eventID string) ([]ReportHistory, error)
}

type service struct {
	repo     Repository
	exporter Exporter
	log      *zap.Logger
}

func NewService(repo Repository, exporter Exporter, log *zap.Logger) Service {
	return &service{repo: repo, exporter: exporter, log: log}
}

func (s *service) GetOfficialResult(ctx context.Context, eventID string) (*OfficialResult, error) {
	return s.repo.GetOfficialResult(ctx, eventID)
}

func (s *service) GenerateExport(ctx context.Context, eventID, userID string, reportType ReportType, format FileFormat) (*ReportHistory, error) {
	// 1. Fetch relevant data
	var data interface{}
	var err error

	if reportType == ReportOfficialResult {
		data, err = s.repo.GetOfficialResult(ctx, eventID)
		if err != nil {
			return nil, err
		}
	} else {
		// Other reports (Participant List, etc.) would query their respective Repos
		data = map[string]string{"mock": "data"}
	}

	// 2. Export File
	fileURL, err := s.exporter.Export(ctx, reportType, format, data)
	if err != nil {
		return nil, err
	}

	// 3. Log Generation
	history := &ReportHistory{
		EventID:     eventID,
		ReportType:  reportType,
		FileFormat:  format,
		GeneratedBy: userID,
		FileURL:     fileURL,
	}

	err = s.repo.LogReportGeneration(ctx, history)
	if err != nil {
		s.log.Error("Failed to log report history", zap.Error(err))
		// Non-fatal, file was generated
	}

	return history, nil
}

func (s *service) GetReportHistory(ctx context.Context, eventID string) ([]ReportHistory, error) {
	return s.repo.GetReportHistory(ctx, eventID)
}
