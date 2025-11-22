# Migration Specialist Agent

Data migration, system migration, and version upgrades for Nexus HR.

## Migration Types

### 1. Data Migration

**From Legacy System:**
```typescript
// Extract data from old system
const legacyData = await extractFromLegacyDB();

// Transform to new format
const transformedData = legacyData.map(record => ({
  firstName: record.fname,
  lastName: record.lname,
  email: record.email_address,
  hireDate: new Date(record.hire_dt)
}));

// Validate
const validData = transformedData.filter(isValid);

// Load into new system
await prisma.employee.createMany({ data: validData });
```

**CSV Import:**
```typescript
import fs from 'fs';
import csv from 'csv-parser';

export async function migrateFromCSV(filePath: string) {
  const employees = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        employees.push({
          firstName: row['First Name'],
          lastName: row['Last Name'],
          email: row['Email'],
          hireDate: new Date(row['Hire Date'])
        });
      })
      .on('end', async () => {
        await prisma.employee.createMany({
          data: employees,
          skipDuplicates: true
        });
        resolve(employees.length);
      })
      .on('error', reject);
  });
}
```

### 2. Database Schema Migration

**Using Prisma Migrate:**
```bash
# Create migration
cd server && npx prisma migrate dev --name add_department_budget

# Review generated SQL
cat server/prisma/migrations/*/migration.sql

# Apply to production
cd server && npx prisma migrate deploy
```

**Safe Migration Patterns:**
```prisma
// ✅ Safe: Add nullable field
model Employee {
  middleName String?
}

// ✅ Safe: Add with default
model Employee {
  status EmployeeStatus @default(ACTIVE)
}

// ⚠️  Requires care: Add required field
// Step 1: Add as nullable
model Employee {
  departmentId String?
}
// Step 2: Populate data
// Step 3: Make required
model Employee {
  departmentId String  // Remove ?
}

// ❌ Dangerous: Drop column
// Backup data first!
```

### 3. Version Upgrades

**Node.js Version Upgrade:**
```bash
# Update package.json
"engines": {
  "node": ">=18.0.0"
}

# Update Dockerfile
FROM node:18-alpine

# Test locally
nvm use 18
npm test

# Deploy to staging
# Test thoroughly
# Deploy to production
```

**Dependency Upgrades:**
```bash
# Check outdated packages
npm outdated

# Update minor/patch versions
npm update

# Update major versions (carefully)
npm install react@latest
npm install @types/react@latest

# Test thoroughly
npm test
npm run build
```

### 4. Database Engine Migration

**PostgreSQL 14 → 16:**
```bash
# 1. Backup current database
pg_dump -h localhost -U postgres nexus_hr > backup.sql

# 2. Install PostgreSQL 16

# 3. Create new database
createdb -h localhost -U postgres nexus_hr_new

# 4. Restore backup
psql -h localhost -U postgres nexus_hr_new < backup.sql

# 5. Test application

# 6. Switch over
```

## Migration Planning

### Pre-Migration Checklist

- [ ] Backup all data
- [ ] Test migration in dev environment
- [ ] Test migration in staging
- [ ] Document rollback procedure
- [ ] Schedule maintenance window
- [ ] Notify users
- [ ] Prepare monitoring

### Migration Steps

1. **Backup:** Create full backup
2. **Dry Run:** Test on copy of production data
3. **Validation:** Verify data integrity
4. **Schedule:** Set maintenance window
5. **Execute:** Run migration
6. **Verify:** Check data completeness
7. **Monitor:** Watch for issues
8. **Communicate:** Notify users of completion

### Post-Migration Checklist

- [ ] Verify data integrity
- [ ] Test critical functionality
- [ ] Check performance
- [ ] Monitor error rates
- [ ] Collect user feedback
- [ ] Document lessons learned

## Data Validation

```typescript
export async function validateMigration() {
  // Count records
  const oldCount = await getOldSystemCount();
  const newCount = await prisma.employee.count();

  if (oldCount !== newCount) {
    throw new Error(`Record count mismatch: ${oldCount} vs ${newCount}`);
  }

  // Sample validation
  const samples = await prisma.employee.findMany({ take: 100 });

  for (const employee of samples) {
    const oldRecord = await getOldRecord(employee.legacyId);

    assert.equal(employee.email, oldRecord.email);
    assert.equal(employee.firstName, oldRecord.firstName);
  }

  console.log('✅ Migration validated successfully');
}
```

## Rollback Procedures

**Database Rollback:**
```bash
# Restore from backup
psql -h localhost -U postgres nexus_hr < backup_pre_migration.sql

# Or use point-in-time recovery
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier nexus-hr \
  --target-db-instance-identifier nexus-hr-rollback \
  --restore-time 2025-11-22T10:00:00Z
```

**Application Rollback:**
```bash
# Revert to previous version
git revert <commit-hash>
git push origin main

# Or redeploy previous version
kubectl rollout undo deployment/nexus-hr-backend
```

## Zero-Downtime Migration

**Blue-Green Deployment:**
```
1. Deploy new version (green)
2. Run migration on copy of database
3. Test green environment
4. Switch traffic to green
5. Monitor
6. Decommission blue if successful
```

**Database Replication:**
```
1. Set up replica
2. Run migration on replica
3. Test with replica
4. Promote replica to primary
5. Old primary becomes replica
```

## Resources

- Migration scripts: `server/src/migrations/`
- Backup procedures: `docs/BACKUP.md`
- Rollback guide: `docs/ROLLBACK.md`
- Database migrations: `server/prisma/migrations/`
