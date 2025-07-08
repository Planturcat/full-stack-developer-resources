# Networking

Docker networking enables containers to communicate with each other, the host system, and external networks. Understanding Docker networking is essential for building multi-container applications.

## Docker Network Fundamentals

### Default Network Behavior
When Docker is installed, it creates three default networks:

```bash
# List all networks
docker network ls

# Output:
# NETWORK ID     NAME      DRIVER    SCOPE
# 1a2b3c4d5e6f   bridge    bridge    local
# 7g8h9i0j1k2l   host      host      local  
# 3m4n5o6p7q8r   none      null      local
```

### Network Drivers

#### Bridge Network (Default)
- **Default network** for containers
- **Isolated** from host network
- **Internal communication** between containers
- **Port mapping** required for external access

#### Host Network
- **Shares host network stack**
- **No network isolation**
- **Direct access** to host ports
- **Better performance** but less security

#### None Network
- **No network access**
- **Complete isolation**
- **Useful for** security-sensitive containers

## Working with Bridge Networks

### Default Bridge Network
```bash
# Run container on default bridge
docker run -d --name web1 nginx

# Check container IP
docker inspect web1 | grep IPAddress

# Containers can communicate by IP
docker run --rm alpine ping 172.17.0.2
```

### Custom Bridge Networks
```bash
# Create custom bridge network
docker network create my-network

# Run containers on custom network
docker run -d --name web1 --network my-network nginx
docker run -d --name web2 --network my-network nginx

# Containers can communicate by name
docker exec web1 ping web2
```

### Network Communication Examples

#### Example 1: Web Server and Database
```bash
# Create network for application
docker network create app-network

# Run database container
docker run -d \
  --name postgres-db \
  --network app-network \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=myapp \
  postgres:13

# Run web application
docker run -d \
  --name web-app \
  --network app-network \
  -p 8080:3000 \
  -e DATABASE_URL=postgresql://postgres:mypassword@postgres-db:5432/myapp \
  my-web-app

# Web app can connect to database using hostname 'postgres-db'
```

#### Example 2: Microservices Communication
```bash
# Create network for microservices
docker network create microservices

# User service
docker run -d \
  --name user-service \
  --network microservices \
  -p 8081:3000 \
  user-service:latest

# Order service  
docker run -d \
  --name order-service \
  --network microservices \
  -p 8082:3000 \
  -e USER_SERVICE_URL=http://user-service:3000 \
  order-service:latest

# API Gateway
docker run -d \
  --name api-gateway \
  --network microservices \
  -p 8080:3000 \
  -e USER_SERVICE_URL=http://user-service:3000 \
  -e ORDER_SERVICE_URL=http://order-service:3000 \
  api-gateway:latest
```

## Port Mapping and Exposure

### Port Mapping Syntax
```bash
# Map container port to host port
docker run -p <host-port>:<container-port> image

# Map to specific interface
docker run -p 127.0.0.1:8080:80 nginx

# Map multiple ports
docker run -p 8080:80 -p 8443:443 nginx

# Map random host port
docker run -P nginx

# Map UDP port
docker run -p 8080:80/udp image
```

### Port Mapping Examples
```bash
# Web server on port 8080
docker run -d -p 8080:80 --name web nginx

# Database on standard port
docker run -d -p 5432:5432 --name db postgres

# Multiple services
docker run -d \
  -p 8080:80 \
  -p 8443:443 \
  -p 9090:9090 \
  --name multi-service \
  my-app

# Check port mappings
docker port web
docker port db
```

### EXPOSE Instruction
```dockerfile
# In Dockerfile - documents ports (doesn't publish)
EXPOSE 3000
EXPOSE 8080/tcp
EXPOSE 53/udp

# Still need -p to publish ports
docker run -p 3000:3000 my-app
```

## Custom Networks

### Creating Custom Networks
```bash
# Create bridge network
docker network create my-app-network

# Create with custom subnet
docker network create \
  --driver bridge \
  --subnet=172.20.0.0/16 \
  --ip-range=172.20.240.0/20 \
  custom-network

# Create with gateway
docker network create \
  --driver bridge \
  --subnet=172.20.0.0/16 \
  --gateway=172.20.0.1 \
  gateway-network
```

### Network Management
```bash
# List networks
docker network ls

# Inspect network details
docker network inspect my-app-network

# Remove network
docker network rm my-app-network

# Remove unused networks
docker network prune
```

