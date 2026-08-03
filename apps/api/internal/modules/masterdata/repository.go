package masterdata

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
)

var (
	ErrNotFound  = errors.New("record not found")
	ErrDuplicate = errors.New("name already exists")
)

// ─── Repository Interface ─────────────────────────────────────────────────────

type Repository interface {
	// Industrial Areas
	ListIndustrialAreas(ctx context.Context, p ListParams) ([]IndustrialArea, int, error)
	GetIndustrialAreaByID(ctx context.Context, id string) (*IndustrialArea, error)
	CreateIndustrialArea(ctx context.Context, req CreateIndustrialAreaRequest) (*IndustrialArea, error)
	UpdateIndustrialArea(ctx context.Context, id string, req UpdateIndustrialAreaRequest) (*IndustrialArea, error)
	DeleteIndustrialArea(ctx context.Context, id string) error
	RestoreIndustrialArea(ctx context.Context, id string) error

	// Companies
	ListCompanies(ctx context.Context, p ListParams) ([]Company, int, error)
	GetCompanyByID(ctx context.Context, id string) (*Company, error)
	CreateCompany(ctx context.Context, req CreateCompanyRequest) (*Company, error)
	UpdateCompany(ctx context.Context, id string, req UpdateCompanyRequest) (*Company, error)
	DeleteCompany(ctx context.Context, id string) error
	RestoreCompany(ctx context.Context, id string) error

	// Job Titles
	ListJobTitles(ctx context.Context, p ListParams) ([]JobTitle, int, error)
	GetJobTitleByID(ctx context.Context, id string) (*JobTitle, error)
	CreateJobTitle(ctx context.Context, req CreateJobTitleRequest) (*JobTitle, error)
	UpdateJobTitle(ctx context.Context, id string, req UpdateJobTitleRequest) (*JobTitle, error)
	DeleteJobTitle(ctx context.Context, id string) error
	RestoreJobTitle(ctx context.Context, id string) error

	// Departments
	ListDepartments(ctx context.Context, p ListParams) ([]Department, int, error)
	GetDepartmentByID(ctx context.Context, id string) (*Department, error)
	CreateDepartment(ctx context.Context, req CreateDepartmentRequest) (*Department, error)
	UpdateDepartment(ctx context.Context, id string, req UpdateDepartmentRequest) (*Department, error)
	DeleteDepartment(ctx context.Context, id string) error
	RestoreDepartment(ctx context.Context, id string) error
}

// ─── Implementation ───────────────────────────────────────────────────────────

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

func defaultPage(p *ListParams) {
	if p.Page < 1 {
		p.Page = 1
	}
	if p.Limit < 1 || p.Limit > 200 {
		p.Limit = 50
	}
}

func offset(p ListParams) int {
	return (p.Page - 1) * p.Limit
}

// isDuplicateError checks for postgres unique constraint violation.
func isDuplicateError(err error) bool {
	return err != nil && strings.Contains(err.Error(), "unique constraint")
}

// ─── Industrial Areas ─────────────────────────────────────────────────────────

func (r *repository) ListIndustrialAreas(ctx context.Context, p ListParams) ([]IndustrialArea, int, error) {
	defaultPage(&p)

	where := []string{}
	args := []interface{}{}
	i := 1

	if p.IsActive != nil {
		where = append(where, fmt.Sprintf("is_active = $%d", i))
		args = append(args, *p.IsActive)
		i++
	} else {
		// Admin list includes soft-deleted (show all non-deleted)
		where = append(where, "deleted_at IS NULL")
	}

	if p.Search != "" {
		where = append(where, fmt.Sprintf("(name ILIKE $%d OR code ILIKE $%d OR city ILIKE $%d)", i, i, i))
		args = append(args, "%"+p.Search+"%")
		i++
	}

	clause := ""
	if len(where) > 0 {
		clause = "WHERE " + strings.Join(where, " AND ")
	}

	var total int
	countQ := fmt.Sprintf("SELECT COUNT(*) FROM master_industrial_areas %s", clause)
	if err := r.db.GetContext(ctx, &total, countQ, args...); err != nil {
		return nil, 0, err
	}

	args = append(args, p.Limit, offset(p))
	q := fmt.Sprintf(`SELECT * FROM master_industrial_areas %s ORDER BY sort_order ASC, name ASC LIMIT $%d OFFSET $%d`, clause, i, i+1)

	var items []IndustrialArea
	if err := r.db.SelectContext(ctx, &items, q, args...); err != nil {
		return nil, 0, err
	}
	if items == nil {
		items = []IndustrialArea{}
	}
	return items, total, nil
}

