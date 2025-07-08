# Docker Compose

Docker Compose is a tool for defining and running multi-container Docker applications. With Compose, you use a YAML file to configure your application's services, networks, and volumes.

## What is Docker Compose?

Docker Compose solves the complexity of managing multiple containers:

**Without Compose:**
```bash
# Create network
docker network create app-network

# Run database
docker run -d --name postgres-db --network app-network \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=myapp \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:13

# Run Redis cache
docker run -d --name redis-cache --network app-network redis:alpine

# Run web application
docker run -d --name web-app --network app-network \
  -p 8080:3000 \
  -e DATABASE_URL=postgresql://postgres:mypassword@postgres-db:5432/myapp \
  -e REDIS_URL=redis://redis-cache:6379 \
  my-web-app
```

**With Compose:**
```yaml
# docker-compose.yml
version: '3.8'
services:
  web:
    image: my-web-app
    ports:
      - "8080:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:mypassword@db:5432/myapp
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache

  db:
    image: postgres:13
    environment:
      - POSTGRES_PASSWORD=mypassword
      - POSTGRES_DB=myapp
    volumes:
      - postgres-data:/var/lib/postgresql/data

  cache:
    image: redis:alpine

volumes:
  postgres-data:
```

```bash
# Start entire application
docker-compose up -d
```

## Docker Compose File Structure

### Basic Structure
```yaml
version: '3.8'  # Compose file format version

services:       # Define containers
  service1:
    # Service configuration
  service2:
    # Service configuration

networks:       # Define custom networks (optional)
  network1:
    # Network configuration

volumes:        # Define named volumes (optional)
  volume1:
    # Volume configuration
```

### Service Configuration Options

#### Image and Build
```yaml
services:
  # Using existing image
  web:
    image: nginx:alpine
    
  # Building from Dockerfile
  app:
    build: .
    
  # Building with context and Dockerfile
  api:
    build:
      context: ./api
      dockerfile: Dockerfile.prod
      args:
        - NODE_ENV=production
```

#### Ports and Networking
```yaml
services:
  web:
    image: nginx
    ports:
      - "8080:80"           # host:container
      - "8443:443"
      - "127.0.0.1:9090:9090"  # bind to localhost only
    expose:
      - "3000"              # expose to other services only
```

#### Environment Variables
```yaml
services:
  app:
    image: my-app
    environment:
      - NODE_ENV=production
      - DEBUG=false
      - DATABASE_URL=postgresql://user:pass@db:5432/myapp
    env_file:
      - .env                # load from file
      - .env.production
```

#### Volumes and Bind Mounts
```yaml
services:
  app:
    image: my-app
    volumes:
      - app-data:/app/data              # named volume
      - ./config:/app/config:ro         # bind mount (read-only)
      - /var/log:/app/logs              # bind mount
      - temp-data:/tmp                  # named volume

volumes:
  app-data:
  temp-data:
```

## Essential Docker Compose Commands

### Basic Commands
```bash
# Start services in background
docker-compose up -d

# Start services in foreground (see logs)
docker-compose up

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Restart services
docker-compose restart

# View running services
docker-compose ps
```

### Building and Updating
```bash
# Build or rebuild services
docker-compose build

# Build without cache
docker-compose build --no-cache

# Pull latest images
docker-compose pull

# Start with build
docker-compose up --build
```

### Logs and Monitoring
```bash
# View logs from all services
docker-compose logs

# Follow logs in real-time
docker-compose logs -f

# View logs from specific service
docker-compose logs web

# View last 50 lines
docker-compose logs --tail=50
```

### Service Management
```bash
# Scale services
docker-compose up -d --scale web=3

# Execute command in service
docker-compose exec web bash

# Run one-off command
docker-compose run web npm test

# Stop specific service
docker-compose stop web

# Remove stopped containers
docker-compose rm
```

## Practical Examples

### Example 1: LAMP Stack
```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    image: httpd:2.4
    ports:
      - "8080:80"
    volumes:
      - ./html:/usr/local/apache2/htdocs
    depends_on:
      - php

  php:
    image: php:7.4-fpm
    volumes:
      - ./html:/var/www/html

  mysql:
    image: mysql:8.0
    environment:
      - MYSQL_ROOT_PASSWORD=rootpassword
      - MYSQL_DATABASE=myapp
      - MYSQL_USER=appuser
      - MYSQL_PASSWORD=apppassword
    volumes:
      - mysql-data:/var/lib/mysql
    ports:
      - "3306:3306"

  phpmyadmin:
    image: phpmyadmin/phpmyadmin
    environment:
      - PMA_HOST=mysql
      - PMA_USER=root
      - PMA_PASSWORD=rootpassword
    ports:
      - "8081:80"
    depends_on:
      - mysql

volumes:
  mysql-data:
```

