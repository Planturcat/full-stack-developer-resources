# Production Deployment

Deploying Docker containers in production requires careful consideration of security, performance, monitoring, and operational practices. This guide covers essential strategies for production-ready deployments.

## Production vs Development

### Key Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| **Image Source** | Local builds | Registry images |
| **Data Persistence** | Temporary | Persistent volumes |
| **Security** | Relaxed | Hardened |
| **Monitoring** | Basic | Comprehensive |
| **Scaling** | Single instance | Multiple instances |
| **Updates** | Manual | Automated/Controlled |

### Production Checklist
- ✅ Use specific image tags (not `latest`)
- ✅ Implement health checks
- ✅ Configure resource limits
- ✅ Set up monitoring and logging
- ✅ Use secrets management
- ✅ Implement backup strategies
- ✅ Configure restart policies
- ✅ Security hardening

## Image Management for Production

### Image Tagging Strategy
```bash
# Bad: Using latest tag
docker build -t my-app:latest .

# Good: Semantic versioning
docker build -t my-app:1.2.3 .
docker build -t my-app:1.2 .
docker build -t my-app:1 .

# Good: Git-based tagging
docker build -t my-app:$(git rev-parse --short HEAD) .
docker build -t my-app:v1.2.3-$(git rev-parse --short HEAD) .
```

### Multi-stage Production Builds
```dockerfile
# Multi-stage Dockerfile for Node.js
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:16-alpine AS production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

USER nextjs
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "server.js"]
```

### Image Security Scanning
```bash
# Scan images for vulnerabilities
docker scan my-app:1.2.3

# Use tools like Trivy
trivy image my-app:1.2.3

# Integrate scanning in CI/CD
docker build -t my-app:${VERSION} .
docker scan my-app:${VERSION}
if [ $? -eq 0 ]; then
  docker push my-app:${VERSION}
fi
```

## Container Security

### Running as Non-Root User
```dockerfile
# Create non-root user
FROM alpine:latest
RUN addgroup -g 1001 -S appgroup
RUN adduser -S appuser -u 1001 -G appgroup

# Switch to non-root user
USER appuser
WORKDIR /app
COPY --chown=appuser:appgroup . .
CMD ["./app"]
```

### Security Best Practices
```bash
# Run with read-only filesystem
docker run --read-only -v /tmp --tmpfs /tmp my-app

# Drop capabilities
docker run --cap-drop=ALL --cap-add=NET_BIND_SERVICE my-app

# Use security profiles
docker run --security-opt=no-new-privileges my-app

# Limit resources
docker run --memory=512m --cpus="1.0" my-app
```

### Secrets Management
```yaml
# docker-compose.yml with secrets
version: '3.8'
services:
  app:
    image: my-app:1.2.3
    secrets:
      - db_password
      - api_key
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password
      - API_KEY_FILE=/run/secrets/api_key

secrets:
  db_password:
    external: true
  api_key:
    external: true
```

```bash
# Create secrets
echo "mypassword" | docker secret create db_password -
echo "myapikey" | docker secret create api_key -
```

## Resource Management

### Setting Resource Limits
```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    image: my-web-app:1.2.3
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: '1.0'
        reservations:
          memory: 512M
          cpus: '0.5'
      restart_policy:
        condition: unless-stopped
        delay: 5s
        max_attempts: 3
```

### Memory and CPU Optimization
```bash
# Monitor resource usage
docker stats --no-stream

# Set memory limits
docker run -m 512m my-app

# Set CPU limits
docker run --cpus="1.5" my-app

# Set swap limits
docker run -m 512m --memory-swap=1g my-app
```

## Health Checks and Monitoring

### Container Health Checks
```dockerfile
# Health check in Dockerfile
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

```yaml
# Health check in Compose
services:
  web:
    image: my-app:1.2.3
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Application Health Endpoint
```javascript
// Express.js health endpoint
app.get('/health', (req, res) => {
  // Check database connection
  // Check external services
  // Check application state
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.APP_VERSION
  };
  
  res.status(200).json(health);
});
```

### Monitoring Setup
```yaml
# Monitoring stack with Prometheus and Grafana
version: '3.8'
services:
  app:
    image: my-app:1.2.3
    ports:
      - "3000:3000"
    
  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      
  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  grafana-data:
```

