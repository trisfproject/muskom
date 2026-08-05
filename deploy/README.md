# Deployment Configuration

This directory contains deployment scripts and infrastructure configuration.

- `docker/`: Contains specific Dockerfiles or helper scripts.
- `nginx/`: Nginx proxy configurations.
- `docker-compose.yml`: Main compose file for local and staging environments.

## Bootstrap Administrator Configuration

The application supports automatically creating a Super Administrator during startup. This is useful for first-time deployments.

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
3. **Security Considerations**:
   - The password provided in `BOOTSTRAP_ADMIN_PASSWORD` is hashed using `bcrypt` immediately before being saved to the database. It is never stored in plaintext and never logged.
   - For production environments, it is strongly recommended to either disable the bootstrap after the first run, or inject the password via a secure secret management system rather than a plaintext `.env` file on disk.
