package participant

import (
	"context"
	"sync"
	"testing"

	"github.com/google/uuid"
	"github.com/jmoiron/sqlx"
	"github.com/stretchr/testify/assert"
	"github.com/trisfproject/muskom/apps/api/internal/modules/audit"
)

type mockAuditService struct {
	mu           sync.Mutex
	asyncEntries []audit.AuditEntry
}

func (m *mockAuditService) LogActivityAsync(ctx context.Context, entry audit.AuditEntry) {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.asyncEntries = append(m.asyncEntries, entry)
}

func (m *mockAuditService) LogActivityTx(ctx context.Context, tx *sqlx.Tx, entry audit.AuditEntry) error {
	return nil
}

func (m *mockAuditService) Search(ctx context.Context, filter audit.AuditFilter, operatorID string) ([]audit.AuditEntry, int, error) {
	return nil, 0, nil
}

func (m *mockAuditService) GetByID(ctx context.Context, id string, operatorID string) (*audit.AuditEntry, error) {
	return nil, nil
}

type mockParticipantRepo struct {
	Repository
	bulkDeletedIDs []string
	deletedID      string
	getByIDFunc    func(id string) (*Participant, error)
}

func (m *mockParticipantRepo) BulkDelete(ctx context.Context, ids []string) error {
	m.bulkDeletedIDs = ids
	return nil
}

func (m *mockParticipantRepo) Delete(ctx context.Context, id string) error {
	m.deletedID = id
	return nil
}

func (m *mockParticipantRepo) GetByID(ctx context.Context, id string) (*Participant, error) {
	if m.getByIDFunc != nil {
		return m.getByIDFunc(id)
	}
	return &Participant{ID: id, FullName: "Test User"}, nil
}

func TestParticipantService_BulkDelete_Audit(t *testing.T) {
	mockAudit := &mockAuditService{}
	mockRepo := &mockParticipantRepo{}

	svc := &service{
		repo:         mockRepo,
		auditService: mockAudit,
	}

	ids := []string{uuid.New().String(), uuid.New().String()}
	err := svc.BulkDelete(context.Background(), ids)
	assert.NoError(t, err)
	assert.Equal(t, ids, mockRepo.bulkDeletedIDs)

	assert.Len(t, mockAudit.asyncEntries, 1)
	entry := mockAudit.asyncEntries[0]
	assert.Equal(t, audit.ModuleParticipant, entry.Module)
	assert.Equal(t, audit.AuditAction("BULK_DELETE"), entry.Action)
	assert.Empty(t, entry.EntityID, "EntityID must not be 'bulk' or invalid UUID for bulk delete")
	assert.NotEqual(t, "bulk", entry.EntityID)
}

func TestParticipantService_Delete_Audit(t *testing.T) {
	mockAudit := &mockAuditService{}
	mockRepo := &mockParticipantRepo{}

	svc := &service{
		repo:         mockRepo,
		auditService: mockAudit,
	}

	targetID := uuid.New().String()
	err := svc.Delete(context.Background(), targetID)
	assert.NoError(t, err)
	assert.Equal(t, targetID, mockRepo.deletedID)

	assert.Len(t, mockAudit.asyncEntries, 1)
	entry := mockAudit.asyncEntries[0]
	assert.Equal(t, audit.ModuleParticipant, entry.Module)
	assert.Equal(t, audit.AuditAction("DELETE"), entry.Action)
	assert.Equal(t, targetID, entry.EntityID, "Individual delete must maintain participant UUID")
}
