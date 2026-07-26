package storage

import "errors"

var (
	ErrFileNotFound = errors.New("file not found")
	ErrUploadFailed = errors.New("upload failed")
	ErrInvalidPath  = errors.New("invalid path")
)
