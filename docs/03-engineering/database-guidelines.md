# Database Guidelines & Schema Rules

## Schema Conventions
1. **Table Names:** Plural snake_case (`events`, `participants`, `candidates`, `attendance`).
2. **Primary Keys:** UUID primary key generated via `gen_random_uuid()` or application UUID.
3. **Foreign Keys:** Explicit foreign keys with appropriate `ON DELETE` rules (e.g. `CASCADE` or `RESTRICT`).
4. **Soft Deletes:** Use `deleted_at TIMESTAMPTZ` for soft-deletable entities. Repositories must filter `WHERE deleted_at IS NULL`.
5. **Timestamps:** Every table must include `created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` and `updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()`.

## Migration Naming
Sequential 3-digit prefix: `database/migrations/NNN_short_description.sql` (e.g. `054_fix_attendance_votes_participants_fk.sql`).
