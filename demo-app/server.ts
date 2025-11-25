import express, { Express, Request, Response } from 'express';
import path from 'path';

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// State for breaking/restoring locators
interface AppState {
  breakSelector: boolean;
}

const state: AppState = {
  breakSelector: false,
};

/**
 * Main login page
 * By default, renders form with normal selectors (id="username", id="password")
 * When breakSelector=true, changes ID attributes to test self-healing
 */
app.get('/', (req: Request, res: Response) => {
  const usernameId = state.breakSelector ? 'user-input-broken' : 'username';
  const passwordId = state.breakSelector ? 'pass-input-broken' : 'password';
  const submitId = state.breakSelector ? 'login-btn-broken' : 'login-button';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Self-Healing Demo App</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          width: 100%;
          max-width: 400px;
        }
        h1 {
          color: #333;
          text-align: center;
          margin-top: 0;
        }
        .status {
          padding: 10px;
          margin-bottom: 20px;
          border-radius: 4px;
          text-align: center;
          font-weight: bold;
        }
        .status.normal {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .status.broken {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        .form-group {
          margin-bottom: 15px;
        }
        label {
          display: block;
          margin-bottom: 5px;
          color: #333;
          font-weight: bold;
        }
        input[type="text"],
        input[type="password"] {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          box-sizing: border-box;
          font-size: 14px;
        }
        input[type="text"]:focus,
        input[type="password"]:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 5px rgba(102, 126, 234, 0.5);
        }
        button {
          width: 100%;
          padding: 10px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: background 0.3s;
        }
        button:hover {
          background: #5568d3;
        }
        .admin-panel {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ddd;
        }
        .admin-panel h3 {
          margin-top: 0;
          color: #333;
          font-size: 14px;
        }
        .admin-buttons {
          display: flex;
          gap: 10px;
        }
        .admin-btn {
          flex: 1;
          padding: 8px;
          font-size: 12px;
          background: #6c757d;
          border: none;
          border-radius: 4px;
          color: white;
          cursor: pointer;
          transition: background 0.3s;
        }
        .admin-btn:hover {
          background: #5a6268;
        }
        .message {
          margin-top: 20px;
          padding: 10px;
          border-radius: 4px;
          text-align: center;
          display: none;
        }
        .message.success {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .message.error {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>Self-Healing Demo</h1>
        <div class="status ${state.breakSelector ? 'broken' : 'normal'}">
          ${state.breakSelector ? '🔴 SELECTORS BROKEN (Self-healing should kick in)' : '✅ Normal Mode'}
        </div>
        
        <form id="loginForm">
          <div class="form-group">
            <label for="${usernameId}">Username:</label>
            <input 
              type="text" 
              id="${usernameId}" 
              name="username" 
              required 
              placeholder="demo"
              value="demo"
            />
          </div>
          
          <div class="form-group">
            <label for="${passwordId}">Password:</label>
            <input 
              type="password" 
              id="${passwordId}" 
              name="password" 
              required 
              placeholder="password"
              value="password"
            />
          </div>
          
          <button type="submit" id="${submitId}">Login</button>
        </form>

        <div id="message" class="message"></div>

        <div class="admin-panel">
          <h3>Test Controls (Admin)</h3>
          <div class="admin-buttons">
            <button class="admin-btn" onclick="breakSelectors()">Break Selectors</button>
            <button class="admin-btn" onclick="restoreSelectors()">Restore Selectors</button>
            <button class="admin-btn" onclick="resetCache()">Reset Cache</button>
          </div>
        </div>
      </div>

      <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
          e.preventDefault();
          
          const username = document.getElementById('${usernameId}').value;
          const password = document.getElementById('${passwordId}').value;
          
          if (username === 'demo' && password === 'password') {
            showMessage('✅ Login successful!', 'success');
            setTimeout(() => {
              window.location.href = '/success';
            }, 1000);
          } else {
            showMessage('❌ Invalid credentials', 'error');
          }
        });

        async function breakSelectors() {
          const res = await fetch('/api/break-selectors', { method: 'POST' });
          if (res.ok) {
            showMessage('Selectors broken! Page IDs changed.', 'error');
            setTimeout(() => location.reload(), 500);
          }
        }

        async function restoreSelectors() {
          const res = await fetch('/api/restore-selectors', { method: 'POST' });
          if (res.ok) {
            showMessage('Selectors restored!', 'success');
            setTimeout(() => location.reload(), 500);
          }
        }

        async function resetCache() {
          const res = await fetch('/api/reset-cache', { method: 'POST' });
          if (res.ok) {
            showMessage('Cache reset!', 'success');
          }
        }

        function showMessage(text, type) {
          const msg = document.getElementById('message');
          msg.textContent = text;
          msg.className = \`message \${type}\`;
          msg.style.display = 'block';
        }
      </script>
    </body>
    </html>
  `;
  
  res.send(html);
});

/**
 * Success page shown after login
 */
app.get('/success', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Login Successful</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
          background: white;
          padding: 40px;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          text-align: center;
        }
        h1 {
          color: #155724;
          margin: 0;
        }
        p {
          color: #666;
          margin: 10px 0 20px 0;
        }
        a {
          color: #667eea;
          text-decoration: none;
          font-weight: bold;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>✅ Login Successful!</h1>
        <p>Welcome to the Self-Healing Demo</p>
        <a href="/">Back to Login</a>
      </div>
    </body>
    </html>
  `);
});

/**
 * API endpoint to break selectors
 */
app.post('/api/break-selectors', (req: Request, res: Response) => {
  state.breakSelector = true;
  res.json({ status: 'Selectors broken', breakSelector: true });
});

/**
 * API endpoint to restore selectors
 */
app.post('/api/restore-selectors', (req: Request, res: Response) => {
  state.breakSelector = false;
  res.json({ status: 'Selectors restored', breakSelector: false });
});

/**
 * API endpoint to get current state
 */
app.get('/api/state', (req: Request, res: Response) => {
  res.json(state);
});

/**
 * API endpoint to reset cache (frontend would handle this)
 */
app.post('/api/reset-cache', (req: Request, res: Response) => {
  res.json({ status: 'Cache reset request acknowledged' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Self-Healing Demo Server running on http://localhost:${PORT}`);
});
