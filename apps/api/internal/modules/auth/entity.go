package auth

// AuthUser represents an administrator account retrieved for authentication.
type AuthUser struct {
	ID           string `db:"id"`
	PersonID     string `db:"person_id"`
	RoleID       string `db:"role_id"`
	RoleCode     string `db:"role_code"`
	Username     string `db:"username"`
	PasswordHash string `db:"password_hash"`
	FullName     string `db:"full_name"`
	IsActive     bool   `db:"is_active"`
}