### Connecting Containers to Networks
```bash
# Connect running container to network
docker network connect my-network container-name

# Disconnect container from network
docker network disconnect my-network container-name

# Connect with specific IP
docker network connect --ip 172.20.0.10 my-network container-name

# Connect with alias
docker network connect --alias web-server my-network container-name
```

## Advanced Networking

### Host Network Mode
```bash
# Use host network (Linux only)
docker run -d --network host nginx

# Container uses host's network stack directly
# No port mapping needed
# Less isolation but better performance
```

### None Network Mode
```bash
# No network access
docker run -d --network none alpine sleep 3600

# Useful for:
# - Security-sensitive applications
# - Batch processing jobs
# - Containers that only process local files
```

### Container Network Mode
```bash
# Share network with another container
docker run -d --name web nginx
docker run -d --network container:web alpine sleep 3600

# Both containers share same network interface
```

## Network Security

### Network Isolation
```bash
# Create isolated networks for different environments
docker network create frontend-network
docker network create backend-network
docker network create database-network

# Frontend can only access backend
docker run -d --name frontend --network frontend-network web-ui
docker run -d --name api --network frontend-network --network backend-network api-server
docker run -d --name database --network backend-network postgres
```

### Firewall Rules
```bash
# Docker automatically creates iptables rules
# View Docker's iptables rules
sudo iptables -L DOCKER

# Custom firewall rules
sudo iptables -I DOCKER-USER -s 192.168.1.0/24 -j DROP
```

## Network Troubleshooting

### Connectivity Testing
```bash
# Test container connectivity
docker exec container1 ping container2

# Test external connectivity
docker exec container1 ping google.com

# Test port connectivity
docker exec container1 telnet container2 80

# Test DNS resolution
docker exec container1 nslookup container2
```

### Network Inspection
```bash
# Show container network settings
docker inspect container-name | grep -A 20 NetworkSettings

# Show network details
docker network inspect network-name

# Show container processes and ports
docker exec container-name netstat -tulpn
```

### Common Network Issues

#### Issue 1: Container Can't Reach External Network
```bash
# Check DNS settings
docker exec container-name cat /etc/resolv.conf

# Test DNS resolution
docker exec container-name nslookup google.com

# Check routing
docker exec container-name route -n
```

#### Issue 2: Containers Can't Communicate
```bash
# Verify containers are on same network
docker inspect container1 | grep NetworkMode
docker inspect container2 | grep NetworkMode

# Check if custom network is needed
docker network create test-network
docker network connect test-network container1
docker network connect test-network container2
```

#### Issue 3: Port Not Accessible from Host
```bash
# Check port mapping
docker port container-name

# Verify service is listening
docker exec container-name netstat -tulpn | grep :80

# Check firewall rules
sudo iptables -L
```

## Network Performance

### Performance Considerations
```bash
# Host network for best performance (Linux)
docker run --network host high-performance-app

# Custom bridge for isolation with good performance
docker network create --driver bridge fast-network
docker run --network fast-network app

# Avoid default bridge for production
```

### Monitoring Network Performance
```bash
# Monitor network usage
docker stats --format "table {{.Container}}\t{{.NetIO}}"

# Network interface statistics
docker exec container-name cat /proc/net/dev

# Bandwidth testing between containers
docker exec container1 iperf3 -s &
docker exec container2 iperf3 -c container1
```

## Best Practices

### Network Design
- **Use custom networks** instead of default bridge
- **Separate networks** for different application tiers
- **Minimize exposed ports** to reduce attack surface
- **Use meaningful network names** for documentation

### Security
```bash
# Don't expose unnecessary ports
docker run -p 127.0.0.1:5432:5432 postgres  # Only localhost

# Use internal networks for backend services
docker network create --internal backend-only

# Implement network segmentation
docker network create frontend
docker network create backend  
docker network create database
```

### Performance
- **Use host networking** for high-performance applications (Linux)
- **Minimize network hops** between containers
- **Use local volumes** instead of network storage when possible
- **Monitor network metrics** in production

### Operational
- **Document network topology** for your applications
- **Use consistent naming** for networks across environments
- **Clean up unused networks** regularly
- **Monitor network resource usage**

Understanding Docker networking enables you to build scalable and secure multi-container applications. The next topic covers Docker Compose for orchestrating multi-container applications.
