FROM node:18-alpine

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production --no-audit --no-fund && npm cache clean --force

# Copy application code
COPY . .

# Ensure shared code is available at /shared and node can resolve modules
ENV NODE_PATH=/app/node_modules
RUN ln -s /shared /app/shared || true

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S fintech -u 1001

# Change ownership of the app directory
RUN chown -R fintech:nodejs /app

# Switch to non-root user
USER fintech

# Expose port
EXPOSE 8009

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8009/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "server.js"]