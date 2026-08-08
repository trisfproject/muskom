package participant

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"strings"

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
	CountVerified(ctx context.Context) (int, error)
	GetCapacitySettings(ctx context.Context) (limit int, mode string, err error)
	GetRegistrationLimit(ctx context.Context) (*int, error)
	LookupPublic(ctx context.Context, query string) (*Participant, error)
	ExecuteTx(ctx context.Context, fn func(tx *sqlx.Tx) error) error
	GetByIDTx(ctx context.Context, tx *sqlx.Tx, id string) (*Participant, error)
	UpdateStatusAndNumberTx(ctx context.Context, tx *sqlx.Tx, id string, status string, regNum string) error
	GetMaxOfficialRegistrationNumberTx(ctx context.Context, tx *sqlx.Tx) (int, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

// participantSelect is the common SELECT clause to map registrations+persons to Participant
const participantSelect = `
	SELECT 
		r.id, 
		COALESCE(r.registration_number, '') AS registration_number, 
		p.full_name, 
		NULL AS nickname, 
		p.email, 
		COALESCE(p.phone, '') AS phone, 
		COALESCE(p.company, '') AS company_name, 
		COALESCE(r.region, '') AS industrial_area, 
		COALESCE(p.job_title, '') AS job_title, 
		COALESCE(r.community, '') AS department, 
		r.status, 
		r.created_at, 
		r.updated_at
	FROM registrations r
	JOIN persons p ON r.person_id = p.id
`

func (r *repository) Create(ctx context.Context, p *Participant) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// 1. Insert person
	var personID string
	personQuery := `
		INSERT INTO persons (full_name, email, phone, company, job_title, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
		ON CONFLICT (email) DO UPDATE SET
			full_name = EXCLUDED.full_name,
			phone = EXCLUDED.phone,
			company = EXCLUDED.company,
			job_title = EXCLUDED.job_title,
			updated_at = NOW()
		RETURNING id
	`
	err = tx.QueryRowContext(ctx, personQuery, p.FullName, p.Email, p.Phone, p.CompanyName, p.JobTitle).Scan(&personID)
	if err != nil {
		return err
	}

	// 2. Insert registration
	regQuery := `
		INSERT INTO registrations (
			person_id, participant_category, source, status, 
			registration_number, region, community, created_at, updated_at
		) VALUES (
			$1, 'DELEGATE', 'ADMIN', $2, 
			NULLIF($3, ''), $4, $5, NOW(), NOW()
		) RETURNING id, created_at, updated_at
	`
	err = tx.QueryRowContext(ctx, regQuery, personID, p.Status, p.RegistrationNumber, p.IndustrialArea, p.Department).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
	if err != nil {
		if strings.Contains(err.Error(), "registrations_registration_number_key") {
			return ErrDuplicateReg
		}
		return err
	}

	return tx.Commit()
}

func (r *repository) GetByID(ctx context.Context, id string) (*Participant, error) {
	query := participantSelect + ` WHERE r.id = $1`
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
	query := participantSelect + ` ORDER BY r.created_at DESC`
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
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Update Person
	personQuery := `
		UPDATE persons SET 
			full_name = $1, email = $2, phone = $3, company = $4, job_title = $5, updated_at = NOW()
		WHERE id = (SELECT person_id FROM registrations WHERE id = $6)
	`
	_, err = tx.ExecContext(ctx, personQuery, p.FullName, p.Email, p.Phone, p.CompanyName, p.JobTitle, p.ID)
	if err != nil {
		return err
	}

	// Update Registration
	regQuery := `
		UPDATE registrations SET
			region = $1, community = $2, updated_at = NOW(), registration_number = COALESCE(NULLIF($3, ''), registration_number)
		WHERE id = $4
		RETURNING updated_at
	`
	err = tx.QueryRowContext(ctx, regQuery, p.IndustrialArea, p.Department, p.RegistrationNumber, p.ID).Scan(&p.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return ErrNotFound
		}
		if strings.Contains(err.Error(), "registrations_registration_number_key") {
			return ErrDuplicateReg
		}
		return err
	}

	return tx.Commit()
}

