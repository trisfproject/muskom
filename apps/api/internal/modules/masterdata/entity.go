package masterdata

import "time"

// ─── Industrial Area ──────────────────────────────────────────────────────────

type IndustrialArea struct {
	ID         string     `db:"id"         json:"id"`
	Name       string     `db:"name"       json:"name"`
	Code       *string    `db:"code"       json:"code,omitempty"`
	City       *string    `db:"city"       json:"city,omitempty"`
	Province   *string    `db:"province"   json:"province,omitempty"`
	IsActive   bool       `db:"is_active"  json:"is_active"`
	SortOrder  int        `db:"sort_order" json:"sort_order"`
	CreatedAt  time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt  time.Time  `db:"updated_at" json:"updated_at"`
	DeletedAt  *time.Time `db:"deleted_at" json:"-"`
}

type CreateIndustrialAreaRequest struct {
	Name      string  `json:"name"       validate:"required,max=255"`
	Code      *string `json:"code"`
	City      *string `json:"city"`
	Province  *string `json:"province"`
	IsActive  *bool   `json:"is_active"`
	SortOrder *int    `json:"sort_order"`
}

type UpdateIndustrialAreaRequest = CreateIndustrialAreaRequest

// ─── Company ──────────────────────────────────────────────────────────────────

type Company struct {
	ID               string     `db:"id"                 json:"id"`
	Name             string     `db:"name"               json:"name"`
	IndustrialAreaID *string    `db:"industrial_area_id" json:"industrial_area_id,omitempty"`
	IndustrialArea   *string    `db:"industrial_area"    json:"industrial_area,omitempty"`
	Address          *string    `db:"address"            json:"address,omitempty"`
	IsActive         bool       `db:"is_active"          json:"is_active"`
	CreatedAt        time.Time  `db:"created_at"         json:"created_at"`
	UpdatedAt        time.Time  `db:"updated_at"         json:"updated_at"`
	DeletedAt        *time.Time `db:"deleted_at"         json:"-"`
}

type CreateCompanyRequest struct {
	Name             string  `json:"name"               validate:"required,max=255"`
	IndustrialAreaID *string `json:"industrial_area_id"`
	Address          *string `json:"address"`
	IsActive         *bool   `json:"is_active"`
}

type UpdateCompanyRequest = CreateCompanyRequest

// ─── Job Title ────────────────────────────────────────────────────────────────

type JobTitle struct {
	ID        string     `db:"id"         json:"id"`
	Name      string     `db:"name"       json:"name"`
	SortOrder int        `db:"sort_order" json:"sort_order"`
	IsActive  bool       `db:"is_active"  json:"is_active"`
	CreatedAt time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt time.Time  `db:"updated_at" json:"updated_at"`
	DeletedAt *time.Time `db:"deleted_at" json:"-"`
}

type CreateJobTitleRequest struct {
	Name      string `json:"name"       validate:"required,max=255"`
	SortOrder *int   `json:"sort_order"`
	IsActive  *bool  `json:"is_active"`
}

type UpdateJobTitleRequest = CreateJobTitleRequest

// ─── Department ───────────────────────────────────────────────────────────────

type Department struct {
	ID        string     `db:"id"         json:"id"`
	Name      string     `db:"name"       json:"name"`
	IsActive  bool       `db:"is_active"  json:"is_active"`
	CreatedAt time.Time  `db:"created_at" json:"created_at"`
	UpdatedAt time.Time  `db:"updated_at" json:"updated_at"`
	DeletedAt *time.Time `db:"deleted_at" json:"-"`
}

type CreateDepartmentRequest struct {
	Name     string `json:"name"      validate:"required,max=255"`
	IsActive *bool  `json:"is_active"`
}

type UpdateDepartmentRequest = CreateDepartmentRequest

// ─── List/Filter Params ───────────────────────────────────────────────────────

type ListParams struct {
	Search   string `query:"search"`
	IsActive *bool  `query:"is_active"`
	AreaID   string `query:"area_id"` // for companies
	Page     int    `query:"page"`
	Limit    int    `query:"limit"`
}

type PaginatedResponse[T any] struct {
	Items []T `json:"items"`
	Total int `json:"total"`
	Page  int `json:"page"`
	Limit int `json:"limit"`
}
