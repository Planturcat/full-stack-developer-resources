# Container Management

Effective container management involves understanding how to run, monitor, debug, and maintain containers throughout their lifecycle.

## Container Lifecycle Management

### Starting Containers

#### Basic Container Execution
```bash
# Run container and exit immediately
docker run ubuntu echo "Hello World"

# Run container interactively
docker run -it ubuntu bash

# Run container in background (detached)
docker run -d nginx

# Run with custom name
docker run -d --name web-server nginx

# Run with automatic restart
docker run -d --restart unless-stopped nginx
```

#### Advanced Run Options
```bash
# Run with port mapping
docker run -d -p 8080:80 nginx

# Run with environment variables
docker run -d -e NODE_ENV=production -e PORT=3000 node-app

# Run with volume mount
docker run -d -v /host/data:/container/data nginx

# Run with resource limits
docker run -d --memory=512m --cpus="1.5" nginx

# Run with custom network
docker run -d --network my-network nginx
```

### Container States

```
┌─────────┐  docker run   ┌─────────┐  docker stop  ┌─────────┐
│ Created │──────────────►│ Running │──────────────►│ Stopped │
└─────────┘               └─────────┘               └─────────┘
     │                         │                         │
     │ docker start            │ docker pause            │ docker start
     │         ┌───────────────┘                         │
     │         ▼                                         │
     │    ┌─────────┐  docker unpause                    │
     └───►│ Paused  │◄───────────────────────────────────┘
          └─────────┘
```

### Stopping and Starting Containers
```bash
# Stop running container gracefully (SIGTERM)
docker stop container-name

# Stop with timeout (default 10 seconds)
docker stop -t 30 container-name

# Force stop container (SIGKILL)
docker kill container-name

# Start stopped container
docker start container-name

# Restart container
docker restart container-name

# Pause container (freeze processes)
docker pause container-name

# Unpause container
docker unpause container-name
```

## Container Interaction

### Executing Commands in Running Containers
```bash
# Execute single command
docker exec container-name ls /app

# Get interactive shell
docker exec -it container-name bash

# Execute as specific user
docker exec -u root -it container-name bash

# Execute with environment variables
docker exec -e DEBUG=true container-name node debug.js

# Execute in specific working directory
docker exec -w /app container-name npm test
```

### Copying Files Between Host and Container
```bash
# Copy file from host to container
docker cp /host/file.txt container-name:/container/path/

# Copy file from container to host
docker cp container-name:/container/file.txt /host/path/

# Copy directory
docker cp /host/directory container-name:/container/path/

# Copy with archive mode (preserve permissions)
docker cp -a /host/directory container-name:/container/path/
```

### Attaching to Running Containers
```bash
# Attach to container's main process
docker attach container-name

# Detach without stopping container: Ctrl+P, Ctrl+Q

# View container output in real-time
docker logs -f container-name
```

## Monitoring and Debugging

### Container Logs
```bash
# View container logs
docker logs container-name

# Follow logs in real-time
docker logs -f container-name

# Show last N lines
docker logs --tail 50 container-name

# Show logs since specific time
docker logs --since "2023-01-01T00:00:00" container-name

# Show logs with timestamps
docker logs -t container-name

# Show logs for specific time range
docker logs --since "1h" --until "30m" container-name
```

### Resource Monitoring
```bash
# View real-time resource usage
docker stats

# Monitor specific containers
docker stats container1 container2

# Show stats once (no streaming)
docker stats --no-stream

# Format output
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

### Container Inspection
```bash
# Show detailed container information
docker inspect container-name

# Get specific information using Go templates
docker inspect --format='{{.State.Status}}' container-name

# Get IP address
docker inspect --format='{{.NetworkSettings.IPAddress}}' container-name

# Get environment variables
docker inspect --format='{{.Config.Env}}' container-name

# Get mounted volumes
docker inspect --format='{{.Mounts}}' container-name
```

### Process Monitoring
```bash
# Show running processes in container
docker top container-name

# Show processes with custom format
docker top container-name aux

# Show process tree
docker exec container-name ps aux
```

## Container Networking

### Port Management
```bash
# Map single port
docker run -d -p 8080:80 nginx

# Map multiple ports
docker run -d -p 8080:80 -p 8443:443 nginx

# Map to specific interface
docker run -d -p 127.0.0.1:8080:80 nginx