func (r *repository) UpdateStatus(ctx context.Context, id string, status string) error {
	query := `UPDATE registrations SET status = $1, updated_at = NOW() WHERE id = $2`
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

func (r *repository) ExecuteTx(ctx context.Context, fn func(tx *sqlx.Tx) error) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	if err := fn(tx); err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit()
}

func (r *repository) GetByIDTx(ctx context.Context, tx *sqlx.Tx, id string) (*Participant, error) {
	query := participantSelect + ` WHERE r.id = $1 FOR UPDATE`
	var p Participant
	err := tx.GetContext(ctx, &p, query, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &p, nil
}

func (r *repository) UpdateStatusAndNumberTx(ctx context.Context, tx *sqlx.Tx, id string, status string, regNum string) error {
	query := `UPDATE registrations SET status = $1, registration_number = NULLIF($2, ''), updated_at = NOW() WHERE id = $3`
	res, err := tx.ExecContext(ctx, query, status, regNum, id)
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

func (r *repository) GetMaxOfficialRegistrationNumberTx(ctx context.Context, tx *sqlx.Tx) (int, error) {
	query := `
		SELECT COALESCE(
			MAX(CAST(REGEXP_REPLACE(registration_number, '^MUSKOM-\d{4}-', '') AS INTEGER)), 
			0
		) 
		FROM registrations 
		WHERE registration_number LIKE 'MUSKOM-%'
	`
	var max int
	err := tx.GetContext(ctx, &max, query)
	if err != nil && !errors.Is(err, sql.ErrNoRows) {
		return 0, err
	}
	return max, nil
}

func (r *repository) Delete(ctx context.Context, id string) error {
	query := `DELETE FROM registrations WHERE id = $1`
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
	query, args, err := sqlx.In(`DELETE FROM registrations WHERE id IN (?)`, ids)
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
	query, args, err := sqlx.In(`UPDATE registrations SET status = ?, updated_at = NOW() WHERE id IN (?)`, status, ids)
	if err != nil {
		return err
	}
	query = r.db.Rebind(query)
	_, err = r.db.ExecContext(ctx, query, args...)
	return err
}

func (r *repository) FindByEmail(ctx context.Context, email string) (*Participant, error) {
	query := participantSelect + ` WHERE p.email = $1 LIMIT 1`
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

func (r *repository) GetCapacitySettings(ctx context.Context) (int, string, error) {
	var settingsJSON []byte
	err := r.db.GetContext(ctx, &settingsJSON, `SELECT settings FROM system_configurations WHERE group_name = 'registration'`)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return 0, "CLOSE", nil
		}
		return 0, "CLOSE", err
	}
	var cfg struct {
		ParticipantLimit int    `json:"participant_limit"`
		CapacityMode     string `json:"capacity_mode"`
	}
	if err := json.Unmarshal(settingsJSON, &cfg); err != nil {
		return 0, "CLOSE", nil
	}
	if cfg.CapacityMode == "" {
		cfg.CapacityMode = "CLOSE"
	}
	return cfg.ParticipantLimit, cfg.CapacityMode, nil
}

func (r *repository) GetStats(ctx context.Context) (*ParticipantStats, error) {
	stats := &ParticipantStats{
		ByIndustrialArea: []LabelCount{},
		ByCompany:        []LabelCount{},
		ByDate:           []DailyCount{},
		Recent:           []RecentParticipant{},
	}

	// Fetch Capacity Settings
	limitVal, modeVal, _ := r.GetCapacitySettings(ctx)
	stats.CapacityMode = modeVal
	if limitVal > 0 {
		stats.Limit = &limitVal
	}

	// 1. Summary counts
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
		FROM registrations
		GROUP BY status
	`)
	if err != nil {
		return nil, err
	}
	for _, r := range rows {
		stats.Total += r.Count
		stats.Today += r.Today
		normalizedStatus := strings.ToUpper(strings.TrimSpace(r.Status))
		switch {
		case normalizedStatus == "PENDING" || normalizedStatus == "UNVERIFIED":
			stats.Pending += r.Count
		case normalizedStatus == "VERIFIED" || normalizedStatus == "APPROVED":
			stats.Verified += r.Count
		case normalizedStatus == "REJECTED":
			stats.Rejected += r.Count
		case normalizedStatus == "WAITING LIST" || normalizedStatus == "WAITINGLIST" || normalizedStatus == "WAITING_LIST":
			stats.WaitingList += r.Count
		}
	}

	if limitVal > 0 {
		rem := limitVal - stats.Verified
		if rem < 0 {
			rem = 0
		}
		stats.RemainingCapacity = &rem
	}

	// 2. By Industrial Area (top 10)
	_ = r.db.SelectContext(ctx, &stats.ByIndustrialArea, `
		SELECT COALESCE(region, 'Unknown') AS label, COUNT(*) AS count
		FROM registrations
		GROUP BY region
		ORDER BY count DESC
		LIMIT 10
	`)

	// 3. By Company (top 10)
	_ = r.db.SelectContext(ctx, &stats.ByCompany, `
		SELECT COALESCE(p.company, 'Unknown') AS label, COUNT(*) AS count
		FROM registrations r
		JOIN persons p ON r.person_id = p.id
		GROUP BY p.company
		ORDER BY count DESC
		LIMIT 10
	`)

	// 4. Registrations by date — last 14 days
	_ = r.db.SelectContext(ctx, &stats.ByDate, `
		SELECT
			TO_CHAR(created_at::date, 'YYYY-MM-DD') AS date,
			COUNT(*) AS count
		FROM registrations
		WHERE created_at >= CURRENT_DATE - INTERVAL '13 days'
		GROUP BY date
		ORDER BY date ASC
	`)

	// 5. 10 most recent participants
	_ = r.db.SelectContext(ctx, &stats.Recent, `
		SELECT 
			r.id, 
			COALESCE(r.registration_number, '') AS registration_number, 
			p.full_name, 
			COALESCE(p.company, '') AS company_name, 
			COALESCE(r.region, '') AS industrial_area, 
			r.status, 
			r.created_at
		FROM registrations r
		JOIN persons p ON r.person_id = p.id
		ORDER BY r.created_at DESC
		LIMIT 10
	`)

	return stats, nil
}

func (r *repository) Count(ctx context.Context) (int, error) {
	query := `SELECT COUNT(*) FROM registrations`
	var count int
	err := r.db.GetContext(ctx, &count, query)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (r *repository) CountActive(ctx context.Context) (int, error) {
	query := `SELECT COUNT(*) FROM registrations WHERE UPPER(status) != 'REJECTED'`
	var count int
	err := r.db.GetContext(ctx, &count, query)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (r *repository) CountVerified(ctx context.Context) (int, error) {
	query := `SELECT COUNT(*) FROM registrations WHERE UPPER(status) IN ('VERIFIED', 'APPROVED')`
	var count int
	err := r.db.GetContext(ctx, &count, query)
	if err != nil {
		return 0, err
	}
	return count, nil
}

func (r *repository) GetRegistrationLimit(ctx context.Context) (*int, error) {
	limit, _, err := r.GetCapacitySettings(ctx)
	if err != nil {
		return nil, err
	}
	if limit > 0 {
		return &limit, nil
	}
	return nil, nil
}

func (r *repository) LookupPublic(ctx context.Context, query string) (*Participant, error) {
	sqlQuery := participantSelect + `
		WHERE (p.email = $1 OR r.registration_number = $1)
		LIMIT 1
	`
	var p Participant
	err := r.db.GetContext(ctx, &p, sqlQuery, query)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	return &p, nil
}
