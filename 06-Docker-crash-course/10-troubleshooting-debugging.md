# Troubleshooting and Debugging

Docker troubleshooting involves systematic approaches to identify and resolve issues with containers, images, networks, and volumes. This guide covers common problems and debugging techniques.

## Systematic Debugging Approach

### 1. Identify the Problem
- **What is not working?** - Specific symptoms
- **When did it start?** - Recent changes
- **Where is it failing?** - Which component
- **How is it failing?** - Error messages

### 2. Gather Information
```bash
# System information
docker version
docker info
docker system df

# Container status
docker ps -a
docker logs container-name
docker inspect container-name

# Resource usage
docker stats
df -h
free -h
```

### 3. Isolate the Issue
- Test components individually
- Use minimal reproduction cases
- Compare working vs non-working environments

## Common Container Issues

### Container Won't Start

#### Issue: Container Exits Immediately
```bash
# Check exit code and status
docker ps -a

# Example output:
# CONTAINER ID   STATUS                     
# 1a2b3c4d5e6f   Exited (125) 2 minutes ago
```

**Debugging Steps:**
```bash
# Check container logs
docker logs container-name

# Inspect container configuration
docker inspect container-name

# Try running interactively
docker run -it --entrypoint=/bin/bash image-name

# Override entrypoint to debug
docker run -it --entrypoint="" image-name /bin/sh
```

**Common Causes:**
- Missing or incorrect entrypoint/command
- Permission issues
- Missing dependencies
- Configuration errors

#### Issue: Port Already in Use
```bash
# Error: bind: address already in use
docker run -p 8080:80 nginx
```

**Debugging Steps:**
```bash
# Find process using the port
netstat -tulpn | grep :8080
lsof -i :8080

# Kill the process or use different port
docker run -p 8081:80 nginx

# Check Docker port mappings
docker port container-name
```

#### Issue: Permission Denied
```bash
# Error: permission denied
docker run -v /host/path:/container/path my-app
```

**Debugging Steps:**
```bash
# Check file permissions
ls -la /host/path

# Fix permissions
sudo chown -R $(id -u):$(id -g) /host/path

# Run with specific user
docker run --user $(id -u):$(id -g) -v /host/path:/container/path my-app

# Check SELinux context (if applicable)
ls -Z /host/path
```

### Container Performance Issues

#### High Memory Usage
```bash
# Monitor memory usage
docker stats --no-stream

# Check container memory limit
docker inspect container-name | grep -i memory

# Check processes inside container
docker exec container-name ps aux --sort=-%mem

# Check for memory leaks
docker exec container-name cat /proc/meminfo
```

**Solutions:**
```bash
# Set memory limits
docker run -m 512m my-app

# Update existing container
docker update --memory=1g container-name

# Use memory-efficient base images
FROM alpine:latest  # instead of ubuntu
```

#### High CPU Usage
```bash
# Monitor CPU usage
docker stats container-name

# Check processes
docker exec container-name top

# Limit CPU usage
docker run --cpus="1.5" my-app

# Check CPU throttling
docker exec container-name cat /sys/fs/cgroup/cpu/cpu.stat
```

## Image-Related Issues

### Build Failures

#### Issue: Dockerfile Build Fails
```bash
# Build with verbose output
docker build --no-cache --progress=plain -t my-app .

# Build specific stage
docker build --target=builder -t my-app-builder .

# Check build context size
du -sh .
```

**Common Solutions:**
```dockerfile
# Use .dockerignore to reduce context
# .dockerignore
node_modules
.git
*.log
.env

# Fix layer caching issues
# Bad: Changes invalidate cache
COPY . .
RUN npm install

# Good: Copy package.json first
COPY package*.json ./
RUN npm install
COPY . .
```

#### Issue: Image Too Large
```bash
# Check image size
docker images my-app

# Analyze image layers
docker history my-app

# Use dive tool for detailed analysis
dive my-app
```

**Optimization Strategies:**
```dockerfile
# Use multi-stage builds
FROM node:16 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:16-alpine AS production
COPY --from=builder /app/node_modules ./node_modules
COPY . .
CMD ["node", "server.js"]

# Clean up in same layer
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Use minimal base images
FROM alpine:latest  # ~5MB
FROM scratch        # 0MB (for static binaries)
```

### Registry Issues

#### Issue: Cannot Pull/Push Images
```bash
# Check registry connectivity
docker pull hello-world

# Login to registry
docker login registry.example.com

# Check image name format
docker tag my-app registry.example.com/my-app:latest
docker push registry.example.com/my-app:latest
```

**Common Solutions:**
```bash
# Configure insecure registry (development only)
# /etc/docker/daemon.json
{
  "insecure-registries": ["registry.example.com:5000"]
}

# Restart Docker daemon
sudo systemctl restart docker

# Use correct authentication
docker login -u username -p password registry.example.com
```

## Network Troubleshooting

### Container Connectivity Issues

#### Issue: Containers Can't Communicate
```bash
# Check if containers are on same network
docker inspect container1 | grep NetworkMode
docker inspect container2 | grep NetworkMode

# Test connectivity
docker exec container1 ping container2

# Check DNS resolution
docker exec container1 nslookup container2
```

**Debugging Steps:**
```bash
# Create custom network
docker network create test-network

# Connect containers to network
docker network connect test-network container1
docker network connect test-network container2

# Test communication by name
docker exec container1 ping container2

# Check network configuration
docker network inspect test-network
```

