FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy shared dependencies first for better caching
COPY shared/ ./shared/
COPY package*.json ./
RUN npm install --production

# Copy service-specific files
COPY apps/notification-service/package*.json ./apps/notification-service/
WORKDIR /app/apps/notification-service
RUN npm install --production

# Copy application code
COPY apps/notification-service/ ./

# Create non-root user
USER node

# Set working directory back to app root for shared modules
WORKDIR /app

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8009/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Expose port
EXPOSE 8009

# Start the application
CMD ["node", "apps/notification-service/server.js"]