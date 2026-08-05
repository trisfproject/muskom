# UI & UX Guidelines

## Design System
- **Colors:** Curated CSS variables with dark/light mode support (`pg-bg`, `pg-text`, `pg-border`, `pg-surface-elevated`).
- **Typography:** Inter sans-serif, consistent scale (xs, sm, base, lg, xl, 2xl).
- **Iconography:** Lucide React icons exclusively.

## Required UI States
1. **Loading State:** Spinner or skeleton indicator during async requests.
2. **Empty State:** Clean icon, title, description, and primary CTA when list is empty.
3. **Error State:** Red toast notification or error alert box with actionable guidance.
4. **Success State:** Green toast or success card with receipt details.
5. **Mobile Responsiveness:** All public pages responsive down to 360px width without horizontal scrollbars.
