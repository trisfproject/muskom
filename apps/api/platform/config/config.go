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
}

func Load() (*Config, error) {
	_ = godotenv.Load() // Ignore error if .env file doesn't exist, rely on env variables

	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}

	return cfg, nil
}
