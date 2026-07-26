# Entity Relationship Diagram (ERD) MUSKOM

Dokumen ini mendefinisikan hubungan antar-entitas (tabel) pada basis data MUSKOM. Desain ini dirancang khusus untuk memfasilitasi kebutuhan pendaftaran pengguna, fase-fase persidangan atau musyawarah, dan manajemen pencalonan (kandidat) serta pemungutan suara (voting).

## Diagram Mermaid

```mermaid
erDiagram
    app_settings {
        UUID id PK
        VARCHAR key UK
        TEXT value
        VARCHAR description
        TIMESTAMPTZ updated_at
    }

    roles {
        UUID id PK
        VARCHAR name UK
        JSONB permissions
        TIMESTAMPTZ created_at
    }

    persons {
        UUID id PK
        VARCHAR name
        VARCHAR identity_number UK "NIK / NPM / ID"
        VARCHAR contact
        TIMESTAMPTZ created_at
    }

    users {
        UUID id PK
        UUID person_id FK "UK"
        UUID role_id FK
        VARCHAR email UK
        VARCHAR password_hash
        TIMESTAMPTZ created_at
        TIMESTAMPTZ deleted_at
    }

    events {
        UUID id PK
        VARCHAR name
        TEXT description
        TIMESTAMPTZ start_time
        TIMESTAMPTZ end_time
        VARCHAR status "DRAFT, UPCOMING, ONGOING, COMPLETED"
        TIMESTAMPTZ created_at
        TIMESTAMPTZ deleted_at
    }

    event_phases {
        UUID id PK
        UUID event_id FK
        VARCHAR name
        INTEGER sequence
        VARCHAR status "PENDING, ACTIVE, CLOSED"
        TIMESTAMPTZ start_time
        TIMESTAMPTZ end_time
    }

    event_settings {
        UUID id PK
        UUID event_id FK
        VARCHAR setting_key
        TEXT setting_value
    }

    registrations {
        UUID id PK
        UUID event_id FK
        UUID user_id FK
        VARCHAR status "PENDING, APPROVED, REJECTED"
        TIMESTAMPTZ registered_at
    }

    candidate_applications {
        UUID id PK
        UUID event_id FK
        UUID user_id FK
        TEXT motivation
        VARCHAR status "SUBMITTED, REVIEWING, ACCEPTED, REJECTED"
        TIMESTAMPTZ applied_at
    }

    candidates {
        UUID id PK
        UUID event_id FK
        UUID user_id FK
        UUID application_id FK
        INTEGER candidate_number
        TEXT vision_mission
        TIMESTAMPTZ created_at
    }

    attendance {
        UUID id PK
        UUID event_id FK
        UUID user_id FK
        TIMESTAMPTZ check_in_time
        VARCHAR location
    }

    votes {
        UUID id PK
        UUID event_id FK
        UUID candidate_id FK
        UUID voter_user_id FK
        TIMESTAMPTZ cast_at
    }

    announcements {
        UUID id PK
        UUID event_id FK
        VARCHAR title
        TEXT content
        UUID created_by FK
        TIMESTAMPTZ published_at
    }

    documents {
        UUID id PK
        UUID event_id FK
        UUID uploader_user_id FK
        VARCHAR file_path
        VARCHAR document_type
        TIMESTAMPTZ uploaded_at
    }

    audit_logs {
        UUID id PK
        UUID user_id FK "Nullable for system actions"
        VARCHAR action "CREATE, UPDATE, DELETE"
        VARCHAR entity_name
        UUID entity_id
        JSONB old_data
        JSONB new_data
        VARCHAR ip_address
        TIMESTAMPTZ created_at
    }

    %% Relationships
    persons ||--o| users : "1:1 relates to"
    roles ||--o{ users : "has"
    
    users ||--o{ registrations : "registers"
    events ||--o{ registrations : "receives"
    
    events ||--o{ event_phases : "has phases"
    events ||--o{ event_settings : "has settings"
    
    users ||--o{ candidate_applications : "applies"
    events ||--o{ candidate_applications : "receives applications"
    
    candidate_applications ||--o| candidates : "promotes to"
    users ||--o| candidates : "becomes"
    events ||--o{ candidates : "has candidates"
    
    users ||--o{ attendance : "checks in"
    events ||--o{ attendance : "records"
    
    users ||--o{ votes : "casts"
    candidates ||--o{ votes : "receives"
    events ||--o{ votes : "hosts"
    
    users ||--o{ announcements : "creates"
    events ||--o{ announcements : "broadcasts"
    
    users ||--o{ documents : "uploads"
    events ||--o{ documents : "owns"
    
    users ||--o{ audit_logs : "performs actions"
```
