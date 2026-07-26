package auth

import (
	"context"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetUserByUsername(ctx context.Context, username string) (*AuthUser, error)
	UpdateLastLogin(ctx context.Context, userID string) error
}

type repository struct {
	db *sqlx.DB
}

// NewRepository creates a new Auth Repository.
func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetUserByUsername(ctx context.Context, username string) (*AuthUser, error) {
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
		WHERE u.username = $1 AND u.deleted_at IS NULL
	`

	var user AuthUser
	err := r.db.GetContext(ctx, &user, query, username)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (r *repository) UpdateLastLogin(ctx context.Context, userID string) error {
	query := `UPDATE users SET last_login_at = NOW(), updated_at = NOW() WHERE id = $1`
	_, err := r.db.ExecContext(ctx, query, userID)
	return err
}
