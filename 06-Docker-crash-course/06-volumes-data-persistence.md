# Volumes and Data Persistence

By default, data inside containers is ephemeral - it disappears when the container is removed. Docker volumes provide a way to persist data beyond the container lifecycle.

## Understanding Container Filesystem

### Container Layers
```
┌─────────────────────────────────┐ ← Container Layer (Read/Write)
├─────────────────────────────────┤ ← Application Layer (Read-Only)
├─────────────────────────────────┤ ← Dependencies Layer (Read-Only)  
├─────────────────────────────────┤ ← Runtime Layer (Read-Only)
└─────────────────────────────────┘ ← Base OS Layer (Read-Only)
```

**Key Points:**
- Only the top layer is writable
- Changes are lost when container is removed
- Data in read-only layers is shared between containers

### The Problem with Container Storage
```bash
# Create container and add data
docker run -it --name temp-container ubuntu bash
echo "Important data" > /data.txt
exit

# Remove container
docker rm temp-container

# Data is lost forever!
```

## Types of Mounts

Docker provides three types of mounts for data persistence:

### 1. Volumes (Recommended)
- **Managed by Docker**
- **Stored in Docker area** (`/var/lib/docker/volumes/`)
- **Best performance** on Linux
- **Portable** across environments

### 2. Bind Mounts
- **Direct host path mapping**
- **Full host filesystem access**
- **Host-dependent** paths
- **Good for development**

### 3. tmpfs Mounts (Linux only)
- **Stored in host memory**
- **Temporary data only**
- **Never written to disk**
- **Good for sensitive data**

## Working with Volumes

### Creating and Managing Volumes
```bash
# Create a named volume
docker volume create my-volume

# List all volumes
docker volume ls

# Inspect volume details
docker volume inspect my-volume

# Remove volume
docker volume rm my-volume

# Remove all unused volumes
docker volume prune
```

### Using Volumes with Containers
```bash
# Mount named volume
docker run -d -v my-volume:/data nginx

# Mount anonymous volume (Docker creates name)
docker run -d -v /data nginx

# Mount with read-only access
docker run -d -v my-volume:/data:ro nginx

# Mount multiple volumes
docker run -d \
  -v data-volume:/app/data \
  -v logs-volume:/app/logs \
  nginx
```

### Volume Examples

#### Example 1: Database Data Persistence
```bash
# Create volume for database data
docker volume create postgres-data

# Run PostgreSQL with persistent data
docker run -d \
  --name postgres-db \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=myapp \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:13

# Add some data
docker exec -it postgres-db psql -U postgres -d myapp
CREATE TABLE users (id SERIAL PRIMARY KEY, name VARCHAR(100));
INSERT INTO users (name) VALUES ('John Doe');
\q

# Stop and remove container
docker stop postgres-db
docker rm postgres-db

# Start new container with same volume
docker run -d \
  --name postgres-db-new \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=myapp \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:13

# Data is still there!
docker exec -it postgres-db-new psql -U postgres -d myapp -c "SELECT * FROM users;"
```

#### Example 2: Web Application Logs
```bash
# Create volume for logs
docker volume create app-logs

# Run application with log volume
docker run -d \
  --name web-app \
  -v app-logs:/var/log/app \
  -p 8080:80 \
  nginx

# Generate some logs
curl http://localhost:8080

# View logs from another container
docker run --rm -v app-logs:/logs alpine cat /logs/access.log
```

## Working with Bind Mounts

### Basic Bind Mount Syntax
```bash
# Mount host directory to container
docker run -d -v /host/path:/container/path nginx

# Mount current directory
docker run -d -v $(pwd):/app nginx

# Mount with read-only access
docker run -d -v /host/path:/container/path:ro nginx
```

### Bind Mount Examples

#### Example 1: Development Environment
```bash
# Create a simple web project
mkdir my-website
cd my-website
echo "<h1>Hello Docker!</h1>" > index.html

# Serve with nginx using bind mount
docker run -d \
  --name dev-server \
  -p 8080:80 \
  -v $(pwd):/usr/share/nginx/html:ro \
  nginx

# Test the website
curl http://localhost:8080

# Edit file on host
echo "<h1>Updated Content!</h1>" > index.html

# Changes are immediately reflected
curl http://localhost:8080
```

#### Example 2: Configuration Files
```bash
# Create custom nginx configuration
mkdir nginx-config
cat > nginx-config/nginx.conf << EOF
events {}
http {
    server {
        listen 80;
        location / {
            return 200 "Custom Configuration!";
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Run nginx with custom config
docker run -d \
  --name custom-nginx \
  -p 8080:80 \
  -v $(pwd)/nginx-config/nginx.conf:/etc/nginx/nginx.conf:ro \
  nginx

# Test custom configuration
curl http://localhost:8080
```

