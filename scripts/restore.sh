#!/bin/bash

# Nexus HR Database Restore Script
# Restores database from a backup file

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/var/backups/nexus-hr}"
BACKUP_FILE=$1

echo -e "${GREEN}🔄 Nexus HR Database Restore${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if backup file is provided
if [[ -z "$BACKUP_FILE" ]]; then
    echo -e "${YELLOW}Available backups:${NC}"
    ls -lh "$BACKUP_DIR"/nexus-hr-*.sql.gz
    echo ""
    echo -e "${RED}Usage: ./scripts/restore.sh <backup-file>${NC}"
    exit 1
fi

# Check if file exists
if [[ ! -f "$BACKUP_FILE" ]]; then
    echo -e "${RED}❌ Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Confirmation prompt
echo -e "${YELLOW}⚠️  WARNING: This will overwrite the current database!${NC}"
echo -e "${YELLOW}Backup file: $BACKUP_FILE${NC}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [[ "$CONFIRM" != "yes" ]]; then
    echo -e "${YELLOW}Restore cancelled${NC}"
    exit 0
fi

# Load environment
source server/.env 2>/dev/null || source .env.production 2>/dev/null || {
    echo -e "${RED}❌ Cannot find environment file${NC}"
    exit 1
}

# Extract database credentials
DB_NAME=$(echo $DATABASE_URL | sed 's/.*\/\([^?]*\).*/\1/')
DB_HOST=$(echo $DATABASE_URL | sed 's/.*@\([^:]*\):.*/\1/')
DB_PORT=$(echo $DATABASE_URL | sed 's/.*:\([0-9]*\)\/.*/\1/')
DB_USER=$(echo $DATABASE_URL | sed 's/.*:\/\/\([^:]*\):.*/\1/')
DB_PASS=$(echo $DATABASE_URL | sed 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/')

# Create current backup before restore
echo -e "${YELLOW}📦 Creating safety backup of current database...${NC}"
./scripts/backup.sh

# Drop and recreate database
echo -e "${YELLOW}🗑️  Dropping existing database...${NC}"
PGPASSWORD="$DB_PASS" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "DROP DATABASE IF EXISTS $DB_NAME;"

PGPASSWORD="$DB_PASS" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d postgres \
    -c "CREATE DATABASE $DB_NAME;"

# Restore from backup
echo -e "${YELLOW}📥 Restoring from backup...${NC}"
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | PGPASSWORD="$DB_PASS" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME"
else
    PGPASSWORD="$DB_PASS" psql \
        -h "$DB_HOST" \
        -p "$DB_PORT" \
        -U "$DB_USER" \
        -d "$DB_NAME" \
        -f "$BACKUP_FILE"
fi

# Run migrations to ensure schema is up to date
echo -e "${YELLOW}🔄 Running migrations...${NC}"
cd server
npx prisma migrate deploy
npx prisma generate
cd ..

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Database restored successfully${NC}"
