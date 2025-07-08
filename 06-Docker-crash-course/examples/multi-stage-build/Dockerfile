# Multi-stage Dockerfile example for a React application
# This demonstrates how to build optimized production images

# Stage 1: Build stage
FROM node:16-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY tsconfig.json ./
COPY .env* ./

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built assets from builder stage
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN addgroup -g 1001 -S nginx-user
RUN adduser -S nginx-user -u 1001 -G nginx-user

# Change ownership of nginx directories
RUN chown -R nginx-user:nginx-user /var/cache/nginx /var/run /var/log/nginx /usr/share/nginx/html

# Switch to non-root user
USER nginx-user

# Expose port
EXPOSE 8080

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

# Alternative multi-stage example for Go application
# Uncomment the following to see a Go example:

# # Stage 1: Build stage for Go
# FROM golang:1.19-alpine AS go-builder
# 
# WORKDIR /app
# 
# # Copy go mod files
# COPY go.mod go.sum ./
# 
# # Download dependencies
# RUN go mod download
# 
# # Copy source code
# COPY . .
# 
# # Build the application
# RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .
# 
# # Stage 2: Production stage for Go
# FROM alpine:latest AS go-production
# 
# # Install ca-certificates for HTTPS requests
# RUN apk --no-cache add ca-certificates
# 
# WORKDIR /root/
# 
# # Copy the binary from builder stage
# COPY --from=go-builder /app/main .
# 
# # Expose port
# EXPOSE 8080
# 
# # Run the application
# CMD ["./main"]

# Benefits of multi-stage builds:
# 1. Smaller final image size (only production artifacts)
# 2. Better security (no build tools in production)
# 3. Faster deployment (smaller images transfer faster)
# 4. Cleaner separation of build and runtime environments

# Example build commands:
# docker build -t my-app:latest .
# docker build --target=builder -t my-app:builder .  # Build only first stage
# docker images  # Compare sizes
