package masterdata

import (
	"context"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
)

// ─── Service Interface ────────────────────────────────────────────────────────

type Service interface {
	// Industrial Areas
	ListIndustrialAreas(ctx context.Context, p ListParams) (*PaginatedResponse[IndustrialArea], error)
	GetIndustrialAreaByID(ctx context.Context, id string) (*IndustrialArea, error)
	CreateIndustrialArea(ctx context.Context, req CreateIndustrialAreaRequest) (*IndustrialArea, error)
	UpdateIndustrialArea(ctx context.Context, id string, req UpdateIndustrialAreaRequest) (*IndustrialArea, error)
	DeleteIndustrialArea(ctx context.Context, id string) error
	RestoreIndustrialArea(ctx context.Context, id string) error

	// Companies
	ListCompanies(ctx context.Context, p ListParams) (*PaginatedResponse[Company], error)
	GetCompanyByID(ctx context.Context, id string) (*Company, error)
	CreateCompany(ctx context.Context, req CreateCompanyRequest) (*Company, error)
	UpdateCompany(ctx context.Context, id string, req UpdateCompanyRequest) (*Company, error)
	DeleteCompany(ctx context.Context, id string) error
	RestoreCompany(ctx context.Context, id string) error

	// Job Titles
	ListJobTitles(ctx context.Context, p ListParams) (*PaginatedResponse[JobTitle], error)
	GetJobTitleByID(ctx context.Context, id string) (*JobTitle, error)
	CreateJobTitle(ctx context.Context, req CreateJobTitleRequest) (*JobTitle, error)
	UpdateJobTitle(ctx context.Context, id string, req UpdateJobTitleRequest) (*JobTitle, error)
	DeleteJobTitle(ctx context.Context, id string) error
	RestoreJobTitle(ctx context.Context, id string) error

	// Departments
	ListDepartments(ctx context.Context, p ListParams) (*PaginatedResponse[Department], error)
	GetDepartmentByID(ctx context.Context, id string) (*Department, error)
	CreateDepartment(ctx context.Context, req CreateDepartmentRequest) (*Department, error)
	UpdateDepartment(ctx context.Context, id string, req UpdateDepartmentRequest) (*Department, error)
	DeleteDepartment(ctx context.Context, id string) error
	RestoreDepartment(ctx context.Context, id string) error
}

// ─── Service Implementation ───────────────────────────────────────────────────

type service struct {
	repo Repository
	log  *zap.Logger
}

func NewService(db *sqlx.DB, log *zap.Logger) Service {
	return &service{
		repo: NewRepository(db),
		log:  log,
	}
}

// ─── Industrial Areas ─────────────────────────────────────────────────────────

func (s *service) ListIndustrialAreas(ctx context.Context, p ListParams) (*PaginatedResponse[IndustrialArea], error) {
	items, total, err := s.repo.ListIndustrialAreas(ctx, p)
	if err != nil {
		return nil, err
	}
	return &PaginatedResponse[IndustrialArea]{Items: items, Total: total, Page: p.Page, Limit: p.Limit}, nil
}

func (s *service) GetIndustrialAreaByID(ctx context.Context, id string) (*IndustrialArea, error) {
	return s.repo.GetIndustrialAreaByID(ctx, id)
}

func (s *service) CreateIndustrialArea(ctx context.Context, req CreateIndustrialAreaRequest) (*IndustrialArea, error) {
	return s.repo.CreateIndustrialArea(ctx, req)
}

func (s *service) UpdateIndustrialArea(ctx context.Context, id string, req UpdateIndustrialAreaRequest) (*IndustrialArea, error) {
	return s.repo.UpdateIndustrialArea(ctx, id, req)
}

func (s *service) DeleteIndustrialArea(ctx context.Context, id string) error {
	return s.repo.DeleteIndustrialArea(ctx, id)
}

func (s *service) RestoreIndustrialArea(ctx context.Context, id string) error {
	return s.repo.RestoreIndustrialArea(ctx, id)
}

// ─── Companies ────────────────────────────────────────────────────────────────

func (s *service) ListCompanies(ctx context.Context, p ListParams) (*PaginatedResponse[Company], error) {
	items, total, err := s.repo.ListCompanies(ctx, p)
	if err != nil {
		return nil, err
	}
	return &PaginatedResponse[Company]{Items: items, Total: total, Page: p.Page, Limit: p.Limit}, nil
}

func (s *service) GetCompanyByID(ctx context.Context, id string) (*Company, error) {
	return s.repo.GetCompanyByID(ctx, id)
}

func (s *service) CreateCompany(ctx context.Context, req CreateCompanyRequest) (*Company, error) {
	return s.repo.CreateCompany(ctx, req)
}

func (s *service) UpdateCompany(ctx context.Context, id string, req UpdateCompanyRequest) (*Company, error) {
	return s.repo.UpdateCompany(ctx, id, req)
}

func (s *service) DeleteCompany(ctx context.Context, id string) error {
	return s.repo.DeleteCompany(ctx, id)
}

func (s *service) RestoreCompany(ctx context.Context, id string) error {
	return s.repo.RestoreCompany(ctx, id)
}

// ─── Job Titles ───────────────────────────────────────────────────────────────

func (s *service) ListJobTitles(ctx context.Context, p ListParams) (*PaginatedResponse[JobTitle], error) {
	items, total, err := s.repo.ListJobTitles(ctx, p)
	if err != nil {
		return nil, err
	}
	return &PaginatedResponse[JobTitle]{Items: items, Total: total, Page: p.Page, Limit: p.Limit}, nil
}

func (s *service) GetJobTitleByID(ctx context.Context, id string) (*JobTitle, error) {
	return s.repo.GetJobTitleByID(ctx, id)
}

func (s *service) CreateJobTitle(ctx context.Context, req CreateJobTitleRequest) (*JobTitle, error) {
	return s.repo.CreateJobTitle(ctx, req)
}

func (s *service) UpdateJobTitle(ctx context.Context, id string, req UpdateJobTitleRequest) (*JobTitle, error) {
	return s.repo.UpdateJobTitle(ctx, id, req)
}

func (s *service) DeleteJobTitle(ctx context.Context, id string) error {
	return s.repo.DeleteJobTitle(ctx, id)
}

func (s *service) RestoreJobTitle(ctx context.Context, id string) error {
	return s.repo.RestoreJobTitle(ctx, id)
}

// ─── Departments ──────────────────────────────────────────────────────────────

func (s *service) ListDepartments(ctx context.Context, p ListParams) (*PaginatedResponse[Department], error) {
	items, total, err := s.repo.ListDepartments(ctx, p)
	if err != nil {
		return nil, err
	}
	return &PaginatedResponse[Department]{Items: items, Total: total, Page: p.Page, Limit: p.Limit}, nil
}

func (s *service) GetDepartmentByID(ctx context.Context, id string) (*Department, error) {
	return s.repo.GetDepartmentByID(ctx, id)
}

func (s *service) CreateDepartment(ctx context.Context, req CreateDepartmentRequest) (*Department, error) {
	return s.repo.CreateDepartment(ctx, req)
}

func (s *service) UpdateDepartment(ctx context.Context, id string, req UpdateDepartmentRequest) (*Department, error) {
	return s.repo.UpdateDepartment(ctx, id, req)
}

func (s *service) DeleteDepartment(ctx context.Context, id string) error {
	return s.repo.DeleteDepartment(ctx, id)
}

func (s *service) RestoreDepartment(ctx context.Context, id string) error {
	return s.repo.RestoreDepartment(ctx, id)
}
