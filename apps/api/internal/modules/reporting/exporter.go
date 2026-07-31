package reporting

import (
	"context"
	"fmt"
)

type Exporter interface {
	Export(ctx context.Context, reportType ReportType, format FileFormat, data interface{}) (string, error)
}

type MockExporter struct{}

func NewMockExporter() Exporter {
	return &MockExporter{}
}

func (e *MockExporter) Export(ctx context.Context, reportType ReportType, format FileFormat, data interface{}) (string, error) {
	// In RC2, we mock the export logic.
	// In future sprints, this will use PDF generation libraries or CSV standard lib.
	mockURL := fmt.Sprintf("https://storage.muskom.app/exports/mock_%s.%s", reportType, format)
	return mockURL, nil
}
