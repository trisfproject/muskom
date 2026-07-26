package config

import (
	"fmt"
	"time"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv           string        `env:"APP_ENV" envDefault:"development"`
	Port             string        `env:"PORT" envDefault:"8080"`
	DatabaseURL      string        `env:"DATABASE_URL,required"`
	RedisURL         string        `env:"REDIS_URL,required"`
	JWTSecret        string        `env:"JWT_SECRET,required"`
	JWTRefreshSecret string        `env:"JWT_REFRESH_SECRET,required"`
	JWTRefreshTTL    time.Duration `env:"JWT_REFRESH_TTL" envDefault:"168h"`
	StorageProvider  string        `env:"STORAGE_PROVIDER" envDefault:"local"`
	StorageRoot      string        `env:"STORAGE_ROOT" envDefault:"./uploads"`
	StorageBaseURL   string        `env:"STORAGE_BASE_URL" envDefault:"http://localhost:8080/uploads"`
	MaxUploadSize    int64         `env:"MAX_UPLOAD_SIZE" envDefault:"5242880"`
}

func Load() (*Config, error) {
	_ = godotenv.Load() // Ignore error if .env file doesn't exist, rely on env variables

	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}

	return cfg, nil
}
