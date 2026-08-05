# Technical Debt Register

| Debt ID | Module | Priority | Description | Estimated Effort | Target Sprint |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **DEBT-01** | `registration` | **High** | Dead backend module `internal/modules/registration` superseded by `participant`. | 1 hour | Sprint 1 |
| **DEBT-02** | `database` | **High** | Dual timeline tables (`timelines` vs `website_timeline_phases`). | 2 hours | Sprint 2 |
| **DEBT-03** | `database` | **High** | Dual announcement tables (`announcements` vs `website_announcements`). | 2 hours | Sprint 2 |
| **DEBT-04** | `frontend` | **Medium** | Custom table & badge rendering in `participants/page.tsx` instead of shared `<DataTable />` & `<StatusChip />`. | 3 hours | Sprint 1 |
| **DEBT-05** | `frontend` | **Low** | Standalone leftover components in `src/components/landing/` not used by landing page. | 1 hour | Sprint 4 |
