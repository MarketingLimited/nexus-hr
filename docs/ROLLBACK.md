# Rollback Guide - Nexus HR

This guide provides procedures for safely rolling back deployments when issues are encountered in production.

## Table of Contents

- [When to Rollback](#when-to-rollback)
- [Rollback Prerequisites](#rollback-prerequisites)
- [Application Rollback](#application-rollback)
- [Database Rollback](#database-rollback)
- [Docker Rollback](#docker-rollback)
- [Emergency Procedures](#emergency-procedures)
- [Post-Rollback Steps](#post-rollback-steps)

---

## When to Rollback

### Critical Issues Requiring Immediate Rollback

- **System Down**: Application is completely unavailable
- **Data Loss**: Critical data being corrupted or lost
- **Security Breach**: Security vulnerability actively being exploited
- **Major Functionality Broken**: Core features not working
- **Performance Degradation**: System unusable due to performance issues

### Issues That May Not Require Rollback

- **Minor UI Issues**: Visual glitches that don't affect functionality
- **Non-Critical Feature Bugs**: New feature has issues but doesn't affect existing functionality
- **Performance Degradation**: Noticeable but not critical
- **Logging Errors**: Errors that don't affect user experience

### Decision Matrix

| Severity | User Impact | Data Risk | Action |
|----------|-------------|-----------|--------|
| Critical | High | High | **Immediate Rollback** |
| High | Medium | Medium | **Rollback after 15 min** |
| Medium | Low | Low | **Monitor and Fix Forward** |
| Low | None | None | **Fix Forward** |

---

## Rollback Prerequisites

### Before Any Deployment

1. **Version Tagging**: Always tag releases
   ```bash
   git tag -a v1.2.3 -m "Release version 1.2.3"
   git push origin v1.2.3
   ```

2. **Keep Previous Versions**: Maintain last 3 releases
   ```bash
   # Docker images
   docker images | grep nexus-hr

   # Keep v1.2.3, v1.2.2, v1.2.1
   ```

3. **Database Backup**: Backup before deployment
   ```bash
   ./scripts/backup.sh
   ```

4. **Document Changes**: Maintain CHANGELOG.md

### Rollback Checklist

Before rolling back, verify:

- [ ] Issue is confirmed and documented
- [ ] Stakeholders are notified
- [ ] Backup exists and is valid
- [ ] Previous version is available
- [ ] Rollback procedure is understood
- [ ] Team is ready to monitor

---

## Application Rollback

### Method 1: Using Git Tags

**Step 1**: Identify previous stable version
```bash
# List recent tags
git tag -l --sort=-version:refname | head -5

# Example output:
# v1.2.3 (current - broken)
# v1.2.2 (previous - stable)
# v1.2.1
```

**Step 2**: Checkout previous version
```bash
git checkout v1.2.2
```

**Step 3**: Build and deploy
```bash
# Frontend
npm install
npm run build

# Backend
cd server
npm install
npm run build

# Restart services
pm2 restart nexus-hr-backend
sudo systemctl restart nginx
```

**Step 4**: Verify rollback
```bash
# Check version endpoint
curl http://localhost:3001/api/version

# Run health checks
./scripts/health-check.sh
```

### Method 2: Using Automated Script

Use the rollback script:

```bash
./scripts/rollback.sh v1.2.2
```

The script will:
1. Stop current services
2. Checkout specified version
3. Build application
4. Run migrations (if safe)
5. Start services
6. Verify deployment

---

## Database Rollback

### Important Notes

⚠️ **Database rollback is risky**. Always:
- Backup before rollback
- Test rollback procedure in staging
- Be prepared for data loss
- Consider forward fixes first

### Rolling Back Migrations

**Step 1**: Identify migrations to rollback
```bash
cd server
npx prisma migrate status

# Example output:
# ✓ 20231201_initial
# ✓ 20231215_add_leave_types
# ✓ 20240101_add_performance  ← Rollback to here
# ✗ 20240115_add_documents    ← This migration
```

**Step 2**: Create rollback migration
```bash
# Option A: Manual rollback SQL
# Create new migration that reverses changes

# Example: Rollback add_documents migration
npx prisma migrate dev --create-only --name rollback_documents

# Edit migration file with rollback SQL:
-- DROP TABLE IF EXISTS "DocumentPermission";
-- DROP TABLE IF EXISTS "Document";
```

**Step 3**: Apply rollback migration
```bash
npx prisma migrate deploy
```

**Step 4**: Verify database state
```bash
npx prisma studio
# Verify tables and data
```

### Database Restore from Backup

If migrations cannot be rolled back safely:

**Step 1**: Stop application
```bash
pm2 stop nexus-hr-backend
```

**Step 2**: Restore database
```bash
# List available backups
ls -lh /backups/

# Restore from backup
./scripts/restore.sh /backups/nexus_hr_20240114_1200.sql
```

**Step 3**: Verify restoration
```bash
psql -U nexus_hr -d nexus_hr_db -c "\dt"
```

**Step 4**: Start application with compatible version
```bash
git checkout v1.2.2
cd server && npm run build
pm2 start nexus-hr-backend
```

---

## Docker Rollback

### Method 1: Using Previous Image

**Step 1**: List available images
```bash
docker images | grep nexus-hr

# Example:
# nexus-hr-backend   v1.2.3   abc123   1 hour ago
# nexus-hr-backend   v1.2.2   def456   1 day ago
# nexus-hr-frontend  v1.2.3   ghi789   1 hour ago
# nexus-hr-frontend  v1.2.2   jkl012   1 day ago
```

**Step 2**: Stop current containers
```bash
docker-compose down
```

**Step 3**: Update docker-compose.yml
```yaml
services:
  backend:
    image: nexus-hr-backend:v1.2.2  # Changed from v1.2.3

  frontend:
    image: nexus-hr-frontend:v1.2.2  # Changed from v1.2.3
```

**Step 4**: Start with previous version
```bash
docker-compose up -d
```

**Step 5**: Verify deployment
```bash
docker ps
docker logs nexus-hr-backend
docker logs nexus-hr-frontend
```

### Method 2: Using Docker Stack

If using Docker Swarm:

```bash
# Rollback to previous stack
docker service rollback nexus-hr_backend
docker service rollback nexus-hr_frontend

# Or rollback entire stack
docker stack deploy -c docker-compose.v1.2.2.yml nexus-hr
```

---

## Emergency Procedures

### Immediate Actions (First 5 Minutes)

1. **Assess Severity**
   ```bash
   # Check system status
   ./scripts/health-check.sh

   # Check error logs
   tail -f /var/log/nexus-hr/error.log

   # Check metrics
   curl http://localhost:9090/metrics
   ```

2. **Notify Team**
   ```bash
   # Alert team via Slack/Email
   # Include:
   # - Issue description
   # - Impact assessment
   # - Rollback decision
   ```

3. **Enable Maintenance Mode** (if available)
   ```bash
   # Create maintenance flag
   touch /var/www/nexus-hr/maintenance.html

   # nginx will serve this page
   ```

### Critical System Failure

If system is completely down:

1. **Restore Last Known Good State**
   ```bash
   # Use rollback script with emergency flag
   ./scripts/rollback.sh --emergency v1.2.2
   ```

2. **Restore Database from Backup**
   ```bash
   ./scripts/restore.sh --latest
   ```

3. **Verify All Services**
   ```bash
   systemctl status nginx
   systemctl status postgresql
   pm2 list
   ```

### Database Corruption

1. **Immediately Stop Application**
   ```bash
   pm2 stop all
   docker-compose down
   ```

2. **Assess Corruption**
   ```bash
   psql -U postgres -d nexus_hr_db

   # Check for corruption
   SELECT * FROM pg_stat_database;
   VACUUM ANALYZE;
   ```

3. **Restore from Last Good Backup**
   ```bash
   # Restore database
   ./scripts/restore.sh /backups/last_good_backup.sql

   # Verify restoration
   psql -U postgres -d nexus_hr_db -c "SELECT COUNT(*) FROM \"Employee\";"
   ```

---

## Post-Rollback Steps

### Immediate (0-1 Hour)

1. **Verify System Stability**
   ```bash
   # Monitor for 30 minutes
   watch -n 10 './scripts/health-check.sh'

   # Check error rates
   grep ERROR /var/log/nexus-hr/*.log | wc -l
   ```

2. **Notify Users**
   - Send status update
   - Explain what happened
   - Provide timeline for fix

3. **Document Incident**
   - What went wrong
   - What was rolled back
   - Current system state

### Short Term (1-24 Hours)

1. **Root Cause Analysis**
   - Identify what caused the issue
   - Why wasn't it caught in testing?
   - What can prevent this in future?

2. **Fix the Issue**
   - Create hotfix branch
   - Fix the problem
   - Add tests to catch the issue
   - Test thoroughly in staging

3. **Plan Re-deployment**
   - Schedule deployment time
   - Prepare communication
   - Have rollback plan ready

### Long Term (1-7 Days)

1. **Post-Mortem**
   - Write incident report
   - Share learnings with team
   - Update procedures

2. **Improve Processes**
   - Add more testing
   - Improve monitoring
   - Update deployment checklist
   - Practice rollback procedures

3. **Update Documentation**
   - Document new issues found
   - Update rollback procedures
   - Share knowledge

---

## Rollback Testing

### Regular Rollback Drills

Practice rollback procedures monthly:

```bash
# 1. Deploy test version
git checkout test-rollback-branch
./scripts/deploy.sh

# 2. Verify deployment
./scripts/health-check.sh

# 3. Perform rollback
./scripts/rollback.sh previous-version

# 4. Verify rollback
./scripts/health-check.sh

# 5. Document time taken and issues
```

### Staging Environment Testing

Always test rollback in staging first:

1. Replicate production issue in staging
2. Perform rollback procedure
3. Verify system state
4. Document any issues
5. Update procedure if needed

---

## Rollback Prevention

### Before Deployment

- [ ] All tests passing
- [ ] Code review completed
- [ ] Staging deployment successful
- [ ] Performance tested
- [ ] Security scan completed
- [ ] Database migrations reviewed
- [ ] Rollback plan prepared
- [ ] Team briefed

### Deployment Best Practices

1. **Blue-Green Deployment**
   - Keep old version running
   - Deploy new version to separate environment
   - Switch traffic when verified
   - Easy rollback by switching back

2. **Canary Deployment**
   - Deploy to small percentage of users
   - Monitor for issues
   - Gradually increase traffic
   - Quick rollback if issues found

3. **Feature Flags**
   - Deploy code disabled
   - Enable features gradually
   - Disable if issues occur
   - No deployment needed to rollback

---

## Rollback Checklist

### Pre-Rollback
- [ ] Issue confirmed and severity assessed
- [ ] Stakeholders notified
- [ ] Backup verified
- [ ] Previous version identified
- [ ] Team ready to assist

### During Rollback
- [ ] Maintenance mode enabled (if applicable)
- [ ] Application stopped
- [ ] Previous version deployed
- [ ] Database handled appropriately
- [ ] Services restarted

### Post-Rollback
- [ ] Health checks passing
- [ ] Monitoring normal
- [ ] Users notified
- [ ] Incident documented
- [ ] Fix planned

---

## Emergency Contacts

Maintain list of emergency contacts:

- **DevOps Lead**: [Contact]
- **Database Admin**: [Contact]
- **System Admin**: [Contact]
- **Engineering Manager**: [Contact]
- **On-Call Engineer**: [Contact]

---

## References

- [Deployment Guide](./DEPLOYMENT.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Backup Scripts](../scripts/backup.sh)
- [Rollback Scripts](../scripts/rollback.sh)

---

Remember: **Prevention is better than rollback**. Invest in:
- Comprehensive testing
- Proper monitoring
- Gradual rollouts
- Feature flags
- Regular backup testing
