FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy shared dependencies first for better caching
COPY shared/ ./shared/
COPY package*.json ./
RUN npm install --production

# Copy service-specific files
COPY apps/dispute-service/package*.json ./apps/dispute-service/
WORKDIR /app/apps/dispute-service
RUN npm install --production

# Copy application code
COPY apps/dispute-service/ ./

# Create non-root user
USER node

# Set working directory back to app root for shared modules
WORKDIR /app

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8007/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Expose port
EXPOSE 8007

# Start the application
CMD ["node", "apps/dispute-service/server.js"]