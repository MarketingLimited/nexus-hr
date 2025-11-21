#!/bin/bash

# Nexus HR Cleanup Script
# Cleans up old logs, temporary files, and cache

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}🧹 Nexus HR Cleanup Script${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Clean npm cache
echo -e "${YELLOW}🗑️  Cleaning npm cache...${NC}"
npm cache clean --force

# Clean build artifacts
echo -e "${YELLOW}🗑️  Removing build artifacts...${NC}"
rm -rf dist/
rm -rf server/dist/
rm -rf server/node_modules/.cache/

# Clean old logs (older than 30 days)
echo -e "${YELLOW}🗑️  Cleaning old logs...${NC}"
if [[ -d "/var/log/nexus-hr" ]]; then
    find /var/log/nexus-hr -name "*.log" -mtime +30 -delete
    REMAINING=$(find /var/log/nexus-hr -name "*.log" | wc -l)
    echo -e "${GREEN}Log files retained: $REMAINING${NC}"
fi

# Clean temporary uploads (older than 7 days)
echo -e "${YELLOW}🗑️  Cleaning temporary uploads...${NC}"
if [[ -d "server/uploads/temp" ]]; then
    find server/uploads/temp -type f -mtime +7 -delete
fi

# Clean Docker resources (if applicable)
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}🗑️  Cleaning Docker resources...${NC}"
    docker system prune -f --volumes
fi

# Report disk usage
echo -e "${YELLOW}💾 Current disk usage:${NC}"
df -h / | tail -1 | awk '{print "Total: "$2" | Used: "$3" | Available: "$4" | Use%: "$5}'

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Cleanup completed${NC}"
