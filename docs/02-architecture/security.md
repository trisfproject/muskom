# Security Architecture

## Authentication & Authorization
- **JWT Authentication:** Signed JSON Web Tokens (`golang-jwt/jwt/v5`) passed in `Authorization: Bearer <token>` HTTP header.
- **Password Security:** Bcrypt hashing (`golang.org/x/crypto/bcrypt`) with minimum cost factor 10.
- **Role-Based Access Control (RBAC):** Fine-grained permission system mapped via `role_permissions` and enforced via `checker.RequirePermission("<permission.code>")` middleware.

## Data Protection & Audit
- **Asynchronous Audit Logging:** Non-blocking async logger captures action type, entity ID, user ID, client IP, previous value, and new value into `audit_logs`.
- **Path Traversal Protection:** Clean path validation (`filepath.Clean`) in storage provider prevents file upload directory traversal attacks.
