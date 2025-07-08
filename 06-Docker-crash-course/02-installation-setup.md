# Installation and Setup

This guide covers installing Docker on different platforms and verifying your installation works correctly.

## System Requirements

### Windows
- **Windows 10/11**: 64-bit Pro, Enterprise, or Education
- **WSL 2**: Windows Subsystem for Linux 2
- **Hyper-V**: Must be enabled
- **Virtualization**: Must be enabled in BIOS

### macOS
- **macOS 10.15** or newer
- **Hardware**: 2010 or newer Mac
- **Memory**: At least 4GB RAM

### Linux
- **64-bit kernel**: Version 3.10 or higher
- **Supported distributions**: Ubuntu, Debian, CentOS, Fedora, RHEL
- **Memory**: At least 2GB RAM

## Installation Instructions

### Windows Installation

1. **Download Docker Desktop**
   ```bash
   # Visit https://docs.docker.com/desktop/windows/install/
   # Download Docker Desktop for Windows
   ```

2. **Enable Required Features**
   ```powershell
   # Enable Hyper-V and Containers features
   # Go to: Control Panel > Programs > Turn Windows features on or off
   # Check: Hyper-V, Containers, Windows Subsystem for Linux
   ```

3. **Install WSL 2**
   ```powershell
   # Open PowerShell as Administrator
   wsl --install
   wsl --set-default-version 2
   ```

4. **Install Docker Desktop**
   - Run the downloaded installer
   - Follow installation wizard
   - Restart computer when prompted

5. **Verify Installation**
   ```bash
   docker --version
   docker run hello-world
   ```

### macOS Installation

1. **Download Docker Desktop**
   ```bash
   # Visit https://docs.docker.com/desktop/mac/install/
   # Choose Intel or Apple Silicon version
   ```

2. **Install Docker Desktop**
   ```bash
   # Drag Docker.app to Applications folder
   # Launch Docker from Applications
   # Grant necessary permissions
   ```

3. **Verify Installation**
   ```bash
   docker --version
   docker run hello-world
   ```

### Linux Installation (Ubuntu)

1. **Update Package Index**
   ```bash
   sudo apt update
   sudo apt install ca-certificates curl gnupg lsb-release
   ```

2. **Add Docker's Official GPG Key**
   ```bash
   sudo mkdir -p /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   ```

3. **Set Up Repository**
   ```bash
   echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
     $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   ```

4. **Install Docker Engine**
   ```bash
   sudo apt update
   sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin
   ```

5. **Start Docker Service**
   ```bash
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

6. **Add User to Docker Group**
   ```bash
   sudo usermod -aG docker $USER
   # Log out and back in for changes to take effect
   ```

7. **Verify Installation**
   ```bash
   docker --version
   docker run hello-world
   ```

## Verifying Your Installation

### Check Docker Version
```bash
# Check Docker version
docker --version
# Output: Docker version 20.10.17, build 100c701

# Check detailed version information
docker version
```

### Check Docker Info
```bash
# Display system-wide information
docker info
```

### Run Your First Container
```bash
# Run the hello-world container
docker run hello-world
```

**Expected Output:**
```
Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.
```

## Docker Desktop Overview

Docker Desktop provides a user-friendly interface for managing Docker:

### Key Features
- **Dashboard**: Visual container and image management
- **Settings**: Configure resources, file sharing, network
- **Extensions**: Add functionality with extensions
- **Dev Environments**: Collaborative development environments

### Accessing Docker Desktop
- **Windows**: System tray icon
- **macOS**: Menu bar icon
- **Linux**: Application menu or command line

### Important Settings

#### Resource Allocation
```bash
# Default settings (can be adjusted in Docker Desktop):
# CPU: 2 cores
# Memory: 2GB
# Swap: 1GB
# Disk: 60GB
```

#### File Sharing
- Configure which directories can be mounted in containers
- Required for volume mounts and bind mounts

## Basic Docker Commands

### Container Management
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# Run a container
docker run <image-name>

# Run container in background
docker run -d <image-name>

# Stop a container
docker stop <container-id>

# Remove a container
docker rm <container-id>
```

### Image Management
```bash
# List local images
docker images

# Pull an image from registry
docker pull <image-name>

# Remove an image
docker rmi <image-name>

# Build an image from Dockerfile
docker build -t <tag-name> .
```

### Getting Help
```bash
# General help
docker --help

# Command-specific help
docker run --help
docker build --help
```

## Testing Your Installation

### Test 1: Run Ubuntu Container
```bash
# Run Ubuntu container interactively
docker run -it ubuntu bash

# Inside the container:
cat /etc/os-release
exit
```

### Test 2: Run Web Server
```bash
# Run nginx web server
docker run -d -p 8080:80 nginx

# Open browser to http://localhost:8080
# You should see nginx welcome page

# Stop the container
docker stop $(docker ps -q --filter ancestor=nginx)
```

### Test 3: Check Resource Usage
```bash
# Monitor container resource usage
docker stats

# Press Ctrl+C to exit
```

## Troubleshooting Common Issues

### Docker Daemon Not Running
```bash
# Windows/macOS: Start Docker Desktop
# Linux: Start Docker service
sudo systemctl start docker
```

### Permission Denied (Linux)
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Log out and back in
```

### WSL 2 Issues (Windows)
```bash
# Update WSL 2
wsl --update

# Set WSL 2 as default
wsl --set-default-version 2
```

### Port Already in Use
```bash
# Find process using port
netstat -tulpn | grep :8080

# Kill process or use different port
docker run -d -p 8081:80 nginx
```

### Disk Space Issues
```bash
# Clean up unused containers, images, networks
docker system prune

# Remove all unused data (be careful!)
docker system prune -a
```

## Next Steps

Now that Docker is installed and working:

1. **Explore Docker Hub**: Browse available images at https://hub.docker.com
2. **Practice Commands**: Try running different containers
3. **Read Documentation**: Visit https://docs.docker.com
4. **Join Community**: Participate in Docker forums and communities

Your Docker installation is now ready for the next topic: understanding images and containers.
