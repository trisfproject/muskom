package auth

import (
	"context"
	"time"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	FindByUsernameOrEmail(ctx context.Context, identifier string) (*AuthUser, error)
	UpdateLastLogin(ctx context.Context, userID string, loginAt time.Time) error
}

type repository struct {
	db *sqlx.DB
}

// NewRepository creates a new Auth Repository.
func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) FindByUsernameOrEmail(ctx context.Context, identifier string) (*AuthUser, error) {
	query := `
		SELECT 
			u.id, 
			u.person_id, 
			u.role_id, 
			u.username, 
			u.password_hash, 
			u.is_active,
			p.full_name, 
			roles.code as role_code
		FROM users u
		INNER JOIN persons p ON u.person_id = p.id
		INNER JOIN roles ON u.role_id = roles.id
		WHERE (u.username = $1 OR p.email = $1) AND u.deleted_at IS NULL
	`

	var user AuthUser
	err := r.db.GetContext(ctx, &user, query, identifier)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *repository) UpdateLastLogin(ctx context.Context, userID string, loginAt time.Time) error {
	query := `UPDATE users SET last_login_at = $1, updated_at = NOW() WHERE id = $2`
	_, err := r.db.ExecContext(ctx, query, loginAt, userID)
	return err
}
