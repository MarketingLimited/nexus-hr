# Kubernetes Deployment - Production Infrastructure

## Purpose

Kubernetes manifests لنشر نظام Nexus HR على Kubernetes cluster مع PostgreSQL database، nginx ingress، TLS certificates، وscaling configuration.

## Owned Scope

- **K8s Manifests**: YAML files للـ deployment configuration
- **Networking**: Services، Ingress، TLS certificates
- **Storage**: Persistent Volumes للـ database
- **Secrets & Config**: Environment variables وsensitive data
- **Scaling**: HPA (Horizontal Pod Autoscaler) configuration

## Key Files & Entry Points

### Core Manifests
- **`namespace.yaml`** - Creates `nexus-hr` namespace
- **`configmap.yaml`** - Non-sensitive configuration (NODE_ENV، PORT، etc.)
- **`secrets.yaml.example`** - Template للـ sensitive data (DATABASE_URL، JWT_SECRET)
- **`pv-pvc.yaml`** - Persistent Volume وPersistent Volume Claim للـ postgres
- **`deployment.yaml`** - Deployments لـ frontend، backend، postgres
- **`service.yaml`** - Kubernetes Services للـ internal communication
- **`ingress.yaml`** - nginx Ingress للـ external access + TLS

### Supporting Files
- **`README.md`** - Detailed deployment instructions

## Dependencies & Interfaces

### Prerequisites
- **Kubernetes Cluster**: v1.24+
- **kubectl**: CLI configured
- **nginx-ingress-controller**: للـ ingress handling
- **cert-manager**: للـ automatic TLS certificates (Let's Encrypt)

### Docker Images
- **Backend**: `nexus-hr-backend:latest`
- **Frontend**: `nexus-hr-frontend:latest`
- **Database**: `postgres:16-alpine`

## Local Rules / Patterns

### Namespace Organization
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: nexus-hr
```

### Secrets Management
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: nexus-hr-secrets
  namespace: nexus-hr
type: Opaque
data:
  DATABASE_URL: <base64-encoded-value>
  JWT_SECRET: <base64-encoded-value>
```

**⚠️ Security**: لا تcommit `secrets.yaml` إلى Git!

### Deployment Pattern
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: nexus-hr
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    spec:
      containers:
      - name: backend
        image: nexus-hr-backend:latest
        envFrom:
        - configMapRef:
            name: nexus-hr-config
        - secretRef:
            name: nexus-hr-secrets
```

### Service Pattern
```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: nexus-hr
spec:
  type: ClusterIP
  ports:
  - port: 3001
    targetPort: 3001
  selector:
    app: backend
```

## How to Run / Test

### Initial Deployment

```bash
# 1. Create namespace
kubectl apply -f namespace.yaml

# 2. Setup secrets
cp secrets.yaml.example secrets.yaml
# عدّل secrets.yaml بالقيم الحقيقية
kubectl apply -f secrets.yaml

# 3. Apply config
kubectl apply -f configmap.yaml

# 4. Create storage
kubectl apply -f pv-pvc.yaml

# 5. Deploy all components
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml

# 6. Deploy ingress
kubectl apply -f ingress.yaml

# 7. Verify
kubectl get all -n nexus-hr
```

### Verification Commands

```bash
# Check pod status
kubectl get pods -n nexus-hr

# View logs
kubectl logs -f deployment/backend -n nexus-hr

# Test backend health
kubectl run -it --rm test \
  --image=busybox \
  --restart=Never \
  --namespace=nexus-hr \
  -- wget -O- http://backend:3001/health
```

## Common Tasks for Agents

### 1. Scale Deployment

```bash
# Manual scaling
kubectl scale deployment/backend --replicas=5 -n nexus-hr

# Auto-scaling (HPA)
kubectl autoscale deployment backend \
  --cpu-percent=70 \
  --min=3 \
  --max=10 \
  -n nexus-hr
```

### 2. Update Application

```bash
# Update backend image
kubectl set image deployment/backend \
  backend=nexus-hr-backend:v1.2.3 \
  -n nexus-hr

# Check rollout status
kubectl rollout status deployment/backend -n nexus-hr

# Rollback if needed
kubectl rollout undo deployment/backend -n nexus-hr
```

### 3. Debug Pod Issues

```bash
# Describe pod
kubectl describe pod <pod-name> -n nexus-hr

# Get logs
kubectl logs <pod-name> -n nexus-hr

# Execute commands in pod
kubectl exec -it <pod-name> -n nexus-hr -- /bin/sh
```

### 4. Backup Database

```bash
# Create backup
kubectl run postgres-backup \
  --image=postgres:16-alpine \
  --restart=Never \
  --namespace=nexus-hr \
  --command -- bash -c "pg_dump -h postgres -U \$POSTGRES_USER \$POSTGRES_DB > /backup/backup.sql"

# Copy to local
kubectl cp nexus-hr/postgres-backup:/backup/backup.sql ./backups/
```

## Notes / Gotchas

### ⚠️ مشاكل شائعة

1. **Pods في CrashLoopBackOff**
   ```bash
   kubectl logs <pod-name> -n nexus-hr
   
   # Common causes:
   # - Database not ready
   # - Missing secrets/configmap
   # - Wrong image tag
   ```

2. **Ingress لا يعمل (502 Bad Gateway)**
   ```bash
   kubectl describe ingress nexus-hr-ingress -n nexus-hr
   kubectl logs -n ingress-nginx deployment/ingress-nginx-controller
   ```

3. **TLS Certificate لا يُصدر**
   ```bash
   kubectl get certificate -n nexus-hr
   kubectl describe certificate nexushr-tls -n nexus-hr
   ```

### 📝 Best Practices

- **Namespaces**: استخدم namespaces للعزل
- **Resource Limits**: حدد CPU/Memory limits
- **Health Checks**: استخدم liveness وreadiness probes
- **Secrets**: لا تcommit secrets إلى Git
- **Backups**: automatic database backups

### 🔒 Security Checklist

- ✅ Secrets stored في Kubernetes Secrets
- ✅ TLS enabled للـ ingress
- ✅ Network policies للعزل
- ✅ RBAC configured
- ✅ Run containers as non-root

### 📚 مراجع

- **Kubernetes Docs**: https://kubernetes.io/docs/
- **nginx-ingress**: https://kubernetes.github.io/ingress-nginx/
- **cert-manager**: https://cert-manager.io/docs/
- **Deployment Guide**: `../docs/DEPLOYMENT.md`
