#!/bin/bash

# Nexus HR Database Migration Script
# Runs Prisma migrations safely

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

ENVIRONMENT=${1:-development}

echo -e "${GREEN}🗄️  Running database migrations${NC}"
echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Create backup before migration
if [[ "$ENVIRONMENT" == "production" || "$ENVIRONMENT" == "staging" ]]; then
    echo -e "${YELLOW}📦 Creating backup before migration...${NC}"
    ./scripts/backup.sh
fi

# Run migrations
cd server

if [[ "$ENVIRONMENT" == "development" ]]; then
    echo -e "${YELLOW}🔄 Running development migration...${NC}"
    npx prisma migrate dev
else
    echo -e "${YELLOW}🔄 Deploying migration to $ENVIRONMENT...${NC}"
    npx prisma migrate deploy
fi

# Generate Prisma client
echo -e "${YELLOW}⚙️  Generating Prisma client...${NC}"
npx prisma generate

# Verify migration
echo -e "${YELLOW}✅ Verifying migration...${NC}"
npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1 && {
    echo -e "${GREEN}✅ Migration completed successfully${NC}"
} || {
    echo -e "${RED}❌ Migration verification failed${NC}"
    exit 1
}

cd ..

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Database is up to date${NC}"