## Logging

### Centralized Logging
```yaml
# ELK Stack for logging
version: '3.8'
services:
  app:
    image: my-app:1.2.3
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
        
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.14.0
    environment:
      - discovery.type=single-node
    volumes:
      - elasticsearch-data:/usr/share/elasticsearch/data
      
  logstash:
    image: docker.elastic.co/logstash/logstash:7.14.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
      
  kibana:
    image: docker.elastic.co/kibana/kibana:7.14.0
    ports:
      - "5601:5601"

volumes:
  elasticsearch-data:
```

### Log Management
```bash
# Configure log rotation
docker run --log-driver=json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  my-app

# Use syslog driver
docker run --log-driver=syslog \
  --log-opt syslog-address=tcp://logserver:514 \
  my-app

# View logs
docker logs --tail 100 -f container-name
```

## High Availability and Scaling

### Load Balancing with Nginx
```nginx
# nginx.conf
upstream app_servers {
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    listen 80;
    
    location / {
        proxy_pass http://app_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location /health {
        access_log off;
        return 200 "healthy\n";
    }
}
```

### Docker Swarm for Orchestration
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml myapp

# Scale services
docker service scale myapp_web=3

# Update service
docker service update --image my-app:1.2.4 myapp_web
```

### Auto-scaling Configuration
```yaml
# docker-compose.yml for swarm
version: '3.8'
services:
  web:
    image: my-app:1.2.3
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
```

## Backup and Disaster Recovery

### Database Backup Strategy
```bash
# Automated PostgreSQL backup
docker run --rm \
  -v postgres-data:/var/lib/postgresql/data \
  -v $(pwd)/backups:/backups \
  postgres:13 \
  pg_dump -h db -U postgres myapp > /backups/backup-$(date +%Y%m%d-%H%M%S).sql
```

### Volume Backup
```bash
# Backup named volume
docker run --rm \
  -v my-volume:/data \
  -v $(pwd)/backups:/backup \
  alpine tar czf /backup/volume-backup-$(date +%Y%m%d).tar.gz -C /data .

# Restore volume
docker run --rm \
  -v my-volume:/data \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/volume-backup-20231201.tar.gz -C /data
```

## CI/CD Integration

### GitLab CI Example
```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

variables:
  DOCKER_REGISTRY: registry.gitlab.com
  IMAGE_NAME: $DOCKER_REGISTRY/$CI_PROJECT_PATH

build:
  stage: build
  script:
    - docker build -t $IMAGE_NAME:$CI_COMMIT_SHA .
    - docker push $IMAGE_NAME:$CI_COMMIT_SHA

test:
  stage: test
  script:
    - docker run --rm $IMAGE_NAME:$CI_COMMIT_SHA npm test

deploy:
  stage: deploy
  script:
    - docker pull $IMAGE_NAME:$CI_COMMIT_SHA
    - docker tag $IMAGE_NAME:$CI_COMMIT_SHA $IMAGE_NAME:latest
    - docker-compose up -d
  only:
    - main
```

### GitHub Actions Example
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build and push Docker image
        run: |
          docker build -t my-app:${{ github.sha }} .
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push my-app:${{ github.sha }}
          
      - name: Deploy to production
        run: |
          ssh production-server "
            docker pull my-app:${{ github.sha }} &&
            docker tag my-app:${{ github.sha }} my-app:latest &&
            docker-compose up -d
          "
```

## Performance Optimization

### Image Optimization
```dockerfile
# Optimized production Dockerfile
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:16-alpine AS production
RUN apk add --no-cache dumb-init
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --chown=nextjs:nodejs . .

USER nextjs
EXPOSE 3000
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

### Runtime Optimization
```bash
# Use init system for proper signal handling
docker run --init my-app

# Optimize for production
docker run \
  --memory=512m \
  --cpus="1.0" \
  --restart=unless-stopped \
  --read-only \
  --tmpfs /tmp \
  my-app
```

Production deployment requires careful planning and implementation of security, monitoring, and operational best practices. The final topic covers troubleshooting and debugging techniques.
