# Frontend Architecture

## Technology Stack
- **Framework:** Next.js 16.2.12 (App Router)
- **Library:** React 19.2.4
- **Styling:** Tailwind CSS v4, Framer Motion, Lucide Icons, Radix UI Primitives
- **Data Fetching:** Tanstack React Query v5, Axios
- **Form Validation:** React Hook Form + Zod
- **Toasts:** Sonner

## Route Hierarchy
```
apps/frontend/src/app/
├── page.tsx                     # Public Landing Page
├── register/page.tsx            # Public Delegate Registration
├── kandidat/[id]/page.tsx       # Public Candidate Profile Showcase
├── informasi/[slug]/page.tsx    # Public Information Guidelines Page
└── admin/                       # Administrative Portal Workspace
    ├── login/page.tsx           # Admin Authentication
    └── (dashboard)/             # Protected Workspace Layout
        ├── dashboard/           # Metrics Overview
        ├── musyawarah/          # Event & Timeline Configuration
        ├── participants/        # Participant Dashboard & Verification
        ├── candidates/          # Candidate Application & Publication
        ├── website/             # CMS Hero, Footer, Announcement Config
        ├── users/               # System User Management
        └── audit/               # Audit Log Explorer
```
