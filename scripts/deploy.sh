#!/bin/bash

# Nexus HR Deployment Script
# This script handles automated deployment to staging or production

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-staging}
DEPLOY_DIR="/var/www/nexus-hr"
BACKUP_DIR="/var/backups/nexus-hr"

echo -e "${GREEN}🚀 Starting Nexus HR Deployment${NC}"
echo -e "${YELLOW}Environment: $ENVIRONMENT${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Validate environment
if [[ "$ENVIRONMENT" != "staging" && "$ENVIRONMENT" != "production" ]]; then
    echo -e "${RED}❌ Invalid environment. Use 'staging' or 'production'${NC}"
    exit 1
fi

# Check if running as correct user
if [[ "$ENVIRONMENT" == "production" && "$USER" != "deploy" ]]; then
    echo -e "${RED}❌ Production deployments must be run as 'deploy' user${NC}"
    exit 1
fi

# Step 1: Backup current deployment
echo -e "${YELLOW}📦 Creating backup...${NC}"
./scripts/backup.sh

# Step 2: Pull latest code
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git fetch origin
if [[ "$ENVIRONMENT" == "production" ]]; then
    git checkout main
    git pull origin main
else
    git checkout develop
    git pull origin develop
fi

# Step 3: Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"

# Backend dependencies
cd server
npm ci --production=false
cd ..

# Frontend dependencies
npm ci --production=false

# Step 4: Run database migrations
echo -e "${YELLOW}🗄️  Running database migrations...${NC}"
cd server
npx prisma migrate deploy
npx prisma generate
cd ..

# Step 5: Build applications
echo -e "${YELLOW}🔨 Building applications...${NC}"

# Build backend
cd server
npm run build
cd ..

# Build frontend
npm run build

# Step 6: Run health checks
echo -e "${YELLOW}🏥 Running health checks...${NC}"
./scripts/health-check.sh || {
    echo -e "${RED}❌ Health check failed. Rolling back...${NC}"
    ./scripts/rollback.sh
    exit 1
}

# Step 7: Restart services
echo -e "${YELLOW}🔄 Restarting services...${NC}"
if command -v systemctl &> /dev/null; then
    sudo systemctl restart nexus-hr-backend
    sudo systemctl restart nexus-hr-frontend
elif command -v docker-compose &> /dev/null; then
    docker-compose down
    docker-compose up -d --build
else
    echo -e "${YELLOW}⚠️  Manual service restart required${NC}"
fi

# Step 8: Verify deployment
echo -e "${YELLOW}✅ Verifying deployment...${NC}"
sleep 5
./scripts/health-check.sh || {
    echo -e "${RED}❌ Post-deployment health check failed${NC}"
    exit 1
}

# Step 9: Tag release
if [[ "$ENVIRONMENT" == "production" ]]; then
    VERSION=$(date +"%Y%m%d-%H%M%S")
    git tag -a "release-$VERSION" -m "Production release $VERSION"
    git push origin "release-$VERSION"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${GREEN}Environment: $ENVIRONMENT${NC}"
echo -e "${GREEN}Timestamp: $(date)${NC}"
