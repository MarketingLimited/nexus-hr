#!/bin/bash

# Nexus HR Health Check Script
# Verifies that all services are running correctly

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
API_URL="${API_URL:-http://localhost:3001}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:8080}"
TIMEOUT=5

echo -e "${GREEN}🏥 Nexus HR Health Check${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

FAILED=0

# Check backend health
echo -e "${YELLOW}Checking backend API...${NC}"
if curl -sf --max-time $TIMEOUT "$API_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend API is healthy${NC}"
else
    echo -e "${RED}❌ Backend API is not responding${NC}"
    FAILED=1
fi

# Check frontend
echo -e "${YELLOW}Checking frontend...${NC}"
if curl -sf --max-time $TIMEOUT "$FRONTEND_URL" > /dev/null; then
    echo -e "${GREEN}✅ Frontend is healthy${NC}"
else
    echo -e "${RED}❌ Frontend is not responding${NC}"
    FAILED=1
fi

# Check database connectivity
echo -e "${YELLOW}Checking database connection...${NC}"
cd server
if npx prisma db execute --stdin <<< "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Cannot connect to database${NC}"
    FAILED=1
fi
cd ..

# Check disk space
echo -e "${YELLOW}Checking disk space...${NC}"
DISK_USAGE=$(df -h / | tail -1 | awk '{print $5}' | sed 's/%//')
if [[ $DISK_USAGE -lt 90 ]]; then
    echo -e "${GREEN}✅ Disk space OK ($DISK_USAGE% used)${NC}"
else
    echo -e "${RED}⚠️  Disk space critical ($DISK_USAGE% used)${NC}"
    FAILED=1
fi

# Check memory
echo -e "${YELLOW}Checking memory usage...${NC}"
if command -v free &> /dev/null; then
    MEM_USAGE=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
    if [[ $MEM_USAGE -lt 90 ]]; then
        echo -e "${GREEN}✅ Memory OK ($MEM_USAGE% used)${NC}"
    else
        echo -e "${YELLOW}⚠️  Memory high ($MEM_USAGE% used)${NC}"
    fi
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ $FAILED -eq 0 ]]; then
    echo -e "${GREEN}✅ All health checks passed${NC}"
    exit 0
else
    echo -e "${RED}❌ Some health checks failed${NC}"
    exit 1
fi
