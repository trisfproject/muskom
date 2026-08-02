package main

import (
	"context"
	"fmt"
	"log"

	"github.com/trisfproject/muskom/apps/api/platform/config"
	"github.com/trisfproject/muskom/apps/api/platform/database"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	db, err := database.NewPostgresDB(context.Background(), cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}
	defer db.Close()

	query := `
		INSERT INTO role_permissions (role_id, permission_id)
		SELECT r.id, p.id 
		FROM roles r, permissions p 
		WHERE r.code = 'ADMIN' AND p.code = 'system.manage'
		ON CONFLICT DO NOTHING;
	`
	
	_, err = db.Exec(query)
	if err != nil {
		log.Fatalf("Failed to execute query: %v", err)
	}
	
	fmt.Println("Successfully granted system.manage to ADMIN role")
}