# Map random host port
docker run -d -P nginx

# Show port mappings
docker port container-name
```

### Network Inspection
```bash
# List container networks
docker network ls

# Inspect network details
docker network inspect bridge

# Show container network settings
docker inspect container-name | grep -A 20 NetworkSettings
```

## Resource Management

### Setting Resource Limits
```bash
# Memory limit
docker run -d --memory=512m nginx

# CPU limit (1.5 cores)
docker run -d --cpus="1.5" nginx

# CPU shares (relative weight)
docker run -d --cpu-shares=512 nginx

# Disk I/O limit
docker run -d --device-read-bps /dev/sda:1mb nginx

# Combined limits
docker run -d \
  --memory=1g \
  --cpus="2" \
  --memory-swap=2g \
  nginx
```

### Monitoring Resource Usage
```bash
# Real-time stats
docker stats container-name

# Memory usage details
docker exec container-name cat /proc/meminfo

# CPU usage details
docker exec container-name cat /proc/cpuinfo

# Disk usage
docker exec container-name df -h
```

## Container Cleanup

### Removing Containers
```bash
# Remove stopped container
docker rm container-name

# Force remove running container
docker rm -f container-name

# Remove multiple containers
docker rm container1 container2 container3

# Remove all stopped containers
docker container prune

# Remove containers older than 24 hours
docker container prune --filter "until=24h"
```

### Automatic Cleanup
```bash
# Remove container when it exits
docker run --rm -it ubuntu bash

# Remove container after specific time
docker run -d --rm --name temp-container nginx
sleep 60
docker stop temp-container  # Container is automatically removed
```

## Advanced Container Management

### Container Health Checks
```bash
# Run container with health check
docker run -d \
  --name web-app \
  --health-cmd="curl -f http://localhost:3000/health || exit 1" \
  --health-interval=30s \
  --health-timeout=10s \
  --health-retries=3 \
  my-web-app

# Check health status
docker inspect --format='{{.State.Health.Status}}' web-app

# View health check logs
docker inspect --format='{{.State.Health}}' web-app
```

### Container Restart Policies
```bash
# Never restart (default)
docker run -d --restart=no nginx

# Always restart
docker run -d --restart=always nginx

# Restart unless manually stopped
docker run -d --restart=unless-stopped nginx

# Restart on failure (max 3 times)
docker run -d --restart=on-failure:3 nginx
```

### Container Labels
```bash
# Run with labels
docker run -d \
  --label environment=production \
  --label team=backend \
  --label version=1.0 \
  nginx

# Filter containers by label
docker ps --filter "label=environment=production"

# Remove containers by label
docker rm $(docker ps -aq --filter "label=environment=staging")
```

## Troubleshooting Common Issues

### Container Won't Start
```bash
# Check container logs
docker logs container-name

# Inspect container configuration
docker inspect container-name

# Check if port is already in use
netstat -tulpn | grep :8080

# Run with different command to debug
docker run -it --entrypoint=/bin/bash image-name
```

### Container Exits Immediately
```bash
# Check exit code
docker ps -a

# Run interactively to debug
docker run -it image-name

# Override entrypoint
docker run -it --entrypoint="" image-name /bin/bash
```

### Performance Issues
```bash
# Check resource usage
docker stats container-name

# Increase resource limits
docker update --memory=2g --cpus="2" container-name

# Check container processes
docker top container-name
```

### Network Connectivity Issues
```bash
# Test network connectivity
docker exec container-name ping google.com

# Check DNS resolution
docker exec container-name nslookup google.com

# Inspect network configuration
docker inspect container-name | grep -A 20 NetworkSettings
```

## Best Practices

### Container Naming
- Use descriptive names: `web-server`, `database`, `cache`
- Include environment: `web-server-prod`, `database-staging`
- Use consistent naming conventions across team

### Resource Management
- Always set memory limits for production containers
- Monitor resource usage regularly
- Use health checks for critical services
- Implement proper logging strategies

### Security
- Don't run containers as root when possible
- Use read-only filesystems when appropriate
- Limit container capabilities
- Regularly update base images

### Operational Excellence
- Use restart policies for production services
- Implement proper monitoring and alerting
- Maintain container logs
- Document container configurations

Effective container management is crucial for running reliable containerized applications. The next topic covers data persistence using volumes.
