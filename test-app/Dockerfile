# 🟢 Node.js Test Application Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Create package.json if it doesn't exist
COPY package.json* ./
RUN if [ ! -f package.json ]; then \
    echo '{"name":"selenium-test-app","version":"1.0.0","main":"server.js","scripts":{"start":"node server.js"}}' > package.json; \
    fi

# Install dependencies (if any)
RUN npm install

# Copy application files
COPY . .

# Make server.js executable
RUN chmod +x server.js

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "const http = require('http'); \
    const options = { hostname: 'localhost', port: 8080, path: '/', timeout: 2000 }; \
    const req = http.request(options, (res) => { process.exit(res.statusCode === 200 ? 0 : 1); }); \
    req.on('error', () => process.exit(1)); \
    req.on('timeout', () => process.exit(1)); \
    req.end();"

# Start the application
CMD ["node", "server.js"]