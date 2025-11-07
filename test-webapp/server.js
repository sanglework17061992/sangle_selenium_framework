const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/delayed-elements', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'delayed-elements.html'));
});

app.get('/form-interactions', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'form-interactions.html'));
});

app.get('/actionability-tests', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'actionability-tests.html'));
});

app.get('/overlay-tests', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'overlay-tests.html'));
});

app.get('/dynamic-content', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dynamic-content.html'));
});

// API endpoint for form submission
app.post('/api/submit-form', (req, res) => {
  console.log('Form submitted:', req.body);
  res.json({ success: true, data: req.body });
});

app.listen(PORT, () => {
  console.log(`Test webapp running at http://localhost:${PORT}`);
  console.log('Available test pages:');
  console.log(`  - http://localhost:${PORT}/`);
  console.log(`  - http://localhost:${PORT}/delayed-elements`);
  console.log(`  - http://localhost:${PORT}/form-interactions`);
  console.log(`  - http://localhost:${PORT}/actionability-tests`);
  console.log(`  - http://localhost:${PORT}/overlay-tests`);
  console.log(`  - http://localhost:${PORT}/dynamic-content`);
});
