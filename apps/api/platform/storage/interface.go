package storage

import (
	"context"
	"io"
)

type FileInfo struct {
	Path     string
	Size     int64
	MimeType string
}

type Storage interface {
	Upload(ctx context.Context, file io.Reader, filename string) (*FileInfo, error)
	Delete(ctx context.Context, path string) error
	Exists(ctx context.Context, path string) (bool, error)
	URL(path string) string
}
