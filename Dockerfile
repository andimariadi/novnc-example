# Multi-stage build for production optimization
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Development stage
FROM base AS development
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 7575 7576 9229
CMD ["node", "--inspect=0.0.0.0:9229", "server.js"]

# Production stage
FROM base AS production

# Copy package files
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --omit=dev && npm cache clean --force

# Copy application code
COPY . .

# Expose ports
EXPOSE 7575 7576

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S novnc -u 1001

# Change ownership of app directory
RUN chown -R novnc:nodejs /app
USER novnc

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: 7575, path: '/vnc/', timeout: 2000 }; \
    const req = http.request(options, (res) => { \
    if (res.statusCode === 200 || res.statusCode === 302) process.exit(0); \
    else process.exit(1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Start the application
CMD ["node", "server.js"]

# Default to production
FROM production
