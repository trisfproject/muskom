package user

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	ListUsers(ctx context.Context, search string, roleID string, status string, page, limit int) ([]User, int, error)
	GetUserByID(ctx context.Context, id string) (*User, error)
	CreateUserTransaction(ctx context.Context, user *User) error
	UpdateUserRole(ctx context.Context, id, roleID string) error
	UpdateUserStatus(ctx context.Context, id string, isActive bool) error
	UpdateUserPassword(ctx context.Context, id, hash string) error
	UpdateUserProfile(ctx context.Context, userID, fullName, email string) error
	CheckUsernameExists(ctx context.Context, username string) (bool, error)
	CheckEmailExists(ctx context.Context, email string) (bool, error)
	CheckUserEmailExists(ctx context.Context, email string) (bool, error)
	CheckEmailExistsExcludingUser(ctx context.Context, email, excludeUserID string) (bool, error)
	GetAdminRoles(ctx context.Context) ([]RoleResponse, error)
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) ListUsers(ctx context.Context, search string, roleID string, status string, page, limit int) ([]User, int, error) {
	var users []User
	var total int

	baseQuery := `
		FROM users u
		JOIN persons p ON u.person_id = p.id
		JOIN roles ro ON u.role_id = ro.id
		WHERE u.deleted_at IS NULL
	`
	args := []interface{}{}
	argCount := 1

	if search != "" {
		baseQuery += fmt.Sprintf(` AND (u.username ILIKE $%d OR p.full_name ILIKE $%d OR p.email ILIKE $%d)`, argCount, argCount, argCount)
		args = append(args, "%"+search+"%")
		argCount++
	}

	if roleID != "" {
		baseQuery += fmt.Sprintf(` AND u.role_id = $%d`, argCount)
		args = append(args, roleID)
		argCount++
	}

	if status != "" {
		isActive := status == "active"
		baseQuery += fmt.Sprintf(` AND u.is_active = $%d`, argCount)
		args = append(args, isActive)
		argCount++
	}

	countQuery := `SELECT COUNT(*) ` + baseQuery
	err := r.db.GetContext(ctx, &total, countQuery, args...)
	if err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * limit
	selectQuery := `
		SELECT u.id, u.person_id, u.role_id, ro.code as role_code, ro.name as role_name, 
		       p.full_name, p.email, u.username, u.is_active, u.last_login_at, u.created_at, u.updated_at
	` + baseQuery + fmt.Sprintf(` ORDER BY u.created_at DESC LIMIT $%d OFFSET $%d`, argCount, argCount+1)

	args = append(args, limit, offset)

	err = r.db.SelectContext(ctx, &users, selectQuery, args...)
	if err != nil {
		return nil, 0, err
	}

	return users, total, nil
}

func (r *repository) GetUserByID(ctx context.Context, id string) (*User, error) {
	query := `
		SELECT u.id, u.person_id, u.role_id, ro.code as role_code, ro.name as role_name, 
		       p.full_name, p.email, u.username, u.password_hash, u.is_active, u.last_login_at, u.created_at, u.updated_at
		FROM users u
		JOIN persons p ON u.person_id = p.id
		JOIN roles ro ON u.role_id = ro.id
		WHERE u.id = $1 AND u.deleted_at IS NULL
	`
	var user User
	err := r.db.GetContext(ctx, &user, query, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (r *repository) CreateUserTransaction(ctx context.Context, user *User) error {
	tx, err := r.db.BeginTxx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Insert Person with UPSERT (DO UPDATE) to handle existing person emails (e.g. participants)
	personQuery := `
		INSERT INTO persons (id, full_name, email)
		VALUES (gen_random_uuid(), $1, $2)
		ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name
		RETURNING id
	`
	err = tx.QueryRowContext(ctx, personQuery, user.FullName, user.Email).Scan(&user.PersonID)
	if err != nil {
		return err
	}

	// Insert User
	userQuery := `
		INSERT INTO users (person_id, role_id, username, password_hash)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
	`
	err = tx.QueryRowContext(ctx, userQuery, user.PersonID, user.RoleID, user.Username, user.PasswordHash).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *repository) UpdateUserRole(ctx context.Context, id, roleID string) error {
	query := `UPDATE users SET role_id = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, roleID, id)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *repository) UpdateUserStatus(ctx context.Context, id string, isActive bool) error {
	query := `UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, isActive, id)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *repository) UpdateUserPassword(ctx context.Context, id, hash string) error {
	query := `UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2 AND deleted_at IS NULL`
	res, err := r.db.ExecContext(ctx, query, hash, id)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *repository) UpdateUserProfile(ctx context.Context, userID, fullName, email string) error {
	query := `
		UPDATE persons p
		SET full_name = $1, email = $2, updated_at = NOW()
		FROM users u
		WHERE u.person_id = p.id AND u.id = $3 AND u.deleted_at IS NULL
	`
	res, err := r.db.ExecContext(ctx, query, fullName, email, userID)
	if err != nil {
		return err
	}
	rows, _ := res.RowsAffected()
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *repository) CheckUsernameExists(ctx context.Context, username string) (bool, error) {
	var count int
	err := r.db.GetContext(ctx, &count, "SELECT count(*) FROM users WHERE username = $1", username)
	return count > 0, err
}

func (r *repository) CheckEmailExists(ctx context.Context, email string) (bool, error) {
	var count int
	err := r.db.GetContext(ctx, &count, "SELECT count(*) FROM persons WHERE email = $1", email)
	return count > 0, err
}

func (r *repository) CheckUserEmailExists(ctx context.Context, email string) (bool, error) {
	var count int
	query := `
		SELECT count(*)
		FROM persons p
		JOIN users u ON u.person_id = p.id
		WHERE p.email = $1 AND u.deleted_at IS NULL
	`
	err := r.db.GetContext(ctx, &count, query, email)
	return count > 0, err
}

func (r *repository) CheckEmailExistsExcludingUser(ctx context.Context, email, excludeUserID string) (bool, error) {
	var count int
	query := `
		SELECT count(*) 
		FROM persons p 
		JOIN users u ON u.person_id = p.id 
		WHERE p.email = $1 AND u.id != $2 AND u.deleted_at IS NULL
	`
	err := r.db.GetContext(ctx, &count, query, email, excludeUserID)
	return count > 0, err
}

func (r *repository) GetAdminRoles(ctx context.Context) ([]RoleResponse, error) {
	roles := []RoleResponse{}
	query := `
		SELECT id, code, name 
		FROM roles 
		WHERE code IN ('ADMIN', 'SUPER_ADMIN')
	`
	err := r.db.SelectContext(ctx, &roles, query)
	return roles, err
}
