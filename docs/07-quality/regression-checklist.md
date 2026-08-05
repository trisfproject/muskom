# Automated & Manual Regression Verification Checklist

## Pre-Commit Regression Suite
- [ ] **1. Auth Regression:** Verify admin login (`/admin/login`), JWT cookie issuance, and logout functionality.
- [ ] **2. Landing Page CMS Regression:** Verify dynamic rendering of landing hero, announcements, guidelines, and candidate directory.
- [ ] **3. Delegate Registration Regression:** Submit public form at `/register` -> Verify database insertion and email confirmation dispatch.
- [ ] **4. Candidate Management Regression:** Create and verify candidate application, PDF upload, and publication toggle.
- [ ] **5. Admin Portal Dashboard:** Verify `/admin/dashboard` metrics loading.
- [ ] **6. Docker Environment:** Execute `docker compose config` in `deploy/` to ensure zero syntax or volume errors.
