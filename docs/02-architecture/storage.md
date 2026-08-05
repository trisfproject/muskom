# Storage Subsystem Architecture

## Storage Provider Model
The storage subsystem (`apps/api/platform/storage`) defines an abstract `Storage` interface supporting file operations:
- `Upload(ctx, file, filename)`: Saves input file stream to destination path.
- `Download(ctx, path)`: Opens read stream for file.
- `Delete(ctx, path)`: Removes file from storage.
- `Exists(ctx, path)`: Checks file existence.
- `URL(path)`: Formats public HTTP URL for stored asset.

## Implementation: Local Storage Provider
- **Root Directory:** `./uploads` (Configurable via `STORAGE_ROOT`).
- **Base URL:** `http://localhost/uploads` (Configurable via `STORAGE_BASE_URL`).
- **Security:** `filepath.Clean` prevents directory traversal attacks (`..`).
- **Nginx Serving:** Local uploads directory mounted directly to `muskom-nginx` container to serve static assets efficiently without overloading the API process.
