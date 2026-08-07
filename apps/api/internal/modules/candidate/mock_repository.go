package candidate

import (
	"context"
)

type MockRepository struct {
	CreateFunc                         func(ctx context.Context, candidate *Candidate) error
	GetByIDFunc                        func(ctx context.Context, id string) (*Candidate, error)
	FindAllFunc                        func(ctx context.Context) ([]Candidate, error)
	UpdateFunc                         func(ctx context.Context, candidate *Candidate) error
	DeleteFunc                         func(ctx context.Context, id string) error
	CountFunc                          func(ctx context.Context) (int, error)
	SaveDocumentFunc                   func(ctx context.Context, doc *CandidateDocument) error
	GetDocumentByIDFunc                func(ctx context.Context, id string) (*CandidateDocument, error)
	FindDocumentsByCandidateIDFunc     func(ctx context.Context, candidateID string) ([]CandidateDocument, error)
	DeleteDocumentFunc                 func(ctx context.Context, id string) error
	AdminListCandidatesFunc            func(ctx context.Context, statusFilter string, search string) ([]Candidate, error)
	AdminUpdateStatusFunc              func(ctx context.Context, id string, status string, notes *string) error
	AdminUpdateDocumentStatusFunc      func(ctx context.Context, docID string, status string, notes *string) error
	AdminUpdatePublicationStatusFunc   func(ctx context.Context, id string, status string) error
	AdminUpdatePublicationSettingsFunc func(ctx context.Context, id string, num *int, order int, bio, vis, mis, photo bool) error
	AdminReorderCandidatesFunc         func(ctx context.Context, items []ReorderCandidateItem) error
}

func (m *MockRepository) Create(ctx context.Context, candidate *Candidate) error {
	if m.CreateFunc != nil {
		return m.CreateFunc(ctx, candidate)
	}
	return nil
}

func (m *MockRepository) GetByID(ctx context.Context, id string) (*Candidate, error) {
	if m.GetByIDFunc != nil {
		return m.GetByIDFunc(ctx, id)
	}
	return nil, nil
}

func (m *MockRepository) FindAll(ctx context.Context) ([]Candidate, error) {
	if m.FindAllFunc != nil {
		return m.FindAllFunc(ctx)
	}
	return nil, nil
}

func (m *MockRepository) Update(ctx context.Context, candidate *Candidate) error {
	if m.UpdateFunc != nil {
		return m.UpdateFunc(ctx, candidate)
	}
	return nil
}

func (m *MockRepository) Delete(ctx context.Context, id string) error {
	if m.DeleteFunc != nil {
		return m.DeleteFunc(ctx, id)
	}
	return nil
}

func (m *MockRepository) Count(ctx context.Context) (int, error) {
	if m.CountFunc != nil {
		return m.CountFunc(ctx)
	}
	return 0, nil
}

func (m *MockRepository) SaveDocument(ctx context.Context, doc *CandidateDocument) error {
	if m.SaveDocumentFunc != nil {
		return m.SaveDocumentFunc(ctx, doc)
	}
	return nil
}

func (m *MockRepository) GetDocumentByID(ctx context.Context, id string) (*CandidateDocument, error) {
	if m.GetDocumentByIDFunc != nil {
		return m.GetDocumentByIDFunc(ctx, id)
	}
	return nil, nil
}

func (m *MockRepository) FindDocumentsByCandidateID(ctx context.Context, candidateID string) ([]CandidateDocument, error) {
	if m.FindDocumentsByCandidateIDFunc != nil {
		return m.FindDocumentsByCandidateIDFunc(ctx, candidateID)
	}
	return nil, nil
}

func (m *MockRepository) DeleteDocument(ctx context.Context, id string) error {
	if m.DeleteDocumentFunc != nil {
		return m.DeleteDocumentFunc(ctx, id)
	}
	return nil
}

func (m *MockRepository) AdminListCandidates(ctx context.Context, statusFilter string, search string) ([]Candidate, error) {
	if m.AdminListCandidatesFunc != nil {
		return m.AdminListCandidatesFunc(ctx, statusFilter, search)
	}
	return nil, nil
}

func (m *MockRepository) AdminUpdateStatus(ctx context.Context, id string, status string, notes *string) error {
	if m.AdminUpdateStatusFunc != nil {
		return m.AdminUpdateStatusFunc(ctx, id, status, notes)
	}
	return nil
}

func (m *MockRepository) AdminUpdateDocumentStatus(ctx context.Context, docID string, status string, notes *string) error {
	if m.AdminUpdateDocumentStatusFunc != nil {
		return m.AdminUpdateDocumentStatusFunc(ctx, docID, status, notes)
	}
	return nil
}

func (m *MockRepository) AdminUpdatePublicationStatus(ctx context.Context, id string, status string) error {
	if m.AdminUpdatePublicationStatusFunc != nil {
		return m.AdminUpdatePublicationStatusFunc(ctx, id, status)
	}
	return nil
}

func (m *MockRepository) AdminUpdatePublicationSettings(ctx context.Context, id string, num *int, order int, bio, vis, mis, photo bool) error {
	if m.AdminUpdatePublicationSettingsFunc != nil {
		return m.AdminUpdatePublicationSettingsFunc(ctx, id, num, order, bio, vis, mis, photo)
	}
	return nil
}

func (m *MockRepository) AdminReorderCandidates(ctx context.Context, items []ReorderCandidateItem) error {
	if m.AdminReorderCandidatesFunc != nil {
		return m.AdminReorderCandidatesFunc(ctx, items)
	}
	return nil
}

func (m *MockRepository) BulkDelete(ctx context.Context, ids []string) error {
	return nil
}
