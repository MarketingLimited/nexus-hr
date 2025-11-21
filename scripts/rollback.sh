#!/bin/bash

# Nexus HR Rollback Script
# Rolls back to the previous deployment

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

BACKUP_DIR="${BACKUP_DIR:-/var/backups/nexus-hr}"

echo -e "${RED}🔄 Rolling back deployment${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Find the most recent backup
LATEST_BACKUP=$(find "$BACKUP_DIR" -name "nexus-hr-*.sql.gz" -type f -printf '%T@ %p\n' | sort -nr | head -1 | cut -d' ' -f2-)

if [[ -z "$LATEST_BACKUP" ]]; then
    echo -e "${RED}❌ No backups found to rollback to${NC}"
    exit 1
fi

echo -e "${YELLOW}Latest backup: $LATEST_BACKUP${NC}"
echo -e "${YELLOW}⚠️  This will restore the database to the backup state${NC}"

read -p "Continue with rollback? (yes/no): " CONFIRM
if [[ "$CONFIRM" != "yes" ]]; then
    echo -e "${YELLOW}Rollback cancelled${NC}"
    exit 0
fi

# Restore database
echo -e "${YELLOW}📥 Restoring database from backup...${NC}"
./scripts/restore.sh "$LATEST_BACKUP"

# Checkout previous git commit
echo -e "${YELLOW}⏪ Reverting code to previous commit...${NC}"
git log --oneline -10
echo ""
read -p "Enter commit hash to rollback to: " COMMIT_HASH

if [[ -n "$COMMIT_HASH" ]]; then
    git checkout "$COMMIT_HASH"

    # Rebuild applications
    echo -e "${YELLOW}🔨 Rebuilding applications...${NC}"
    cd server
    npm install
    npm run build
    cd ..

    npm install
    npm run build

    # Restart services
    echo -e "${YELLOW}🔄 Restarting services...${NC}"
    if command -v systemctl &> /dev/null; then
        sudo systemctl restart nexus-hr-backend
        sudo systemctl restart nexus-hr-frontend
    elif command -v docker-compose &> /dev/null; then
        docker-compose down
        docker-compose up -d --build
    fi

    echo -e "${GREEN}✅ Rollback completed${NC}"
else
    echo -e "${RED}No commit hash provided, skipping code rollback${NC}"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
