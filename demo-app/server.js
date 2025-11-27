/**
 * Demo App - Simple Login Server
 * Used to test self-healing functionality
 * 
 * Run: node demo-app/server.js
 * Visit: http://localhost:3000
 */

const express = require('express');
const path = require('node:path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Simple hardcoded credentials for demo
  if (username === 'testuser' && password === 'password123') {
    res.json({
      success: true,
      message: 'Login successful!',
      redirect: '/dashboard.html'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid username or password'
    });
  }
});

app.get('/dashboard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', port: PORT });
});

// Start server
app.listen(PORT, () => {
  console.log(`Demo Login App - Self-Healing Test`);
  console.log(`http://localhost:${PORT}`);
  console.log(`Test Credentials: testuser / password123`);
});

module.exports = app;
