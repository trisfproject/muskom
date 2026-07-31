package rbac

import (
	"context"

	"github.com/jmoiron/sqlx"
)

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) RBACRepository {
	return &repository{db: db}
}

func (r *repository) GetRolePermissionMatrix(ctx context.Context) (map[string][]string, error) {
	query := `
		SELECT 
			r.code as role_code,
			p.code as permission_code
		FROM roles r
		JOIN role_permissions rp ON r.id = rp.role_id
		JOIN permissions p ON rp.permission_id = p.id
	`
	
	type row struct {
		RoleCode       string `db:"role_code"`
		PermissionCode string `db:"permission_code"`
	}

	var rows []row
	if err := r.db.SelectContext(ctx, &rows, query); err != nil {
		return nil, err
	}

	matrix := make(map[string][]string)
	for _, rw := range rows {
		matrix[rw.RoleCode] = append(matrix[rw.RoleCode], rw.PermissionCode)
	}

	return matrix, nil
}

func (r *repository) GetPermissionsByRole(ctx context.Context, roleCode string) ([]string, error) {
	query := `
		SELECT p.code 
		FROM permissions p
		JOIN role_permissions rp ON p.id = rp.permission_id
		JOIN roles r ON rp.role_id = r.id
		WHERE r.code = $1
	`
	var perms []string
	if err := r.db.SelectContext(ctx, &perms, query, roleCode); err != nil {
		return nil, err
	}
	return perms, nil
}
