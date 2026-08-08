package bootstrap

import (
	"context"
	"database/sql"
	"fmt"
	"strings"

	"github.com/jmoiron/sqlx"
	"go.uber.org/zap"
	"golang.org/x/crypto/bcrypt"

	"github.com/trisfproject/muskom/apps/api/platform/config"
)

func Run(ctx context.Context, db *sqlx.DB, cfg *config.Config, log *zap.Logger) {
	if !cfg.BootstrapAdminEnabled {
		log.Info("Bootstrap administrator skipped (not enabled)")
		return
	}

	roleCode := strings.ToUpper(cfg.BootstrapAdminRole)
	if roleCode == "" {
		roleCode = "SUPER_ADMIN"
	}

	var adminUserID string
	queryCheck := `
		SELECT u.id
		FROM users u
		JOIN roles r ON u.role_id = r.id
		WHERE UPPER(r.code) = $1 AND u.deleted_at IS NULL
		LIMIT 1
	`
	err := db.GetContext(ctx, &adminUserID, queryCheck, roleCode)
	if err != nil && err != sql.ErrNoRows {
		log.Error("Failed to check existing bootstrap administrator", zap.Error(err))
		return
	}

	// Validate required config
	if cfg.BootstrapAdminUsername == "" || cfg.BootstrapAdminPassword == "" || cfg.BootstrapAdminEmail == "" {
		log.Error("Bootstrap administrator failed: missing required configuration (username, password, email)")
		return
	}

	// Hash password
	hash, err := bcrypt.GenerateFromPassword([]byte(cfg.BootstrapAdminPassword), bcrypt.DefaultCost)
	if err != nil {
		log.Error("Bootstrap administrator failed: error hashing password", zap.Error(err))
		return
	}

	if adminUserID != "" {
		// Administrator already exists, update credentials
		updateQuery := `
			UPDATE users 
			SET username = $1, password_hash = $2
			WHERE id = $3
		`
		_, err = db.ExecContext(ctx, updateQuery, cfg.BootstrapAdminUsername, string(hash), adminUserID)
		if err != nil {
			log.Error("Bootstrap administrator failed to update existing user", zap.Error(err))
			return
		}
		fmt.Println("--------------------------------------------------")
		fmt.Println("[BOOTSTRAP]")
		fmt.Println("Administrator : UPDATED")
		fmt.Printf("Username  : %s\n", cfg.BootstrapAdminUsername)
		fmt.Println("--------------------------------------------------")
		log.Info("Bootstrap administrator updated (already exists)")
		return
	}

	// Fetch role ID
	var roleID string
	queryRole := `SELECT id FROM roles WHERE UPPER(code) = $1`
	err = db.GetContext(ctx, &roleID, queryRole, roleCode)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Error("Bootstrap administrator failed: role not found", zap.String("role", roleCode))
		} else {
			log.Error("Bootstrap administrator failed: error fetching role", zap.Error(err))
		}
		return
	}


	// Start transaction
	tx, err := db.BeginTxx(ctx, nil)
	if err != nil {
		log.Error("Bootstrap administrator failed: error beginning transaction", zap.Error(err))
		return
	}
	defer tx.Rollback()

	// Insert person
	var personID string
	queryPerson := `
		INSERT INTO persons (id, full_name, email)
		VALUES (gen_random_uuid(), $1, $2)
		RETURNING id
	`
	name := cfg.BootstrapAdminName
	if name == "" {
		name = "Super Administrator"
	}
	err = tx.QueryRowContext(ctx, queryPerson, name, cfg.BootstrapAdminEmail).Scan(&personID)
	if err != nil {
		log.Error("Bootstrap administrator failed: error creating person", zap.Error(err))
		return
	}

	// Insert user
	queryUser := `
		INSERT INTO users (person_id, role_id, username, password_hash, is_active)
		VALUES ($1, $2, $3, $4, true)
	`
	_, err = tx.ExecContext(ctx, queryUser, personID, roleID, cfg.BootstrapAdminUsername, string(hash))
	if err != nil {
		log.Error("Bootstrap administrator failed: error creating user", zap.Error(err))
		return
	}

	err = tx.Commit()
	if err != nil {
		log.Error("Bootstrap administrator failed: error committing transaction", zap.Error(err))
		return
	}

	fmt.Println("--------------------------------------------------")
	fmt.Println("[BOOTSTRAP]")
	fmt.Println("Administrator : CREATED")
	fmt.Printf("Name      : %s\n", name)
	fmt.Printf("Username  : %s\n", cfg.BootstrapAdminUsername)
	fmt.Printf("Email     : %s\n", cfg.BootstrapAdminEmail)
	fmt.Println("--------------------------------------------------")
	log.Info("Bootstrap administrator created")
}
