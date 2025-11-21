# Kubernetes Deployment - Nexus HR

This directory contains Kubernetes manifests for deploying Nexus HR to a Kubernetes cluster.

## Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured
- Helm 3.x (for cert-manager)
- nginx-ingress-controller installed
- cert-manager installed (for TLS certificates)

## Quick Start

### 1. Create Namespace

```bash
kubectl apply -f namespace.yaml
```

### 2. Configure Secrets

```bash
# Copy the secrets template
cp secrets.yaml.example secrets.yaml

# Edit secrets.yaml with your actual values
# Then encode values to base64:
echo -n 'your-value' | base64

# Apply secrets
kubectl apply -f secrets.yaml
```

### 3. Apply ConfigMap

```bash
kubectl apply -f configmap.yaml
```

### 4. Create Persistent Volumes

```bash
kubectl apply -f pv-pvc.yaml
```

### 5. Deploy Database

```bash
kubectl apply -f deployment.yaml
# Wait for postgres to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n nexus-hr --timeout=300s
```

### 6. Run Database Migrations

```bash
# Create a job to run migrations
kubectl run prisma-migrate \
  --image=nexus-hr-backend:latest \
  --restart=Never \
  --namespace=nexus-hr \
  --command -- npx prisma migrate deploy

# Check migration status
kubectl logs -n nexus-hr prisma-migrate

# Clean up
kubectl delete pod prisma-migrate -n nexus-hr
```

### 7. Deploy Application

```bash
# Deploy backend and frontend
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# Wait for deployments
kubectl wait --for=condition=available deployment/backend -n nexus-hr --timeout=300s
kubectl wait --for=condition=available deployment/frontend -n nexus-hr --timeout=300s
```

### 8. Configure Ingress

```bash
# Install cert-manager (if not already installed)
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
cat <<EOF | kubectl apply -f -
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@nexushr.com  # Change this
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF

# Apply ingress
kubectl apply -f ingress.yaml
```

### 9. Verify Deployment

```bash
# Check all resources
kubectl get all -n nexus-hr

# Check pods
kubectl get pods -n nexus-hr

# Check services
kubectl get svc -n nexus-hr

# Check ingress
kubectl get ingress -n nexus-hr

# View logs
kubectl logs -f deployment/backend -n nexus-hr
kubectl logs -f deployment/frontend -n nexus-hr
```

## Architecture

```
Internet
    │
    ▼
┌─────────────┐
│   Ingress   │ (nginx)
└──────┬──────┘
       │
   ┌───┴───┐
   │       │
   ▼       ▼
Frontend Backend
   │       │
   │       ▼
   │   PostgreSQL
   │       │
   └───────┴─── Persistent Volume
```

## Manifest Files

| File | Description |
|------|-------------|
| `namespace.yaml` | Creates nexus-hr namespace |
| `configmap.yaml` | Non-sensitive configuration |
| `secrets.yaml.example` | Template for secrets |
| `pv-pvc.yaml` | Persistent storage for database |
| `deployment.yaml` | Deployments for all components |
| `service.yaml` | Services for internal communication |
| `ingress.yaml` | External access configuration |

## Scaling

### Manual Scaling

```bash
# Scale backend
kubectl scale deployment/backend --replicas=5 -n nexus-hr

# Scale frontend
kubectl scale deployment/frontend --replicas=3 -n nexus-hr
```

### Horizontal Pod Autoscaler

```bash
# Create HPA for backend
kubectl autoscale deployment backend \
  --cpu-percent=70 \
  --min=3 \
  --max=10 \
  -n nexus-hr

# Create HPA for frontend
kubectl autoscale deployment frontend \
  --cpu-percent=70 \
  --min=2 \
  --max=5 \
  -n nexus-hr

# Check HPA status
kubectl get hpa -n nexus-hr
```

## Monitoring

### View Logs

```bash
# Stream logs from backend
kubectl logs -f deployment/backend -n nexus-hr

# View logs from all backend pods
kubectl logs -l app=backend -n nexus-hr --tail=100

# View logs from specific pod
kubectl logs <pod-name> -n nexus-hr
```

