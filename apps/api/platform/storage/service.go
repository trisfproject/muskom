package storage

import "errors"

// NewService factory initializes the correct storage provider based on configuration.
func NewService(provider, rootDir, baseURL string) (Storage, error) {
	switch provider {
	case "local":
		return NewLocalStorage(rootDir, baseURL), nil
	default:
		return nil, errors.New("unsupported storage provider")
	}
}
