# Backend Architecture

## Technology Stack
- **Language:** Go 1.25.0
- **Framework:** Go Fiber v2/v3 (`github.com/gofiber/fiber`)
- **Database Driver:** `github.com/jmoiron/sqlx` & `pgx/v5`
- **Cache Store:** Redis v9 (`github.com/redis/go-redis/v9`)
- **Logging:** Uber Zap (`go.uber.org/zap`)
- **Validation:** Go Playground Validator (`github.com/go-playground/validator/v10`)

## Directory Layout
```
apps/api/
├── cmd/server/main.go       # Server entry point & route registration
├── internal/modules/         # Modular domain handlers, services, repos
│   ├── musyawarah/           # Musyawarah event domain
│   ├── participant/          # Delegate registration & status domain
│   ├── candidate/            # Candidate nomination & document domain
│   ├── attendance/           # QR code presensi & check-in domain
│   ├── voting/               # E-voting & secret tally domain
│   ├── website/              # CMS settings domain
│   ├── rbac/                 # Roles & permissions domain
│   └── audit/                # Async audit logger domain
└── platform/                 # Infrastructure adapters (db, storage, mailer)
```