### Resource Usage

```bash
# View resource usage
kubectl top pods -n nexus-hr
kubectl top nodes

# Describe deployment
kubectl describe deployment/backend -n nexus-hr
```

## Backup & Restore

### Backup Database

```bash
# Create backup job
kubectl run postgres-backup \
  --image=postgres:16-alpine \
  --restart=Never \
  --namespace=nexus-hr \
  --command -- bash -c "pg_dump -h postgres -U \$POSTGRES_USER \$POSTGRES_DB > /backup/nexus_hr_\$(date +%Y%m%d_%H%M%S).sql"

# Copy backup to local
kubectl cp nexus-hr/postgres-backup:/backup/nexus_hr_*.sql ./backups/
```

### Restore Database

```bash
# Upload backup to pod
kubectl cp ./backups/backup.sql nexus-hr/postgres:/tmp/backup.sql

# Restore
kubectl exec -it postgres -n nexus-hr -- psql -U $POSTGRES_USER -d $POSTGRES_DB -f /tmp/backup.sql
```

## Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl describe pod <pod-name> -n nexus-hr

# Check events
kubectl get events -n nexus-hr --sort-by='.lastTimestamp'

# Check logs
kubectl logs <pod-name> -n nexus-hr --previous
```

### Database Connection Issues

```bash
# Test database connection
kubectl run -it --rm debug \
  --image=postgres:16-alpine \
  --restart=Never \
  --namespace=nexus-hr \
  -- psql -h postgres -U $POSTGRES_USER -d $POSTGRES_DB

# Check postgres logs
kubectl logs deployment/postgres -n nexus-hr
```

### Ingress Not Working

```bash
# Check ingress details
kubectl describe ingress nexus-hr-ingress -n nexus-hr

# Check nginx-ingress logs
kubectl logs -n ingress-nginx deployment/ingress-nginx-controller

# Test internal connectivity
kubectl run -it --rm test \
  --image=busybox \
  --restart=Never \
  --namespace=nexus-hr \
  -- wget -O- http://backend:3001/health
```

## Updates & Rollouts

### Rolling Update

```bash
# Update image
kubectl set image deployment/backend \
  backend=nexus-hr-backend:v1.2.3 \
  -n nexus-hr

# Check rollout status
kubectl rollout status deployment/backend -n nexus-hr

# View rollout history
kubectl rollout history deployment/backend -n nexus-hr
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/backend -n nexus-hr

# Rollback to specific revision
kubectl rollout undo deployment/backend --to-revision=2 -n nexus-hr
```

## Security Best Practices

1. **Use Secrets for Sensitive Data**
   - Never commit secrets to git
   - Use external secret management (e.g., HashiCorp Vault)

2. **Network Policies**
   ```bash
   # Apply network policies
   kubectl apply -f network-policy.yaml
   ```

3. **RBAC**
   ```bash
   # Create service account with minimal permissions
   kubectl create serviceaccount nexus-hr-sa -n nexus-hr
   ```

4. **Pod Security**
   - Run as non-root user
   - Read-only root filesystem
   - No privilege escalation

5. **Regular Updates**
   - Keep Kubernetes cluster updated
   - Update container images regularly
   - Apply security patches promptly

## Clean Up

### Delete All Resources

```bash
# Delete namespace (will delete all resources in it)
kubectl delete namespace nexus-hr

# Or delete individually
kubectl delete -f ingress.yaml
kubectl delete -f service.yaml
kubectl delete -f deployment.yaml
kubectl delete -f pv-pvc.yaml
kubectl delete -f configmap.yaml
kubectl delete -f secrets.yaml
```

## Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [nginx-ingress Documentation](https://kubernetes.github.io/ingress-nginx/)
- [cert-manager Documentation](https://cert-manager.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)

## Support

For issues and questions:
- GitHub Issues: https://github.com/MarketingLimited/nexus-hr/issues
- Documentation: `/docs` directory
