# Use official Node.js runtime as base image
FROM node:16-alpine

# Set working directory inside container
WORKDIR /app

# Copy application file
COPY app.js .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001 -G nodejs

# Change ownership of app directory
RUN chown -R nodeuser:nodejs /app

# Switch to non-root user
USER nodeuser

# Expose port 3000
EXPOSE 3000

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Define command to run application
CMD ["node", "app.js"]