#### Issue: Cannot Access External Services
```bash
# Test external connectivity
docker exec container-name ping google.com

# Check DNS configuration
docker exec container-name cat /etc/resolv.conf

# Test specific service
docker exec container-name curl -v http://api.example.com
```

**Common Solutions:**
```bash
# Configure custom DNS
docker run --dns=8.8.8.8 my-app

# Use host network for testing
docker run --network=host my-app

# Check firewall rules
sudo iptables -L DOCKER-USER
```

### Port Mapping Issues

#### Issue: Service Not Accessible from Host
```bash
# Check port mapping
docker port container-name

# Verify service is listening
docker exec container-name netstat -tulpn

# Test from inside container
docker exec container-name curl localhost:3000

# Test from host
curl localhost:8080
```

**Debugging Steps:**
```bash
# Check if port is bound to correct interface
netstat -tulpn | grep :8080

# Test with telnet
telnet localhost 8080

# Check firewall rules
sudo ufw status
sudo iptables -L
```

## Volume and Storage Issues

### Data Persistence Problems

#### Issue: Data Not Persisting
```bash
# Check volume mounts
docker inspect container-name | grep -A 10 Mounts

# Verify volume exists
docker volume ls
docker volume inspect volume-name

# Check volume contents
docker run --rm -v volume-name:/data alpine ls -la /data
```

**Common Solutions:**
```bash
# Use named volumes instead of anonymous
docker run -v my-data:/app/data my-app  # Good
docker run -v /app/data my-app          # Bad (anonymous)

# Verify mount paths
docker run -v $(pwd)/data:/app/data my-app

# Check permissions
docker run --user $(id -u):$(id -g) -v $(pwd)/data:/app/data my-app
```

#### Issue: Volume Mount Fails
```bash
# Check if path exists
ls -la /host/path

# Check permissions
ls -ld /host/path

# Check SELinux context (RHEL/CentOS)
ls -Z /host/path
```

**Solutions:**
```bash
# Create directory if missing
mkdir -p /host/path

# Fix permissions
sudo chown -R $(id -u):$(id -g) /host/path

# Fix SELinux context
sudo chcon -Rt svirt_sandbox_file_t /host/path
```

## Docker Daemon Issues

### Docker Service Problems

#### Issue: Docker Daemon Not Running
```bash
# Check Docker service status
sudo systemctl status docker

# Start Docker service
sudo systemctl start docker

# Enable auto-start
sudo systemctl enable docker

# Check Docker daemon logs
sudo journalctl -u docker.service -f
```

#### Issue: Docker Daemon Configuration
```bash
# Check daemon configuration
docker info

# Edit daemon configuration
sudo nano /etc/docker/daemon.json

# Example configuration
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}

# Restart daemon after changes
sudo systemctl restart docker
```

### Resource Exhaustion

#### Issue: Disk Space Full
```bash
# Check Docker disk usage
docker system df

# Clean up unused resources
docker system prune

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove unused networks
docker network prune
```

#### Issue: Too Many Containers
```bash
# List all containers
docker ps -a

# Remove stopped containers
docker container prune

# Remove containers by filter
docker rm $(docker ps -aq --filter "status=exited")

# Set up automatic cleanup
docker run --rm my-app  # Auto-remove when stopped
```

## Advanced Debugging Techniques

### Using Debug Tools

#### Debugging with nsenter
```bash
# Get container PID
docker inspect container-name | grep Pid

# Enter container namespace
sudo nsenter -t <PID> -n -p

# Debug network issues
ip addr show
ss -tulpn
```

#### Using strace for System Calls
```bash
# Trace system calls
docker exec container-name strace -p 1

# Trace file operations
docker exec container-name strace -e trace=file -p 1
```

#### Memory and CPU Profiling
```bash
# Generate core dump
docker exec container-name gcore <PID>

# Analyze with gdb
docker exec -it container-name gdb /app/binary core.<PID>

# Profile CPU usage
docker exec container-name perf top -p <PID>
```

### Log Analysis

#### Structured Logging
```bash
# Configure JSON logging
docker run --log-driver=json-file my-app

# Parse logs with jq
docker logs container-name | jq '.message'

# Filter logs by level
docker logs container-name | jq 'select(.level=="error")'
```

#### Centralized Logging
```bash
# Send logs to syslog
docker run --log-driver=syslog --log-opt syslog-address=tcp://logserver:514 my-app

# Use Fluentd for log aggregation
docker run --log-driver=fluentd --log-opt fluentd-address=localhost:24224 my-app
```

## Prevention Strategies

### Monitoring and Alerting
```bash
# Set up health checks
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Monitor resource usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Set up alerts for high resource usage
```

### Best Practices
- **Use specific image tags** instead of `latest`
- **Implement proper health checks**
- **Set resource limits** for all containers
- **Use multi-stage builds** for smaller images
- **Regular security scanning** of images
- **Implement proper logging** strategies
- **Monitor and alert** on key metrics

### Documentation
- **Document container dependencies**
- **Maintain troubleshooting runbooks**
- **Keep deployment procedures updated**
- **Document known issues and solutions**

Effective troubleshooting requires systematic approaches, proper tooling, and good operational practices. Regular monitoring and preventive measures help avoid many common issues.
