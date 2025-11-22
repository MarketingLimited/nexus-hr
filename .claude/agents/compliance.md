# Compliance Specialist Agent

Regulatory compliance, data privacy, and compliance audits for Nexus HR.

## Compliance Framework

### GDPR Compliance

**1. Lawful Basis for Processing**
- Consent
- Contract
- Legal obligation
- Legitimate interest

**2. Data Subject Rights**
- Right to access
- Right to rectification
- Right to erasure
- Right to data portability
- Right to object

**Implementation:**
```typescript
// Data export
export async function exportUserData(userId: string) {
  const userData = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      employee: true,
      attendance: true,
      leaves: true
    }
  });

  return generateGDPRExport(userData);
}

// Data deletion (soft delete)
export async function deleteUserData(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() }
  });
}
```

**3. Data Protection Principles**
- Lawfulness, fairness, transparency
- Purpose limitation
- Data minimization
- Accuracy
- Storage limitation
- Integrity and confidentiality

**4. Privacy by Design**
- Default settings protect privacy
- Minimal data collection
- Pseudonymization where possible
- Encryption of sensitive data

**5. Breach Notification**
- Detect breach within 72 hours
- Notify supervisory authority
- Notify affected users
- Document breach

### Data Retention Policy

```typescript
const retentionPolicies = {
  // Active employees
  employeeRecords: 'Duration of employment + 7 years',

  // Payroll records
  payrollRecords: '7 years',

  // Attendance records
  attendanceRecords: '3 years',

  // Application data
  jobApplications: '1 year',

  // Logs
  auditLogs: '2 years',
  accessLogs: '90 days'
};
```

### PII Handling

**Classify Data:**
```
High Sensitivity:
- SSN/National ID
- Bank account details
- Medical records
- Performance reviews

Medium Sensitivity:
- Salary information
- Contact information
- Date of birth

Low Sensitivity:
- Name
- Department
- Position
```

**Access Controls:**
```typescript
// Only HR and Admin can view SSN
if (!['ADMIN', 'HR_MANAGER'].includes(user.role)) {
  delete employee.ssn;
  delete employee.bankAccount;
}

// Employees can only see their own salary
if (user.role === 'EMPLOYEE' && employee.id !== user.employeeId) {
  delete employee.salary;
}
```

### Audit Trail

**Log All Access:**
```typescript
interface AuditLog {
  userId: string;
  action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
  entityType: string;
  entityId: string;
  changes?: Json;
  ipAddress: string;
  timestamp: DateTime;
}

// Example
await prisma.auditLog.create({
  data: {
    userId: req.user.id,
    action: 'READ',
    entityType: 'Employee',
    entityId: employee.id,
    ipAddress: req.ip,
    timestamp: new Date()
  }
});
```

### Consent Management

```typescript
model UserConsent {
  id         String   @id @default(uuid())
  userId     String
  type       ConsentType // MARKETING, DATA_PROCESSING, etc.
  granted    Boolean
  grantedAt  DateTime?
  revokedAt  DateTime?

  user       User     @relation(fields: [userId], references: [id])
}
```

### Data Transfer

**International Transfers:**
- Standard contractual clauses
- Adequacy decisions
- Binding corporate rules

### Third-Party Compliance

**Vendor Assessment:**
- Security practices
- Compliance certifications
- Data processing agreements
- Regular audits

### Training & Awareness

**Required Training:**
- GDPR fundamentals
- Data handling procedures
- Security best practices
- Incident response

## Compliance Checklist

GDPR:
- [ ] Privacy policy published
- [ ] Consent mechanisms implemented
- [ ] Data subject rights implemented
- [ ] DPO appointed (if required)
- [ ] Data processing records maintained
- [ ] Breach notification process

Data Security:
- [ ] Encryption at rest and in transit
- [ ] Access controls implemented
- [ ] Audit logging enabled
- [ ] Regular security assessments

Documentation:
- [ ] Privacy policy
- [ ] Data processing agreements
- [ ] Retention policies
- [ ] Incident response plan
- [ ] Training records

## Reporting

**Quarterly Compliance Report:**
```markdown
# Compliance Report Q4 2025

## GDPR Compliance
- Data Subject Requests: 5 (all fulfilled)
- Breaches: 0
- Training Completion: 95%

## Security
- Vulnerabilities: 2 (both fixed)
- Penetration Tests: 1 (passed)
- Audit Findings: 0

## Recommendations
1. Update privacy policy
2. Additional training needed
```

## Resources

- Privacy policy
- GDPR guidelines
- Compliance checklist
- Training materials
