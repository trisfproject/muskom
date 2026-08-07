package main

import (
	"context"
	"fmt"
	"io/ioutil"
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
		log.Fatalf("Failed to connect to db: %v", err)
	}
	defer db.Close()



	content, err := ioutil.ReadFile("/home/langit/Dev/muskom/database/migrations/064_seed_announcement_permissions.sql")
	if err != nil {
		log.Fatalf("Failed to read migration: %v", err)
	}

	_, err = db.Exec(string(content))
	if err != nil {
		log.Fatalf("Failed to execute migration: %v", err)
	}
	fmt.Println("Migration successful!")
}
