# Deployment Guide

Complete guide for deploying Nexus HR to production environments.

## Table of Contents

- [Quick Deploy with Docker](#quick-deploy-with-docker)
- [Production Deployment](#production-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Environment Variables](#environment-variables)
- [CI/CD Pipeline](#cicd-pipeline)
- [SSL/HTTPS Setup](#sslhttps-setup)
- [Monitoring](#monitoring)
- [Backup & Recovery](#backup--recovery)

## Quick Deploy with Docker

### Prerequisites

- Docker and Docker Compose installed
- Domain name (optional, for SSL)
- At least 2GB RAM, 2 CPU cores, 20GB storage

### Step 1: Prepare Environment

```bash
# Clone the repository
git clone https://github.com/your-org/nexus-hr.git
cd nexus-hr

# Copy and configure environment file
cp .env.production .env

# Edit .env with your production values
nano .env
```

**Important**: Update these values in `.env`:
```env
# Strong database password
POSTGRES_PASSWORD=your-strong-password-here

# Secure JWT secret (use: openssl rand -base64 32)
JWT_SECRET=your-generated-jwt-secret

# Your domain
CORS_ORIGIN=https://yourdomain.com
VITE_API_URL=https://yourdomain.com/api
```

### Step 2: Build and Start Services

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check service status
docker-compose ps
```

### Step 3: Initialize Database

```bash
# Run migrations and seed data
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed
```

### Step 4: Verify Deployment

```bash
# Check backend health
curl http://localhost:3001/health

# Check frontend
curl http://localhost/health
```

**That's it!** Your application is now running:
- Frontend: http://localhost
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

## Production Deployment

### Using Docker Compose (Recommended)

1. **Set up production server**
   ```bash
   # On your server (Ubuntu/Debian)
   sudo apt update
   sudo apt install docker.io docker-compose nginx certbot python3-certbot-nginx
   ```

2. **Configure firewall**
   ```bash
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

3. **Deploy application**
   ```bash
   cd /opt
   sudo git clone https://github.com/your-org/nexus-hr.git
   cd nexus-hr
   sudo cp .env.production .env
   sudo nano .env  # Update with production values
   sudo docker-compose up -d
   ```

4. **Set up SSL with Nginx reverse proxy**

   Create `/etc/nginx/sites-available/nexus-hr`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;

       location / {
           proxy_pass http://localhost:80;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:3001/api;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   Enable site and get SSL:
   ```bash
   sudo ln -s /etc/nginx/sites-available/nexus-hr /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   sudo certbot --nginx -d yourdomain.com
   ```

### Environment-Specific Configurations

#### Development
```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```

#### Staging
```bash
# Use staging environment variables
cp .env.staging .env
docker-compose up -d
```

#### Production
```bash
# Use production environment variables
cp .env.production .env
docker-compose up -d
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster (GKE, EKS, AKS, or self-hosted)
- kubectl configured
- Helm 3+ installed

### Step 1: Create Namespace

```bash
kubectl create namespace nexus-hr
```

### Step 2: Create Secrets

```bash
# Database credentials
kubectl create secret generic postgres-secret \
  --from-literal=username=postgres \
  --from-literal=password=YOUR_STRONG_PASSWORD \
  -n nexus-hr

# JWT secret
kubectl create secret generic jwt-secret \
  --from-literal=secret=$(openssl rand -base64 32) \
  -n nexus-hr
```

### Step 3: Deploy Database

```yaml
# postgres-deployment.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: nexus-hr
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16-alpine
        env:
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        - name: POSTGRES_DB
          value: nexus_hr
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: nexus-hr
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
```

### Step 4: Deploy Backend

```yaml
# backend-deployment.yaml
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
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/your-org/nexus-hr-backend:latest
        env:
        - name: DATABASE_URL
          value: postgresql://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@postgres:5432/nexus_hr
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: jwt-secret
              key: secret
        - name: NODE_ENV
          value: production
        - name: PORT
          value: "3001"
        ports:
        - containerPort: 3001
---
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: nexus-hr
spec:
  selector:
    app: backend
  ports:
  - port: 3001
    targetPort: 3001
```

### Step 5: Deploy Frontend with Ingress

```yaml
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: nexus-hr
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: ghcr.io/your-org/nexus-hr-frontend:latest
        ports:
        - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: frontend
  namespace: nexus-hr
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nexus-hr-ingress
  namespace: nexus-hr
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - yourdomain.com
    secretName: nexus-hr-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: backend
            port:
              number: 3001
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

### Deploy to Kubernetes

```bash
kubectl apply -f postgres-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml

# Check deployment status
kubectl get pods -n nexus-hr
kubectl get services -n nexus-hr
kubectl get ingress -n nexus-hr
```

## Environment Variables

### Frontend Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API URL | `/api` | Yes |
| `VITE_USE_MSW` | Use mock service worker | `false` | No |

### Backend Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `PORT` | Server port | `3001` | No |
| `NODE_ENV` | Environment | `production` | Yes |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRES_IN` | Token expiration | `7d` | No |
| `CORS_ORIGIN` | Allowed CORS origin | - | Yes |

## CI/CD Pipeline

The project includes GitHub Actions workflows for automated deployment.

### Setup GitHub Actions

1. **Add secrets to your repository**:
   - Go to Settings → Secrets and variables → Actions
   - Add these secrets:
     - `JWT_SECRET`: Your JWT secret
     - `VITE_API_URL`: Your production API URL
     - `DEPLOY_SSH_KEY`: SSH key for deployment (if using SSH)
     - `DEPLOY_HOST`: Deployment server hostname
     - `DEPLOY_USER`: Deployment user

2. **Workflows included**:
   - `.github/workflows/ci.yml` - Run tests and build on PR
   - `.github/workflows/deploy.yml` - Deploy to production on merge to main

### Manual Deployment

```bash
# Tag a release
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# This triggers the deployment workflow
```

## SSL/HTTPS Setup

### Using Let's Encrypt (Recommended)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

### Using Custom Certificate

1. Place your certificates:
   ```bash
   /etc/ssl/certs/yourdomain.com.crt
   /etc/ssl/private/yourdomain.com.key
   ```

2. Update Nginx configuration:
   ```nginx
   server {
       listen 443 ssl http2;
       server_name yourdomain.com;

       ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
       ssl_certificate_key /etc/ssl/private/yourdomain.com.key;

       # ... rest of config
   }
   ```

## Monitoring

### Health Checks

The application provides health check endpoints:

- **Frontend**: `GET /health`
- **Backend**: `GET /health`
- **Database**: Checked via backend connection

### Logging

View logs:
```bash
# Docker Compose
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres

# Kubernetes
kubectl logs -f deployment/backend -n nexus-hr
kubectl logs -f deployment/frontend -n nexus-hr
```

### Metrics (Optional)

Add Prometheus monitoring:

```yaml
# prometheus.yml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
```

## Backup & Recovery

### Database Backup

```bash
# Manual backup
docker-compose exec postgres pg_dump -U postgres nexus_hr > backup.sql

# Restore
docker-compose exec -T postgres psql -U postgres nexus_hr < backup.sql
```

### Automated Backups

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * docker-compose -f /opt/nexus-hr/docker-compose.yml exec -T postgres pg_dump -U postgres nexus_hr | gzip > /backups/nexus-hr-$(date +\%Y\%m\%d).sql.gz
```

### Volume Backup

```bash
# Backup PostgreSQL volume
docker run --rm \
  -v nexus-hr_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres-data-backup.tar.gz /data
```

## Scaling

### Horizontal Scaling

```bash
# Docker Compose - scale backend
docker-compose up -d --scale backend=3

# Kubernetes - scale deployments
kubectl scale deployment backend --replicas=5 -n nexus-hr
kubectl scale deployment frontend --replicas=3 -n nexus-hr
```

### Load Balancing

Use Nginx as a load balancer:

```nginx
upstream backend {
    least_conn;
    server backend1:3001;
    server backend2:3001;
    server backend3:3001;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

## Troubleshooting

### Common Issues

**Database connection failed**:
```bash
# Check database status
docker-compose ps postgres
docker-compose logs postgres

# Verify connection string
docker-compose exec backend env | grep DATABASE_URL
```

**Frontend not loading**:
```bash
# Check build logs
docker-compose logs frontend

# Verify VITE_API_URL
docker-compose exec frontend env | grep VITE
```

**SSL certificate issues**:
```bash
# Renew certificate
sudo certbot renew

# Check certificate expiry
sudo certbot certificates
```

## Security Checklist

- [ ] Change default passwords
- [ ] Use strong JWT secret
- [ ] Enable SSL/HTTPS
- [ ] Configure firewall (UFW/iptables)
- [ ] Set up regular backups
- [ ] Enable security headers
- [ ] Use environment variables (no hardcoded secrets)
- [ ] Regular dependency updates
- [ ] Monitor application logs
- [ ] Implement rate limiting

## Support

For deployment issues:
- Check logs: `docker-compose logs -f`
- Database issues: See [GETTING_STARTED.md](./GETTING_STARTED.md)
- API issues: See [server/README.md](../server/README.md)

---

**Need help?** Open an issue on GitHub or contact support.
