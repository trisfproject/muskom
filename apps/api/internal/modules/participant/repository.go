package participant

import (
	"context"
	"database/sql"
	"errors"

	"github.com/jmoiron/sqlx"
)

var (
	ErrNotFound     = errors.New("participant not found")
	ErrDuplicateReg = errors.New("registration number already exists")
)

type Repository interface {
	Create(ctx context.Context, p *Participant) error
	GetByID(ctx context.Context, id string) (*Participant, error)
	FindAll(ctx context.Context) ([]Participant, error)
	Update(ctx context.Context, p *Participant) error
	UpdateStatus(ctx context.Context, id string, status string) error
	Delete(ctx context.Context, id string) error
	BulkDelete(ctx context.Context, ids []string) error
	BulkUpdateStatus(ctx context.Context, ids []string, status string) error
	FindByEmail(ctx context.Context, email string) (*Participant, error)
	GetStats(ctx context.Context) (*ParticipantStats, error)
	Count(ctx context.Context) (int, error)
	CountActive(ctx context.Context) (int, error)
	GetRegistrationLimit(ctx context.Context) (*int, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) Create(ctx context.Context, p *Participant) error {
	query := `
		INSERT INTO participants (
			 registration_number, full_name, nickname, email, phone, 
			company_name, industrial_area, job_title, department, status
		) VALUES (
			:registration_number, :full_name, :nickname, :email, :phone, 
			:company_name, :industrial_area, :job_title, :department, :status
		) RETURNING id, created_at, updated_at
	`

	stmt, err := r.db.PrepareNamedContext(ctx, query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	err = stmt.GetContext(ctx, p, p)
	if err != nil {
		if err.Error() == "pq: duplicate key value violates unique constraint \"participants_registration_number_key\"" {
			return ErrDuplicateReg
		}
		return err
	}
	return nil
}

func (r *repository) GetByID(ctx context.Context, id string) (*Participant, error) {
	query := `SELECT * FROM participants WHERE id = $1 AND deleted_at IS NULL`
	var p Participant
	err := r.db.GetContext(ctx, &p, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &p, nil
}

func (r *repository) FindAll(ctx context.Context) ([]Participant, error) {
	query := `SELECT * FROM participants WHERE deleted_at IS NULL ORDER BY created_at DESC`
	var list []Participant
	err := r.db.SelectContext(ctx, &list, query)
	if err != nil {
		return nil, err
	}
	if list == nil {
		list = []Participant{}
	}
	return list, nil
}

func (r *repository) Update(ctx context.Context, p *Participant) error {
	query := `
		UPDATE participants SET
			registration_number = :registration_number,
			full_name = :full_name,
			nickname = :nickname,

			email = :email,
			phone = :phone,
			company_name = :company_name,
			industrial_area = :industrial_area,
			job_title = :job_title,
			department = :department,
			updated_at = NOW()
		WHERE id = :id AND deleted_at IS NULL
		RETURNING updated_at
	`

	stmt, err := r.db.PrepareNamedContext(ctx, query)
	if err != nil {
		return err
	}
	defer stmt.Close()

	err = stmt.GetContext(ctx, p, p)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		if err.Error() == "pq: duplicate key value violates unique constraint \"participants_registration_number_key\"" {
			return ErrDuplicateReg
		}
		return err
	}
	return nil
}

func (r *repository) UpdateStatus(ctx context.Context, id string, status string) error {
	query := `UPDATE participants SET status = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, status, id)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *repository) Delete(ctx context.Context, id string) error {
	query := `UPDATE participants SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}
	rows, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *repository) BulkDelete(ctx context.Context, ids []string) error {
	if len(ids) == 0 {
		return nil
	}
	query, args, err := sqlx.In(`UPDATE participants SET deleted_at = NOW() WHERE id IN (?) AND deleted_at IS NULL`, ids)
	if err != nil {
		return err
	}
	query = r.db.Rebind(query)
	_, err = r.db.ExecContext(ctx, query, args...)
	return err
}

func (r *repository) BulkUpdateStatus(ctx context.Context, ids []string, status string) error {
	if len(ids) == 0 {
		return nil
	}
	query, args, err := sqlx.In(`UPDATE participants SET status = ?, updated_at = NOW() WHERE id IN (?) AND deleted_at IS NULL`, status, ids)
	if err != nil {
		return err
	}
	query = r.db.Rebind(query)
	_, err = r.db.ExecContext(ctx, query, args...)
	return err
}

func (r *repository) FindByEmail(ctx context.Context, email string) (*Participant, error) {
	query := `SELECT * FROM participants WHERE email = $1 AND deleted_at IS NULL LIMIT 1`
	var p Participant
	err := r.db.GetContext(ctx, &p, query, email)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &p, nil
}

func (r *repository) GetStats(ctx context.Context) (*ParticipantStats, error) {
	stats := &ParticipantStats{
		ByIndustrialArea: []LabelCount{},
		ByCompany:        []LabelCount{},
		ByDate:           []DailyCount{},
		Recent:           []RecentParticipant{},
	}

	// Fetch Limit from active event
	var limit *int
	_ = r.db.GetContext(ctx, &limit, `
		SELECT s.registration_limit 
		FROM events e
		JOIN event_settings s ON e.id = s.event_id
		WHERE e.is_default_active = true AND e.deleted_at IS NULL
	`)
	stats.Limit = limit

	// 1. Summary counts (single query, avoid N+1)
	var rows []struct {
		Status string `db:"status"`
		Count  int    `db:"count"`
		Today  int    `db:"today"`
	}
	err := r.db.SelectContext(ctx, &rows, `
		SELECT
			status,
			COUNT(*) AS count,
			COUNT(*) FILTER (WHERE created_at::date = CURRENT_DATE) AS today
		FROM participants
		WHERE deleted_at IS NULL
		GROUP BY status
	`)
	if err != nil {
		return nil, err
	}
	for _, r := range rows {
		stats.Total += r.Count
		stats.Today += r.Today
		switch r.Status {
		case "Pending":
			stats.Pending = r.Count
		case "Verified":
			stats.Verified = r.Count
		case "Rejected":
			stats.Rejected = r.Count
		}
	}

	// 2. By Industrial Area (top 10)
	_ = r.db.SelectContext(ctx, &stats.ByIndustrialArea, `
		SELECT industrial_area AS label, COUNT(*) AS count
		FROM participants
		WHERE deleted_at IS NULL
		GROUP BY industrial_area
		ORDER BY count DESC
		LIMIT 10
	`)

	// 3. By Company (top 10)
	_ = r.db.SelectContext(ctx, &stats.ByCompany, `
		SELECT company_name AS label, COUNT(*) AS count
		FROM participants
		WHERE deleted_at IS NULL
		GROUP BY company_name
		ORDER BY count DESC
		LIMIT 10
	`)

	// 4. Registrations by date — last 14 days
	_ = r.db.SelectContext(ctx, &stats.ByDate, `
		SELECT
			TO_CHAR(created_at::date, 'YYYY-MM-DD') AS date,
			COUNT(*) AS count
		FROM participants
		WHERE deleted_at IS NULL
		  AND created_at >= CURRENT_DATE - INTERVAL '13 days'
		GROUP BY date
		ORDER BY date ASC
	`)

	// 5. 10 most recent participants
	_ = r.db.SelectContext(ctx, &stats.Recent, `
		SELECT id, registration_number, full_name, company_name, industrial_area, status, created_at
		FROM participants
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT 10
	`)

	return stats, nil
}

func (r *repository) Count(ctx context.Context) (int, error) {
	query := `SELECT COUNT(*) FROM participants WHERE deleted_at IS NULL`
	var count int
	err := r.db.GetContext(ctx, &count, query)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (r *repository) CountActive(ctx context.Context) (int, error) {
	query := `SELECT COUNT(*) FROM participants WHERE deleted_at IS NULL AND status != 'Rejected'`
	var count int
	err := r.db.GetContext(ctx, &count, query)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (r *repository) GetRegistrationLimit(ctx context.Context) (*int, error) {
	query := `SELECT registration_limit FROM event_settings LIMIT 1`
	var limit *int
	err := r.db.GetContext(ctx, &limit, query)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return limit, nil
}
