#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');

const port = 8080;
const testAppDir = path.join(__dirname);

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let filePath = path.join(testAppDir, req.url === '/' ? 'index.html' : req.url);
    const extname = path.extname(filePath);
    const contentType = mimeTypes[extname] || 'text/plain';

    // Check if file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File doesn't exist, serve 404
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end(`
                <html>
                    <body>
                        <h1>404 - Page Not Found</h1>
                        <p>The requested page could not be found.</p>
                        <a href="/">Go back to home</a>
                    </body>
                </html>
            `);
            return;
        }

        // Read and serve the file
        fs.readFile(filePath, (err, content) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
                return;
            }

            res.writeHead(200, { 
                'Content-Type': contentType,
                'Cache-Control': 'no-cache'
            });
            res.end(content);
        });
    });
});

server.listen(port, 'localhost', () => {
    console.log(`🚀 Test Application Server running at http://localhost:${port}`);
    console.log('📄 Available pages:');
    console.log(`   • Home: http://localhost:${port}/index.html`);
    console.log(`   • Login: http://localhost:${port}/login.html`);
    console.log(`   • Products: http://localhost:${port}/products.html`);
    console.log(`   • Contact: http://localhost:${port}/contact.html`);
    console.log('🛑 Press Ctrl+C to stop the server');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down the server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});