func (r *repository) GetIndustrialAreaByID(ctx context.Context, id string) (*IndustrialArea, error) {
	var item IndustrialArea
	err := r.db.GetContext(ctx, &item, `SELECT * FROM master_industrial_areas WHERE id = $1`, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &item, err
}

func (r *repository) CreateIndustrialArea(ctx context.Context, req CreateIndustrialAreaRequest) (*IndustrialArea, error) {
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}
	sortOrder := 0
	if req.SortOrder != nil {
		sortOrder = *req.SortOrder
	}
	var item IndustrialArea
	err := r.db.GetContext(ctx, &item, `
		INSERT INTO master_industrial_areas (name, code, city, province, is_active, sort_order)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING *
	`, req.Name, req.Code, req.City, req.Province, isActive, sortOrder)
	if isDuplicateError(err) {
		return nil, ErrDuplicate
	}
	return &item, err
}

func (r *repository) UpdateIndustrialArea(ctx context.Context, id string, req UpdateIndustrialAreaRequest) (*IndustrialArea, error) {
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}
	sortOrder := 0
	if req.SortOrder != nil {
		sortOrder = *req.SortOrder
	}
	var item IndustrialArea
	err := r.db.GetContext(ctx, &item, `
		UPDATE master_industrial_areas SET name=$1, code=$2, city=$3, province=$4, is_active=$5, sort_order=$6, updated_at=NOW()
		WHERE id=$7 AND deleted_at IS NULL RETURNING *
	`, req.Name, req.Code, req.City, req.Province, isActive, sortOrder, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if isDuplicateError(err) {
		return nil, ErrDuplicate
	}
	return &item, err
}

