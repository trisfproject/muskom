# Deployment Configuration

This directory contains deployment scripts and infrastructure configuration.

- `docker/`: Contains specific Dockerfiles or helper scripts.
- `nginx/`: Nginx proxy configurations.
- `docker-compose.yml`: Main compose file for local and staging environments.

## Fresh Installation

To spin up a fresh installation of MUSKOM, configure your `.env` file from the provided `.env.example` template, then run:

```bash
docker compose -f deploy/docker-compose.yml up -d
```

This will start PostgreSQL, Redis, the backend API, the frontend, and Nginx.

## Bootstrap Administrator Configuration

The application supports automatically creating a Super Administrator during startup. This is required for first-time deployments so you can access the admin portal.

### Configuration

You can configure the bootstrap behavior in your `.env` file using the following variables:

```env
BOOTSTRAP_ADMIN_ENABLED=true
BOOTSTRAP_ADMIN_NAME="System Administrator"
BOOTSTRAP_ADMIN_USERNAME=admin
BOOTSTRAP_ADMIN_EMAIL=admin@muskom.local
BOOTSTRAP_ADMIN_PASSWORD=ChangeMe123!
BOOTSTRAP_ADMIN_ROLE=super_admin
```

### Behavior

1. **First Deployment**: If `BOOTSTRAP_ADMIN_ENABLED=true`, the API will create a user with the specified credentials and the `super_admin` role when the backend container starts.
2. **Duplicate Protection**: The bootstrap process checks if a Super Administrator already exists. If one is found, the bootstrap process safely skips execution, preventing duplicates.

## Default Login

After a fresh installation with bootstrap enabled, you can log in to the admin portal (`http://localhost/admin/login` or your configured domain) using:
- **Username / Email**: `admin` or `admin@muskom.local`
- **Password**: `ChangeMe123!`

## Changing Credentials

For security purposes, immediately after your first login:
1. Navigate to your Profile/Account Settings.
2. Change the default password to a secure password.
3. (Optional) Update the email address to your real administrative email.

## Disabling Bootstrap

For production environments, it is strongly recommended to disable the bootstrap feature after the first run. To do this:
1. Edit your `.env` file.
2. Set `BOOTSTRAP_ADMIN_ENABLED=false`.
3. Restart the API container (`docker compose restart api`).

This prevents accidental administrator creation or exposure of default credentials in your configuration.
