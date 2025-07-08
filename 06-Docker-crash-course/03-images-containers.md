# Images and Containers

Understanding the relationship between Docker images and containers is fundamental to working with Docker effectively.

## Docker Images

### What is a Docker Image?

A Docker image is a **read-only template** that contains:
- Application code
- Runtime environment
- System libraries
- Dependencies
- Configuration files
- Environment variables

**Analogy**: Think of an image as a **class** in programming - it's a blueprint that defines what a container should look like.

### Image Characteristics

- **Immutable**: Once created, images don't change
- **Layered**: Built in layers for efficiency
- **Portable**: Can run on any Docker-enabled machine
- **Versioned**: Tagged with versions for management

### Image Layers

Images are built in layers, where each layer represents a change:

```
┌─────────────────────────────────┐ ← Application Layer
├─────────────────────────────────┤ ← Dependencies Layer  
├─────────────────────────────────┤ ← Runtime Layer
├─────────────────────────────────┤ ← OS Libraries Layer
└─────────────────────────────────┘ ← Base OS Layer
```

**Benefits of Layers:**
- **Caching**: Unchanged layers are reused
- **Efficiency**: Only changed layers are downloaded
- **Storage**: Shared layers save disk space

## Docker Containers

### What is a Docker Container?

A Docker container is a **running instance** of an image:
- Writable layer on top of image
- Isolated process with its own filesystem
- Can be started, stopped, moved, and deleted

**Analogy**: Think of a container as an **object** created from a class - it's a running instance with its own state.

### Container Lifecycle

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ Created │───►│ Running │───►│ Stopped │───►│ Deleted │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
     ▲              │              ▲              │
     │              ▼              │              ▼
     └──────── Restarted ──────────┘         Removed
```

## Essential Docker Commands

### Image Commands

#### Listing Images
```bash
# List all local images
docker images

# Alternative command
docker image ls

# Show image sizes
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

#### Pulling Images
```bash
# Pull latest version of an image
docker pull ubuntu

# Pull specific version
docker pull ubuntu:20.04

# Pull from specific registry
docker pull nginx:alpine
```

#### Removing Images
```bash
# Remove a specific image
docker rmi ubuntu:20.04

# Remove image by ID
docker rmi 1a2b3c4d5e6f

# Remove unused images
docker image prune

# Remove all unused images
docker image prune -a
```

#### Inspecting Images
```bash
# Show detailed image information
docker inspect ubuntu:latest

# Show image history (layers)
docker history ubuntu:latest
```

### Container Commands

#### Running Containers
```bash
# Run container from image
docker run ubuntu

# Run container interactively
docker run -it ubuntu bash

# Run container in background (detached)
docker run -d nginx

# Run with custom name
docker run --name my-container nginx

# Run with port mapping
docker run -p 8080:80 nginx
```

#### Listing Containers
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Show only container IDs
docker ps -q

# Custom format
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

#### Managing Container Lifecycle
```bash
# Stop a running container
docker stop container-name

# Start a stopped container
docker start container-name

# Restart a container
docker restart container-name

# Pause a container
docker pause container-name

# Unpause a container
docker unpause container-name
```

#### Removing Containers
```bash
# Remove a stopped container
docker rm container-name

# Force remove a running container
docker rm -f container-name

# Remove all stopped containers
docker container prune
```

## Working with Containers

### Interactive Mode
```bash
# Run Ubuntu container with interactive terminal
docker run -it ubuntu bash

# Inside the container:
ls /
cat /etc/os-release
apt update
apt install curl
curl --version
exit
```

### Detached Mode
```bash
# Run nginx in background
docker run -d --name web-server -p 8080:80 nginx

# Check if it's running
docker ps

# View logs
docker logs web-server

# Stop the container
docker stop web-server
```

### Executing Commands in Running Containers
```bash
# Start a container
docker run -d --name my-ubuntu ubuntu sleep 3600

# Execute command in running container
docker exec my-ubuntu ls /

# Get interactive shell in running container
docker exec -it my-ubuntu bash

# Exit doesn't stop the container
exit

# Container is still running
docker ps
```

## Practical Examples

### Example 1: Exploring Different Linux Distributions
```bash
# Try different Linux distributions
docker run -it ubuntu bash
docker run -it alpine sh
docker run -it centos bash

# Compare sizes
docker images
```

### Example 2: Running a Web Server
```bash
# Run Apache web server
docker run -d --name apache-server -p 8080:80 httpd

# Test the server
curl http://localhost:8080

# View server logs
docker logs apache-server

# Stop and remove
docker stop apache-server
docker rm apache-server
```

### Example 3: Database Container
```bash
# Run MySQL database
docker run -d \
  --name mysql-db \
  -e MYSQL_ROOT_PASSWORD=mypassword \
  -e MYSQL_DATABASE=testdb \
  -p 3306:3306 \
  mysql:8.0

# Check if it's running
docker ps

# Connect to database (if mysql client installed)
mysql -h 127.0.0.1 -P 3306 -u root -p

# Clean up
docker stop mysql-db
docker rm mysql-db
```

## Image Tags and Versions

### Understanding Tags
```bash
# These are equivalent (latest is default)
docker pull nginx
docker pull nginx:latest

# Pull specific version
docker pull nginx:1.21-alpine

# Pull multiple versions
docker pull nginx:1.20
docker pull nginx:1.21
docker pull nginx:alpine
```

### Listing Tags
```bash
# See all nginx images
docker images nginx

# Output shows different tags:
# nginx        latest    1a2b3c4d5e6f
# nginx        1.21      2b3c4d5e6f7g  
# nginx        alpine    3c4d5e6f7g8h
```

## Container Resource Management

### Monitoring Resources
```bash
# View real-time resource usage
docker stats

# View specific container stats
docker stats container-name

# One-time stats (no streaming)
docker stats --no-stream
```

### Setting Resource Limits
```bash
# Limit memory usage
docker run -m 512m nginx

# Limit CPU usage
docker run --cpus="1.5" nginx

# Limit both memory and CPU
docker run -m 1g --cpus="2" nginx
```

## Best Practices

### Image Management
- **Use specific tags** instead of `latest` in production
- **Regularly update** base images for security patches
- **Clean up unused images** to save disk space
- **Use official images** when possible

### Container Management
- **Use meaningful names** for containers
- **Don't store data** in containers (use volumes)
- **One process per container** for better isolation
- **Clean up stopped containers** regularly

### Security Considerations
- **Don't run as root** inside containers when possible
- **Use minimal base images** (like Alpine Linux)
- **Scan images** for vulnerabilities
- **Keep images updated** with latest security patches

## Common Patterns

### Development Environment
```bash
# Quick development environment
docker run -it --rm -v $(pwd):/workspace ubuntu bash
cd /workspace
# Your local files are available here
```

### Temporary Containers
```bash
# Container that removes itself when stopped
docker run --rm -it ubuntu bash

# When you exit, container is automatically removed
```

### Background Services
```bash
# Long-running services
docker run -d --restart unless-stopped nginx
```

Understanding images and containers is crucial for Docker mastery. The next topic covers creating your own images using Dockerfiles.
