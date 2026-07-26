# MUSKOM (Musyawarah KOMITKABE Management System)

## Description
MUSKOM is an open-source, production-grade management system designed to digitalize the deliberative process (Musyawarah) within KOMITKABE. It handles event scheduling, attendance verification, secure e-voting, and document archiving.

## Vision
To be the leading platform for democratic, transparent, and efficient decision-making processes, shifting traditional conferences into a seamless digital ecosystem.

## Tech Stack
- **Frontend**: Next.js (TypeScript, Tailwind CSS, shadcn/ui)
- **Backend**: Go (Fiber v3, sqlx)
- **Database**: PostgreSQL 17
- **Cache**: Redis
- **Infrastructure**: Docker, Nginx

## Folder Structure
- `apps/frontend/`: Next.js web application.
- `apps/api/`: Go backend services.
- `database/`: Database schemas, migrations, and seed data.
- `deploy/`: Infrastructure configs, Nginx, and Docker setups.
- `docs/`: Technical and product documentation.
- `scripts/`: Utility scripts for automation.

## Getting Started
To get the project running locally:

1. Clone the repository.
2. Copy `.env.example` to `.env`.
3. Run `make up` to start the Docker containers.

## Development Roadmap
See `docs/10-roadmap.md` for detailed sprint plannings and feature milestones.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.