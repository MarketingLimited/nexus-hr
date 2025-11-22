# Security Engineer Agent

Security best practices, threat modeling, and security architecture for Nexus HR.

## Threat Modeling

### STRIDE Analysis

**Spoofing:**
- Weak authentication
- Stolen credentials
- Mitigation: MFA, strong passwords, JWT

**Tampering:**
- Data modification
- Mitigation: Input validation, integrity checks

**Repudiation:**
- No audit trail
- Mitigation: Audit logging, immutable logs

**Information Disclosure:**
- Data leaks
- Mitigation: Encryption, access controls

**Denial of Service:**
- Resource exhaustion
- Mitigation: Rate limiting, timeouts

**Elevation of Privilege:**
- Broken access control
- Mitigation: RBAC, least privilege

## Security Architecture

### Defense in Depth

```
Layer 1: Network (Firewall, WAF)
Layer 2: Application (Auth, Input Validation)
Layer 3: Data (Encryption, Access Control)
Layer 4: Monitoring (Logging, Alerts)
```

### Zero Trust Model

- Verify explicitly
- Least privilege access
- Assume breach

## Security Controls

### 1. Access Control Matrix

```
| Resource      | Admin | HR Mgr | Manager | Employee |
|---------------|-------|--------|---------|----------|
| View All Emp  | ✓     | ✓      | Dept    | Self     |
| Edit Emp      | ✓     | ✓      | ✗       | ✗        |
| View Salary   | ✓     | ✓      | ✗       | Self     |
| Process Payroll| ✓    | ✓      | ✗       | ✗        |
```

### 2. Encryption Standards

**At Rest:**
- Database: PostgreSQL encryption
- Files: AES-256

**In Transit:**
- HTTPS/TLS 1.3
- Certificate management

### 3. Secret Management

```bash
# Never commit secrets
# Use environment variables
DATABASE_URL=postgresql://...
JWT_SECRET=...

# Or use secret management
# AWS Secrets Manager
# HashiCorp Vault
```

### 4. Security Monitoring

**Log Security Events:**
- Failed logins
- Permission denials
- Data access
- Configuration changes

**Alerts:**
- Multiple failed logins
- Privilege escalation attempts
- Unusual data access patterns

### 5. Incident Response Plan

1. **Detect:** Monitor for anomalies
2. **Contain:** Isolate affected systems
3. **Investigate:** Root cause analysis
4. **Remediate:** Fix vulnerability
5. **Review:** Lessons learned

## Security Testing

### Penetration Testing
- Annual external pentest
- Quarterly internal review

### Vulnerability Scanning
- Weekly dependency scans
- Monthly application scans

### Security Code Review
- All PRs reviewed for security
- Automated security scanning

## Compliance

### GDPR Requirements
- User consent
- Data portability
- Right to deletion
- Data minimization
- Breach notification

### Security Standards
- OWASP Top 10
- CWE Top 25
- SANS Top 20

## Resources

- Security guide: `docs/SECURITY.md`
- Incident response plan
- Security training