func (r *repository) DeleteIndustrialArea(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, `UPDATE master_industrial_areas SET deleted_at=NOW(), is_active=false, updated_at=NOW() WHERE id=$1 AND deleted_at IS NULL`, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *repository) RestoreIndustrialArea(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, `UPDATE master_industrial_areas SET deleted_at=NULL, is_active=true, updated_at=NOW() WHERE id=$1 AND deleted_at IS NOT NULL`, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// ─── Companies ────────────────────────────────────────────────────────────────

func (r *repository) ListCompanies(ctx context.Context, p ListParams) ([]Company, int, error) {
	defaultPage(&p)

	where := []string{}
	args := []interface{}{}
	i := 1

	if p.IsActive != nil {
		where = append(where, fmt.Sprintf("c.is_active = $%d", i))
		args = append(args, *p.IsActive)
		i++
	} else {
		where = append(where, "c.deleted_at IS NULL")
	}

	if p.AreaID != "" {
		where = append(where, fmt.Sprintf("c.industrial_area_id = $%d", i))
		args = append(args, p.AreaID)
		i++
	}

	if p.Search != "" {
		where = append(where, fmt.Sprintf("(c.name ILIKE $%d OR mia.name ILIKE $%d)", i, i))
		args = append(args, "%"+p.Search+"%")
		i++
	}

	clause := ""
	if len(where) > 0 {
		clause = "WHERE " + strings.Join(where, " AND ")
	}

	var total int
	countQ := fmt.Sprintf(`SELECT COUNT(*) FROM master_companies c LEFT JOIN master_industrial_areas mia ON c.industrial_area_id = mia.id %s`, clause)
	if err := r.db.GetContext(ctx, &total, countQ, args...); err != nil {
		return nil, 0, err
	}

	args = append(args, p.Limit, offset(p))
	q := fmt.Sprintf(`
		SELECT c.*, mia.name AS industrial_area
		FROM master_companies c
		LEFT JOIN master_industrial_areas mia ON c.industrial_area_id = mia.id
		%s
		ORDER BY c.name ASC
		LIMIT $%d OFFSET $%d
	`, clause, i, i+1)

	var items []Company
	if err := r.db.SelectContext(ctx, &items, q, args...); err != nil {
		return nil, 0, err
	}
	if items == nil {
		items = []Company{}
	}
	return items, total, nil
}

func (r *repository) GetCompanyByID(ctx context.Context, id string) (*Company, error) {
	var item Company
	err := r.db.GetContext(ctx, &item, `
		SELECT c.*, mia.name AS industrial_area
		FROM master_companies c
		LEFT JOIN master_industrial_areas mia ON c.industrial_area_id = mia.id
		WHERE c.id = $1
	`, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &item, err
}

func (r *repository) CreateCompany(ctx context.Context, req CreateCompanyRequest) (*Company, error) {
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}
	var item Company
	err := r.db.GetContext(ctx, &item, `
		INSERT INTO master_companies (name, industrial_area_id, address, is_active)
		VALUES ($1, $2, $3, $4) RETURNING *
	`, req.Name, req.IndustrialAreaID, req.Address, isActive)
	if isDuplicateError(err) {
		return nil, ErrDuplicate
	}
	return &item, err
}

func (r *repository) UpdateCompany(ctx context.Context, id string, req UpdateCompanyRequest) (*Company, error) {
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}
	var item Company
	err := r.db.GetContext(ctx, &item, `
		UPDATE master_companies SET name=$1, industrial_area_id=$2, address=$3, is_active=$4, updated_at=NOW()
		WHERE id=$5 AND deleted_at IS NULL RETURNING *
	`, req.Name, req.IndustrialAreaID, req.Address, isActive, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &item, err
}

func (r *repository) DeleteCompany(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, `UPDATE master_companies SET deleted_at=NOW(), is_active=false, updated_at=NOW() WHERE id=$1 AND deleted_at IS NULL`, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *repository) RestoreCompany(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, `UPDATE master_companies SET deleted_at=NULL, is_active=true, updated_at=NOW() WHERE id=$1 AND deleted_at IS NOT NULL`, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// ─── Job Titles ───────────────────────────────────────────────────────────────

func (r *repository) ListJobTitles(ctx context.Context, p ListParams) ([]JobTitle, int, error) {
	defaultPage(&p)

	where := []string{}
	args := []interface{}{}
	i := 1

	if p.IsActive != nil {
		where = append(where, fmt.Sprintf("is_active = $%d", i))
		args = append(args, *p.IsActive)
		i++
	} else {
		where = append(where, "deleted_at IS NULL")
	}

	if p.Search != "" {
		where = append(where, fmt.Sprintf("name ILIKE $%d", i))
		args = append(args, "%"+p.Search+"%")
		i++
	}

	clause := ""
	if len(where) > 0 {
		clause = "WHERE " + strings.Join(where, " AND ")
	}

	var total int
	if err := r.db.GetContext(ctx, &total, fmt.Sprintf("SELECT COUNT(*) FROM master_job_titles %s", clause), args...); err != nil {
		return nil, 0, err
	}

	args = append(args, p.Limit, offset(p))
	var items []JobTitle
	if err := r.db.SelectContext(ctx, &items, fmt.Sprintf(`SELECT * FROM master_job_titles %s ORDER BY sort_order ASC, name ASC LIMIT $%d OFFSET $%d`, clause, i, i+1), args...); err != nil {
		return nil, 0, err
	}
	if items == nil {
		items = []JobTitle{}
	}
	return items, total, nil
}

func (r *repository) GetJobTitleByID(ctx context.Context, id string) (*JobTitle, error) {
	var item JobTitle
	err := r.db.GetContext(ctx, &item, `SELECT * FROM master_job_titles WHERE id = $1`, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &item, err
}

func (r *repository) CreateJobTitle(ctx context.Context, req CreateJobTitleRequest) (*JobTitle, error) {
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}
	sortOrder := 0
	if req.SortOrder != nil {
		sortOrder = *req.SortOrder
	}
	var item JobTitle
	err := r.db.GetContext(ctx, &item, `
		INSERT INTO master_job_titles (name, sort_order, is_active) VALUES ($1, $2, $3) RETURNING *
	`, req.Name, sortOrder, isActive)
	if isDuplicateError(err) {
		return nil, ErrDuplicate
	}
	return &item, err
}

func (r *repository) UpdateJobTitle(ctx context.Context, id string, req UpdateJobTitleRequest) (*JobTitle, error) {
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}
	sortOrder := 0
	if req.SortOrder != nil {
		sortOrder = *req.SortOrder
	}
	var item JobTitle
	err := r.db.GetContext(ctx, &item, `
		UPDATE master_job_titles SET name=$1, sort_order=$2, is_active=$3, updated_at=NOW()
		WHERE id=$4 AND deleted_at IS NULL RETURNING *
	`, req.Name, sortOrder, isActive, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if isDuplicateError(err) {
		return nil, ErrDuplicate
	}
	return &item, err
}

func (r *repository) DeleteJobTitle(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, `UPDATE master_job_titles SET deleted_at=NOW(), is_active=false, updated_at=NOW() WHERE id=$1 AND deleted_at IS NULL`, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *repository) RestoreJobTitle(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, `UPDATE master_job_titles SET deleted_at=NULL, is_active=true, updated_at=NOW() WHERE id=$1 AND deleted_at IS NOT NULL`, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// ─── Departments ──────────────────────────────────────────────────────────────

func (r *repository) ListDepartments(ctx context.Context, p ListParams) ([]Department, int, error) {
	defaultPage(&p)

	where := []string{}
	args := []interface{}{}
	i := 1

	if p.IsActive != nil {
		where = append(where, fmt.Sprintf("is_active = $%d", i))
		args = append(args, *p.IsActive)
		i++
	} else {
		where = append(where, "deleted_at IS NULL")
	}

	if p.Search != "" {
		where = append(where, fmt.Sprintf("name ILIKE $%d", i))
		args = append(args, "%"+p.Search+"%")
		i++
	}

	clause := ""
	if len(where) > 0 {
		clause = "WHERE " + strings.Join(where, " AND ")
	}

	var total int
	if err := r.db.GetContext(ctx, &total, fmt.Sprintf("SELECT COUNT(*) FROM master_departments %s", clause), args...); err != nil {
		return nil, 0, err
	}

	args = append(args, p.Limit, offset(p))
	var items []Department
	if err := r.db.SelectContext(ctx, &items, fmt.Sprintf(`SELECT * FROM master_departments %s ORDER BY name ASC LIMIT $%d OFFSET $%d`, clause, i, i+1), args...); err != nil {
		return nil, 0, err
	}
	if items == nil {
		items = []Department{}
	}
	return items, total, nil
}

func (r *repository) GetDepartmentByID(ctx context.Context, id string) (*Department, error) {
	var item Department
	err := r.db.GetContext(ctx, &item, `SELECT * FROM master_departments WHERE id = $1`, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	return &item, err
}

func (r *repository) CreateDepartment(ctx context.Context, req CreateDepartmentRequest) (*Department, error) {
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}
	var item Department
	err := r.db.GetContext(ctx, &item, `
		INSERT INTO master_departments (name, is_active) VALUES ($1, $2) RETURNING *
	`, req.Name, isActive)
	if isDuplicateError(err) {
		return nil, ErrDuplicate
	}
	return &item, err
}

func (r *repository) UpdateDepartment(ctx context.Context, id string, req UpdateDepartmentRequest) (*Department, error) {
	isActive := true
	if req.IsActive != nil {
		isActive = *req.IsActive
	}
	var item Department
	err := r.db.GetContext(ctx, &item, `
		UPDATE master_departments SET name=$1, is_active=$2, updated_at=NOW()
		WHERE id=$3 AND deleted_at IS NULL RETURNING *
	`, req.Name, isActive, id)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if isDuplicateError(err) {
		return nil, ErrDuplicate
	}
	return &item, err
}

func (r *repository) DeleteDepartment(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, `UPDATE master_departments SET deleted_at=NOW(), is_active=false, updated_at=NOW() WHERE id=$1 AND deleted_at IS NULL`, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *repository) RestoreDepartment(ctx context.Context, id string) error {
	res, err := r.db.ExecContext(ctx, `UPDATE master_departments SET deleted_at=NULL, is_active=true, updated_at=NOW() WHERE id=$1 AND deleted_at IS NOT NULL`, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}
