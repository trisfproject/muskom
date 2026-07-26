package auth

import (
	"go.uber.org/zap"
)

type Service interface {
	// Login logic will be implemented in future tasks.
}

type service struct {
	repo Repository
	log  *zap.Logger
}

// NewService creates a new Auth Service foundation.
func NewService(repo Repository, log *zap.Logger) Service {
	return &service{repo: repo, log: log}
}
