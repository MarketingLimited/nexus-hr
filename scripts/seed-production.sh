#!/bin/bash

# Nexus HR Production Seed Script
# Seeds initial data for production environment

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}🌱 Seeding production database${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Confirmation
echo -e "${YELLOW}⚠️  WARNING: This will add initial data to the production database${NC}"
read -p "Are you sure you want to continue? (yes/no): " CONFIRM

if [[ "$CONFIRM" != "yes" ]]; then
    echo -e "${YELLOW}Seeding cancelled${NC}"
    exit 0
fi

# Run seed script
cd server

echo -e "${YELLOW}🌱 Running seed script...${NC}"
npx tsx prisma/seed.ts

cd ..

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Production database seeded successfully${NC}"
echo -e "${YELLOW}⚠️  Default admin credentials:${NC}"
echo -e "${YELLOW}Email: admin@nexushr.com${NC}"
echo -e "${YELLOW}Password: (check seed script)${NC}"
echo -e "${RED}🔐 IMPORTANT: Change default passwords immediately!${NC}"
