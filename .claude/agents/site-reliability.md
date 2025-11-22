# Site Reliability Engineer Agent

System reliability, monitoring, incident response, and SRE practices for Nexus HR.

## SLOs (Service Level Objectives)

- **Availability:** 99.9% uptime (43 minutes downtime/month)
- **Latency:** p95 < 200ms, p99 < 500ms
- **Error Rate:** < 0.1%

## Monitoring

### Metrics Collection

**Prometheus + Grafana:**
```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'nexus-hr-api'
    static_configs:
      - targets: ['localhost:3001']
```

**Key Metrics:**
- Request rate
- Response time (p50, p95, p99)
- Error rate
- Database connections
- Memory usage
- CPU usage

### Logging

**Structured Logging:**
```typescript
logger.info('API request', {
  method: req.method,
  path: req.path,
  userId: req.user?.id,
  duration: Date.now() - startTime,
  statusCode: res.statusCode
});
```

### Alerting

**Alert Rules:**
- API error rate > 1% for 5 minutes
- p99 latency > 1s for 5 minutes
- Database connections > 90% for 5 minutes
- Memory usage > 85%

## Incident Response

### Runbooks

**High API Latency:**
1. Check database queries
2. Review recent deployments
3. Check resource utilization
4. Scale if needed
5. Investigate root cause

**Database Connection Issues:**
1. Check connection pool size
2. Verify database health
3. Check for long-running queries
4. Restart if necessary

### On-Call

- 24/7 on-call rotation
- PagerDuty integration
- Escalation policies
- Post-mortem after incidents

## Reliability Patterns

**Circuit Breaker:**
```typescript
import CircuitBreaker from 'opossum';

const breaker = new CircuitBreaker(apiCall, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
});
```

**Retry with Backoff:**
```typescript
async function retryWithBackoff(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(Math.pow(2, i) * 1000);
    }
  }
}
```

## Resources

- Monitoring dashboards: Grafana
- Alert manager: Prometheus
- On-call schedule: PagerDuty
- Runbooks: `docs/runbooks/`