## Working with tmpfs Mounts

### Creating tmpfs Mounts
```bash
# Mount tmpfs for temporary data
docker run -d \
  --name temp-app \
  --tmpfs /tmp:rw,noexec,nosuid,size=100m \
  nginx

# Verify tmpfs mount
docker exec temp-app df -h /tmp
```

### tmpfs Use Cases
```bash
# Store sensitive data in memory
docker run -d \
  --name secure-app \
  --tmpfs /secure:rw,noexec,nosuid,size=50m \
  my-secure-app

# Temporary processing space
docker run -d \
  --name processor \
  --tmpfs /processing:rw,size=1g \
  data-processor
```

## Volume Drivers and Plugins

### Local Driver (Default)
```bash
# Create volume with local driver
docker volume create --driver local my-local-volume

# Specify mount options
docker volume create \
  --driver local \
  --opt type=nfs \
  --opt o=addr=192.168.1.100,rw \
  --opt device=:/path/to/dir \
  nfs-volume
```

### Third-Party Drivers
```bash
# Examples of volume drivers (require installation)
# - AWS EBS
# - Azure File Storage
# - Google Cloud Persistent Disk
# - Network File System (NFS)
# - GlusterFS
```

## Data Backup and Restore

### Backing Up Volume Data
```bash
# Method 1: Using tar
docker run --rm \
  -v my-volume:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/backup.tar.gz -C /data .

# Method 2: Using cp command
docker run --rm \
  -v my-volume:/data \
  -v $(pwd):/backup \
  alpine cp -r /data/. /backup/
```

### Restoring Volume Data
```bash
# Create new volume
docker volume create restored-volume

# Restore from backup
docker run --rm \
  -v restored-volume:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/backup.tar.gz -C /data
```

### Complete Backup Example
```bash
# Create test data
docker volume create test-data
docker run --rm -v test-data:/data alpine sh -c "echo 'Important data' > /data/file.txt"

# Backup
docker run --rm \
  -v test-data:/data:ro \
  -v $(pwd):/backup \
  alpine tar czf /backup/test-data-backup.tar.gz -C /data .

# Simulate data loss
docker volume rm test-data

# Restore
docker volume create test-data-restored
docker run --rm \
  -v test-data-restored:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/test-data-backup.tar.gz -C /data

# Verify restoration
docker run --rm -v test-data-restored:/data alpine cat /data/file.txt
```

## Volume Performance Considerations

### Performance Comparison
| Mount Type | Performance | Use Case |
|------------|-------------|----------|
| **Volume** | Best | Production data |
| **Bind Mount** | Good | Development |
| **tmpfs** | Fastest | Temporary data |

### Optimization Tips
```bash
# Use volumes for better performance
docker run -v my-volume:/data app

# Avoid bind mounts for large datasets in production
# Use read-only mounts when possible
docker run -v config:/etc/app:ro app

# Use tmpfs for temporary high-I/O operations
docker run --tmpfs /tmp:size=1g app
```

## Best Practices

### Volume Management
- **Use named volumes** for important data
- **Regular backups** of critical volumes
- **Monitor volume usage** and clean up unused volumes
- **Document volume purposes** and dependencies

### Security Considerations
```bash
# Use read-only mounts when possible
docker run -v config:/etc/app:ro app

# Avoid mounting sensitive host directories
# Don't mount /var/run/docker.sock unless necessary

# Use specific user permissions
docker run --user 1000:1000 -v data:/app/data app
```

### Development vs Production
```bash
# Development: Use bind mounts for live editing
docker run -v $(pwd):/app:ro dev-app

# Production: Use volumes for data persistence
docker run -v app-data:/app/data prod-app
```

### Volume Naming Conventions
```bash
# Include purpose and environment
docker volume create myapp-database-prod
docker volume create myapp-logs-staging
docker volume create myapp-uploads-dev
```

## Troubleshooting Volume Issues

### Common Problems
```bash
# Permission denied errors
docker run --user $(id -u):$(id -g) -v $(pwd):/app app

# Volume not mounting
docker volume inspect volume-name
docker run --rm -v volume-name:/test alpine ls -la /test

# Data not persisting
docker inspect container-name | grep -A 10 Mounts
```

### Debugging Volume Mounts
```bash
# Check if volume is mounted correctly
docker exec container-name mount | grep volume-name

# Verify volume contents
docker run --rm -v my-volume:/data alpine ls -la /data

# Check volume driver and options
docker volume inspect my-volume
```

Understanding volumes and data persistence is crucial for building robust containerized applications. The next topic covers container networking and communication.
