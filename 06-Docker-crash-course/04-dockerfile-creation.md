# Dockerfile Creation

A Dockerfile is a text file containing instructions to build a Docker image. It automates the image creation process and makes it reproducible.

## What is a Dockerfile?

A Dockerfile contains a series of instructions that Docker uses to build an image:
- **Declarative**: Describes the desired state
- **Layered**: Each instruction creates a new layer
- **Cached**: Unchanged layers are reused for faster builds
- **Portable**: Same Dockerfile works across environments

## Basic Dockerfile Structure

```dockerfile
# Comment
INSTRUCTION arguments
```

### Simple Example
```dockerfile
# Use official Node.js runtime as base image
FROM node:16-alpine

# Set working directory inside container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Expose port 3000
EXPOSE 3000

# Define command to run application
CMD ["npm", "start"]
```

## Essential Dockerfile Instructions

### FROM - Base Image
```dockerfile
# Use official image
FROM node:16

# Use specific version
FROM node:16.14.2

# Use minimal image
FROM node:16-alpine

# Use scratch (empty image)
FROM scratch
```

### WORKDIR - Working Directory
```dockerfile
# Set working directory
WORKDIR /app

# All subsequent commands run from /app
# Equivalent to: cd /app
```

### COPY - Copy Files
```dockerfile
# Copy single file
COPY app.js /app/

# Copy multiple files
COPY app.js package.json /app/

# Copy directory
COPY src/ /app/src/

# Copy with wildcard
COPY *.json /app/

# Copy everything (use .dockerignore to exclude files)
COPY . /app/
```

### ADD - Advanced Copy
```dockerfile
# Similar to COPY but with additional features
ADD app.js /app/

# Extract tar files automatically
ADD archive.tar.gz /app/

# Download from URL (not recommended)
ADD https://example.com/file.txt /app/
```

**Best Practice**: Use `COPY` instead of `ADD` unless you need the extra features.

### RUN - Execute Commands
```dockerfile
# Install packages
RUN apt-get update && apt-get install -y curl

# Multiple commands
RUN npm install && \
    npm run build && \
    npm prune --production

# Create directories
RUN mkdir -p /app/logs

# Change permissions
RUN chmod +x /app/start.sh
```

### CMD - Default Command
```dockerfile
# Exec form (preferred)
CMD ["npm", "start"]

# Shell form
CMD npm start

# With parameters
CMD ["node", "server.js", "--port", "3000"]
```

### ENTRYPOINT - Entry Point
```dockerfile
# Always executed, cannot be overridden
ENTRYPOINT ["node", "server.js"]

# Combined with CMD for default parameters
ENTRYPOINT ["node", "server.js"]
CMD ["--port", "3000"]
```

### EXPOSE - Document Ports
```dockerfile
# Document that container listens on port 3000
EXPOSE 3000

# Multiple ports
EXPOSE 3000 8080

# UDP port
EXPOSE 53/udp
```

### ENV - Environment Variables
```dockerfile
# Set environment variable
ENV NODE_ENV=production

# Multiple variables
ENV NODE_ENV=production \
    PORT=3000 \
    DEBUG=false
```

### ARG - Build Arguments
```dockerfile
# Define build argument
ARG NODE_VERSION=16

# Use in FROM instruction
FROM node:${NODE_VERSION}

# Set default value
ARG BUILD_DATE=unknown
```

### VOLUME - Mount Points
```dockerfile
# Create mount point
VOLUME ["/data"]

# Multiple volumes
VOLUME ["/data", "/logs"]
```

### USER - Set User
```dockerfile
# Create user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Switch to user
USER nextjs
```

## Building Images

### Basic Build
```bash
# Build image from Dockerfile in current directory
docker build -t my-app .

# Build with specific Dockerfile
docker build -f Dockerfile.prod -t my-app .

# Build with build arguments
docker build --build-arg NODE_VERSION=18 -t my-app .
```

### Build Context
```bash
# Current directory is build context
docker build -t my-app .

# Specific directory as context
docker build -t my-app /path/to/context

# URL as context
docker build -t my-app https://github.com/user/repo.git
```

## Practical Examples

### Example 1: Node.js Application
```dockerfile
# Dockerfile for Node.js app
FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start application
CMD ["node", "server.js"]
```

### Example 2: Python Flask Application
```dockerfile
# Dockerfile for Python Flask app
FROM python:3.9-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set work directory
WORKDIR /code

# Install system dependencies
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /code/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /code/

# Create user
RUN adduser --disabled-password --gecos '' appuser
USER appuser

# Run application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "app:app"]
```

### Example 3: Multi-stage Build
```dockerfile
# Build stage
FROM node:16-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Best Practices

### Optimize for Caching
```dockerfile
# Bad: Changes to source code invalidate npm install cache
COPY . .
RUN npm install

# Good: Copy package.json first, then source code
COPY package*.json ./
RUN npm install
COPY . .
```

### Minimize Layers
```dockerfile
# Bad: Multiple RUN instructions create multiple layers
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y git

# Good: Combine related commands
RUN apt-get update && \
    apt-get install -y curl git && \
    rm -rf /var/lib/apt/lists/*
```

### Use .dockerignore
```dockerignore
# .dockerignore file
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.nyc_output
coverage
.nyc_output
```

### Security Best Practices
```dockerfile
# Use specific versions
FROM node:16.14.2-alpine

# Don't run as root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

# Use COPY instead of ADD
COPY package*.json ./

# Clean up package manager cache
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*
```

## Advanced Dockerfile Techniques

### Build Arguments
```dockerfile
ARG NODE_VERSION=16
FROM node:${NODE_VERSION}-alpine

ARG BUILD_DATE
ARG VERSION
LABEL build_date=${BUILD_DATE}
LABEL version=${VERSION}

# Use in build
docker build \
  --build-arg NODE_VERSION=18 \
  --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
  --build-arg VERSION=1.0.0 \
  -t my-app .
```

### Health Checks
```dockerfile
# Simple health check
HEALTHCHECK CMD curl -f http://localhost:3000/ || exit 1

# Advanced health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1
```

### Labels
```dockerfile
# Add metadata
LABEL maintainer="developer@example.com"
LABEL version="1.0"
LABEL description="My awesome application"
```

## Common Patterns

### Development vs Production
```dockerfile
# Dockerfile.dev
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

```dockerfile
# Dockerfile.prod
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:16-alpine AS production
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3000
CMD ["npm", "start"]
```

Understanding Dockerfile creation is essential for building custom images. The next topic covers managing running containers effectively.