### Example 2: Node.js Application with MongoDB
```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongo:27017/myapp
      - REDIS_URL=redis://redis:6379
    volumes:
      - .:/app
      - /app/node_modules
    depends_on:
      - mongo
      - redis
    command: npm run dev

  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password

  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - app

volumes:
  mongo-data:
  redis-data:
```

### Example 3: Microservices Architecture
```yaml
# docker-compose.yml
version: '3.8'

services:
  # API Gateway
  gateway:
    build: ./gateway
    ports:
      - "8080:3000"
    environment:
      - USER_SERVICE_URL=http://user-service:3000
      - ORDER_SERVICE_URL=http://order-service:3000
      - PRODUCT_SERVICE_URL=http://product-service:3000
    depends_on:
      - user-service
      - order-service
      - product-service

  # User Service
  user-service:
    build: ./services/user
    environment:
      - DATABASE_URL=postgresql://postgres:password@user-db:5432/users
      - REDIS_URL=redis://redis:6379
    depends_on:
      - user-db
      - redis

  # Order Service
  order-service:
    build: ./services/order
    environment:
      - DATABASE_URL=postgresql://postgres:password@order-db:5432/orders
      - USER_SERVICE_URL=http://user-service:3000
    depends_on:
      - order-db

  # Product Service
  product-service:
    build: ./services/product
    environment:
      - DATABASE_URL=postgresql://postgres:password@product-db:5432/products
    depends_on:
      - product-db

  # Databases
  user-db:
    image: postgres:13
    environment:
      - POSTGRES_DB=users
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - user-db-data:/var/lib/postgresql/data

  order-db:
    image: postgres:13
    environment:
      - POSTGRES_DB=orders
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - order-db-data:/var/lib/postgresql/data

  product-db:
    image: postgres:13
    environment:
      - POSTGRES_DB=products
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - product-db-data:/var/lib/postgresql/data

  # Shared Services
  redis:
    image: redis:alpine
    volumes:
      - redis-data:/data

volumes:
  user-db-data:
  order-db-data:
  product-db-data:
  redis-data:
```

## Advanced Compose Features

### Environment Files
```bash
# .env file
POSTGRES_PASSWORD=mypassword
NODE_ENV=development
API_PORT=3000
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    image: my-app
    ports:
      - "${API_PORT}:3000"
    environment:
      - NODE_ENV=${NODE_ENV}
      - DB_PASSWORD=${POSTGRES_PASSWORD}
```

### Override Files
```yaml
# docker-compose.override.yml (automatically loaded)
version: '3.8'
services:
  app:
    volumes:
      - .:/app  # mount source code for development
    command: npm run dev
```

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    image: my-app:latest
    restart: unless-stopped
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
```

```bash
# Use specific override file
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Health Checks
```yaml
services:
  web:
    image: nginx
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

### Service Dependencies
```yaml
services:
  web:
    image: my-web-app
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
        
  db:
    image: postgres
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

## Best Practices

### File Organization
```
project/
├── docker-compose.yml
├── docker-compose.override.yml
├── docker-compose.prod.yml
├── .env
├── .env.example
├── services/
│   ├── web/
│   │   └── Dockerfile
│   └── api/
│       └── Dockerfile
└── config/
    ├── nginx/
    └── postgres/
```

### Security
```yaml
# Use secrets for sensitive data
services:
  app:
    image: my-app
    secrets:
      - db_password
      - api_key

secrets:
  db_password:
    file: ./secrets/db_password.txt
  api_key:
    external: true
```

### Performance
```yaml
services:
  app:
    image: my-app
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### Development vs Production
```yaml
# Development
services:
  app:
    build: .
    volumes:
      - .:/app
    environment:
      - NODE_ENV=development

# Production  
services:
  app:
    image: my-app:latest
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

Docker Compose simplifies multi-container application management and is essential for modern development workflows. The next topic covers production deployment strategies.
