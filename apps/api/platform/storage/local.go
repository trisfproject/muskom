package storage

import (
	"context"
	"io"
	"os"
	"path/filepath"
	"strings"
)

type localStorage struct {
	rootDir string
	baseURL string
}

func NewLocalStorage(rootDir, baseURL string) Storage {
	return &localStorage{
		rootDir: rootDir,
		baseURL: baseURL,
	}
}

func (s *localStorage) Upload(ctx context.Context, file io.Reader, filename string) (*FileInfo, error) {
	cleanName := filepath.Clean(filename)
	if strings.Contains(cleanName, "..") {
		return nil, ErrInvalidPath
	}

	fullPath := filepath.Join(s.rootDir, cleanName)

	if err := os.MkdirAll(filepath.Dir(fullPath), 0755); err != nil {
		return nil, err
	}

	out, err := os.Create(fullPath)
	if err != nil {
		return nil, ErrUploadFailed
	}
	defer out.Close()

	written, err := io.Copy(out, file)
	if err != nil {
		return nil, ErrUploadFailed
	}

	return &FileInfo{
		Path: cleanName,
		Size: written,
	}, nil
}

func (s *localStorage) Delete(ctx context.Context, path string) error {
	cleanName := filepath.Clean(path)
	if strings.Contains(cleanName, "..") {
		return ErrInvalidPath
	}

	fullPath := filepath.Join(s.rootDir, cleanName)
	err := os.Remove(fullPath)
	if err != nil && os.IsNotExist(err) {
		return nil
	}
	return err
}

func (s *localStorage) Exists(ctx context.Context, path string) (bool, error) {
	cleanName := filepath.Clean(path)
	fullPath := filepath.Join(s.rootDir, cleanName)

	_, err := os.Stat(fullPath)
	if err == nil {
		return true, nil
	}
	if os.IsNotExist(err) {
		return false, nil
	}
	return false, err
}

func (s *localStorage) URL(path string) string {
	cleanName := filepath.Clean(path)
	return strings.TrimRight(s.baseURL, "/") + "/" + strings.TrimLeft(cleanName, "/")
}
