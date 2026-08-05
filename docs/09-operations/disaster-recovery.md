# Disaster Recovery & Backup Guide

## Automated Database Backup Procedure
```bash
docker compose exec muskom-db pg_dump -U postgres muskom_db > ./backups/muskom_backup_$(date +%Y%m%d_%H%M%S).sql
```

## Restore Procedure
```bash
cat ./backups/muskom_backup_YYYYMMDD_HHMMSS.sql | docker compose exec -T muskom-db psql -U postgres -d muskom_db
```

## Media Upload Backup
Backup the host `./uploads` volume directory to external secure storage prior to major events.
