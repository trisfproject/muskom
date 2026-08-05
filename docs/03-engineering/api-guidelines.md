# API Design Guidelines

## REST Endpoints Standard
- `/api/v1/public/*`: Unauthenticated endpoints for public landing page & delegate registration.
- `/api/v1/auth/*`: Authentication endpoints (login, refresh, logout, permissions).
- `/api/v1/admin/*`: Protected administrative endpoints (requires JWT + RBAC permission middleware).
- `/api/v1/vote/*`: Protected delegate endpoints for casting ballot (requires JWT).

## Standard JSON Response Format
```json
{
  "code": 200,
  "message": "Operation successful",
  "data": { ... },
  "error": null
}
```

## Error Response Format
```json
{
  "code": 400,
  "message": "Validation failed",
  "data": null,
  "error": "Email address is already registered"
}
```
