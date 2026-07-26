# MUSKOM (Musyawarah KOMITKABE Management System)

MUSKOM adalah platform sistem informasi manajemen mutakhir yang dirancang untuk mendigitalisasi dan mengorkestrasi seluruh proses musyawarah di dalam ruang lingkup KOMITKABE. Sistem ini memfasilitasi manajemen agenda, presensi, e-voting, serta pengarsipan keputusan secara terpusat, aman, dan transparan.

## Technology Stack

Untuk memastikan skalabilitas, keamanan, dan maintainability, MUSKOM dibangun di atas teknologi berikut:

- **Frontend (Web App)**: Next.js (React), TypeScript, Tailwind CSS, React Query
- **Backend (API Services)**: NestJS (Node.js), TypeScript
- **Database**: PostgreSQL (Relational Data), Prisma (ORM)
- **Caching & Message Queue**: Redis
- **Storage**: S3-compatible Object Storage (AWS S3 atau MinIO)
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions / GitLab CI

## Folder Structure

Struktur monorepo atau repositori terpisah dapat digunakan, namun secara konseptual struktur proyek adalah sebagai berikut:

```text
muskom/
├── apps/
│   ├── web/                # Next.js frontend application
│   └── api/                # NestJS backend application
├── packages/
│   ├── shared-types/       # TypeScript interfaces & types shared across apps
│   ├── ui/                 # Reusable UI components
│   └── config/             # ESLint, Prettier, TSConfig configurations
├── docs/                   # Arsitektur dan dokumentasi produk
├── docker/                 # Dockerfiles & docker-compose.yml
└── README.md
```

## Coding Convention

1. **TypeScript Strict Mode**: Diaktifkan untuk semua layanan.
2. **Linter & Formatter**: Menggunakan ESLint (dengan aturan Airbnb/Standard) dan Prettier.
3. **Naming Convention**: 
   - `camelCase` untuk variabel dan fungsi.
   - `PascalCase` untuk class, interface, dan komponen React.
   - `kebab-case` untuk nama file dan folder.
4. **Commit Messages**: Mengikuti spesifikasi [Conventional Commits](https://www.conventionalcommits.org/). Contoh: `feat: add voting module`, `fix: resolve pagination issue`.

## Branch Strategy

Kami mengadopsi **GitFlow** / **Trunk-Based Development** (disesuaikan dengan ukuran tim).
- `main` : Cabang produksi, stabil, dan selalu siap deploy.
- `staging` : Cabang pra-produksi untuk UAT (User Acceptance Testing).
- `develop` : Cabang integrasi pengembangan (opsional, atau langsung ke `main` dengan feature branches).
- `feature/*` : Cabang untuk fitur baru.
- `hotfix/*` : Cabang untuk perbaikan bug darurat di produksi.

## Deployment Strategy

1. **Container-first**: Seluruh layanan di-build menjadi Docker image.
2. **Environment**: Terdapat 3 environment: Development, Staging, Production.
3. **CI/CD Pipeline**:
   - **PR (Pull Request)**: Menjalankan linter, unit test, dan build check.
   - **Merge to Staging**: Build image, push ke Container Registry, deploy ke environment Staging.
   - **Release to Main**: Tagging otomatis, build image produksi, dan rilis (Blue-Green atau Rolling Deployment).

## Docker Architecture

Sistem menggunakan arsitektur multi-container yang diorkestrasi oleh Docker Compose untuk development dan Kubernetes/Docker Swarm untuk production.

- `muskom-web`: Container untuk Frontend Next.js.
- `muskom-api`: Container untuk Backend NestJS.
- `muskom-db`: Container PostgreSQL.
- `muskom-redis`: Container Redis untuk caching sesi dan antrian voting.
- `muskom-proxy`: Nginx/Traefik sebagai Reverse Proxy dan API Gateway.

---
*Dokumentasi ini dikelola sebagai bagian dari Sprint 0 (Planning).*