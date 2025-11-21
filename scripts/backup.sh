#!/bin/bash

# Nexus HR Database Backup Script
# Creates timestamped backups of the PostgreSQL database

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/nexus-hr}"
TIMESTAMP=$(date +"%Y%m%d-%H%M%S")
RETENTION_DAYS=${RETENTION_DAYS:-30}

# Database configuration from .env
source server/.env 2>/dev/null || source .env.production 2>/dev/null || {
    echo -e "${RED}❌ Cannot find environment file${NC}"
    exit 1
}

echo -e "${GREEN}🗄️  Starting database backup${NC}"
echo -e "${YELLOW}Backup directory: $BACKUP_DIR${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Extract database credentials
DB_NAME=$(echo $DATABASE_URL | sed 's/.*\/\([^?]*\).*/\1/')
DB_HOST=$(echo $DATABASE_URL | sed 's/.*@\([^:]*\):.*/\1/')
DB_PORT=$(echo $DATABASE_URL | sed 's/.*:\([0-9]*\)\/.*/\1/')
DB_USER=$(echo $DATABASE_URL | sed 's/.*:\/\/\([^:]*\):.*/\1/')
DB_PASS=$(echo $DATABASE_URL | sed 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/')

BACKUP_FILE="$BACKUP_DIR/nexus-hr-$TIMESTAMP.sql"
BACKUP_FILE_GZ="$BACKUP_FILE.gz"

# Create backup
echo -e "${YELLOW}📦 Creating database dump...${NC}"
PGPASSWORD="$DB_PASS" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --no-owner \
    --no-acl \
    -f "$BACKUP_FILE"

# Compress backup
echo -e "${YELLOW}🗜️  Compressing backup...${NC}"
gzip "$BACKUP_FILE"

# Verify backup
if [[ -f "$BACKUP_FILE_GZ" ]]; then
    SIZE=$(du -h "$BACKUP_FILE_GZ" | cut -f1)
    echo -e "${GREEN}✅ Backup created successfully${NC}"
    echo -e "${GREEN}File: $BACKUP_FILE_GZ${NC}"
    echo -e "${GREEN}Size: $SIZE${NC}"
else
    echo -e "${RED}❌ Backup failed${NC}"
    exit 1
fi

# Clean old backups
echo -e "${YELLOW}🧹 Cleaning old backups (older than $RETENTION_DAYS days)...${NC}"
find "$BACKUP_DIR" -name "nexus-hr-*.sql.gz" -mtime +$RETENTION_DAYS -delete
REMAINING=$(find "$BACKUP_DIR" -name "nexus-hr-*.sql.gz" | wc -l)
echo -e "${GREEN}Backups retained: $REMAINING${NC}"

# Create metadata file
cat > "$BACKUP_DIR/nexus-hr-$TIMESTAMP.meta" <<EOF
{
  "timestamp": "$TIMESTAMP",
  "database": "$DB_NAME",
  "size": "$(stat -c%s "$BACKUP_FILE_GZ")",
  "git_commit": "$(git rev-parse HEAD)",
  "git_branch": "$(git branch --show-current)"
}
EOF

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Backup completed successfully${NC}"
