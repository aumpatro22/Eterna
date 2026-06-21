# Database Backup Strategy for Eterna

This document details the daily automated backup strategy for the Eterna production database hosted on Supabase PostgreSQL.

## Overview

Supabase automatically manages physical backups (which are retained for 7 days). However, to protect our data (especially user memories and memorials) against accidental deletions or platform-level outages, we implement a custom logical backup strategy using `pg_dump`.

## Daily Automated Backup Flow

Logical backups are executed daily at 02:00 UTC using a cron job. The script dumps all database tables, schemas, and records into a compressed SQL archive, which is then encrypted and uploaded to a secure, private cloud bucket (e.g., AWS S3 or Supabase Storage).

### Backup Command
The core backup operation utilizes `pg_dump` with the `DATABASE_URL` environment variable:

```bash
pg_dump "$DATABASE_URL" -F c -b -v -f /tmp/eterna_backup_$(date +%F).dump
```

* `-F c`: Output directory or custom archive format (compressed, flexible for pg_restore).
* `-b`: Include large objects in the dump.
* `-v`: Verbose mode.
* `-f`: Target output file.

### Backup Script (`backup_db.sh`)
```bash
#!/usr/bin/env bash
set -eo pipefail

# Load environment variables
source /etc/profile.d/eterna_env.sh

BACKUP_DIR="/var/backups/eterna"
TIMESTAMP=$(date +%F_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/eterna_backup_${TIMESTAMP}.dump"

echo "Starting database backup at $(date)..."
mkdir -p "$BACKUP_DIR"

# Perform dump
pg_dump "$DATABASE_URL" -F c -b -v -f "$BACKUP_FILE"

# Upload to secure remote storage (AWS S3)
aws s3 cp "$BACKUP_FILE" "s3://eterna-db-backups/eterna_backup_${TIMESTAMP}.dump" --sse AES256

# Keep only the last 30 days of local backups
find "$BACKUP_DIR" -type f -name "eterna_backup_*.dump" -mtime +30 -delete

echo "Database backup completed and uploaded successfully."
```

## Restoration Procedure

In the event of data corruption or disaster recovery, the database can be restored using the `pg_restore` tool:

```bash
pg_restore -d "$DATABASE_URL" -c -v --no-owner --no-privileges /path/to/backup.dump
```

* `-c`: Clean (drop) database objects before recreating them.
* `--no-owner`: Skip restoration of object ownership to match the destination roles.
* `--no-privileges`: Skip restoration of access privileges (grants).
