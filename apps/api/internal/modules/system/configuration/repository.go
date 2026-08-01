package configuration

import (
	"context"
	"database/sql"
	"encoding/json"

	"github.com/jmoiron/sqlx"
)

type Repository interface {
	GetAllConfigs(ctx context.Context) ([]SystemConfiguration, error)
	GetConfigByGroup(ctx context.Context, groupName string) (*SystemConfiguration, error)
	UpdateConfigGroup(ctx context.Context, groupName string, settings json.RawMessage, updatedBy *string) error
}

type repository struct {
	db *sqlx.DB
}

func NewRepository(db *sqlx.DB) Repository {
	return &repository{db: db}
}

func (r *repository) GetAllConfigs(ctx context.Context) ([]SystemConfiguration, error) {
	query := `SELECT id, group_name, settings, updated_by, updated_at FROM system_configurations`

	rows, err := r.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var configs []SystemConfiguration
	for rows.Next() {
		var cfg SystemConfiguration
		err := rows.Scan(&cfg.ID, &cfg.GroupName, &cfg.Settings, &cfg.UpdatedBy, &cfg.UpdatedAt)
		if err != nil {
			return nil, err
		}
		configs = append(configs, cfg)
	}

	return configs, nil
}

func (r *repository) GetConfigByGroup(ctx context.Context, groupName string) (*SystemConfiguration, error) {
	query := `SELECT id, group_name, settings, updated_by, updated_at FROM system_configurations WHERE group_name = $1`

	var cfg SystemConfiguration
	err := r.db.QueryRowContext(ctx, query, groupName).Scan(&cfg.ID, &cfg.GroupName, &cfg.Settings, &cfg.UpdatedBy, &cfg.UpdatedAt)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, nil // Not found is not necessarily an error, can return nil
		}
		return nil, err
	}

	return &cfg, nil
}

func (r *repository) UpdateConfigGroup(ctx context.Context, groupName string, settings json.RawMessage, updatedBy *string) error {
	query := `
		INSERT INTO system_configurations (group_name, settings, updated_by, updated_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (group_name) DO UPDATE
		SET settings = $2, updated_by = $3, updated_at = NOW()
	`

	_, err := r.db.ExecContext(ctx, query, groupName, settings, updatedBy)
	return err
}
