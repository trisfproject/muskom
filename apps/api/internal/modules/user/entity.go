package user

import "time"

type User struct {
	ID           string    `db:"id"`
	PersonID     string    `db:"person_id"`
	RoleID       string    `db:"role_id"`
	RoleCode     string    `db:"role_code"`
	RoleName     string    `db:"role_name"`
	FullName     string    `db:"full_name"`
	Email        string    `db:"email"`
	Username     string    `db:"username"`
	PasswordHash string    `db:"password_hash"`
	IsActive     bool      `db:"is_active"`
	LastLoginAt  *time.Time `db:"last_login_at"`
	CreatedAt    time.Time `db:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"`
}
