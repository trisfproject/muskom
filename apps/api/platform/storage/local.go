package storage

import (
	"context"
	"errors"
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

	// STEP 6: Run os.Stat() immediately after save
	fileInfo, statErr := os.Stat(fullPath)
	if os.IsNotExist(statErr) {
		return nil, errors.New("file was not written to disk despite successful copy")
	}
	if fileInfo.Size() == 0 {
		// Just a debug warning, or maybe an error
		// We'll return an error if it's 0 bytes because it shouldn't be empty
		return nil, errors.New("file was written but has 0 bytes")
	}

	return &FileInfo{
		Path: cleanName,
		Size: written,
	}, nil
}

func (s *localStorage) Download(ctx context.Context, path string) (io.ReadCloser, error) {
	cleanName := filepath.Clean(path)
	if strings.Contains(cleanName, "..") {
		return nil, ErrInvalidPath
	}

	fullPath := filepath.Join(s.rootDir, cleanName)
	file, err := os.Open(fullPath)
	if err != nil {
		if os.IsNotExist(err) {
			return nil, ErrFileNotFound
		}
		return nil, err
	}
	return file, nil
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
