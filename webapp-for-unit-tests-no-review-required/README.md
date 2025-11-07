# Test Webapp for SanElement & SanAssertion

A comprehensive Node.js Express application for testing Selenium WebDriver framework features including actionability checks, form interactions, and dynamic content.

> **Note:** This webapp is for internal framework testing only and does not require code review.

## 🚀 Quick Start

```bash
cd webapp-for-unit-tests-no-review-required
npm install
npm start
```

The server will start on **http://localhost:3001**

## 📋 Test Pages

### 1. **Home Page** (`/`)
- Overview of all available test pages
- Quick navigation to different test scenarios

### 2. **Delayed Elements** (`/delayed-elements`)
Test auto-wait functionality with configurable delays:
- ⏱️ Configurable delay slider (0-10 seconds)
- Delayed button appearance
- Delayed input fields
- Fade and slide animations
- Hidden → Visible transitions
- Disabled → Enabled transitions

**Key Features:**
- Test element appearance after custom delays
- Verify auto-wait works correctly
- Test animation completion detection

### 3. **Form Interactions** (`/form-interactions`)
Comprehensive form testing:
- 📝 Text inputs (text, email, password, number, phone, date)
- 📦 Textarea
- ☑️ Checkboxes (single and multiple)
- 🔘 Radio buttons
- 📋 Select dropdowns (single and multi-select)
- 📁 File upload
- ✅ Form validation
- 🔄 Form submission and reset

**Key Features:**
- Test all form input types
- Real-time form state display
- Form submission to API endpoint

### 4. **Actionability Tests** (`/actionability-tests`)
Test all Playwright-style actionability checks:

#### Visibility Tests:
- Hidden elements (`display: none`)
- Invisible elements (`visibility: hidden`)
- Zero opacity elements
- Zero size elements

#### Stability Tests:
- Moving/animating elements
- Elements that stabilize after animation

#### Enabled State Tests:
- Disabled buttons and inputs
- Toggle enabled/disabled state
- Enable after delay

#### Editability Tests:
- Read-only inputs
- Disabled textareas
- Toggle readonly state

#### Receives Events Tests:
- Elements obscured by overlays
- Elements with `pointer-events: none`
- Elements blocked by other elements

#### Combined Tests:
- Multiple issues (disabled + opacity)
- Gradual recovery (step-by-step fixes)

### 5. **Overlay Tests** (`/overlay-tests`)
Test elements obscured by overlays:
- 🔲 Full-page loading overlays
- 🪟 Modal dialogs
- 📐 Partial overlays
- 📚 Multiple stacked overlays
- 👻 Transparent overlays with pointer-events
- 🎬 Animated overlays (appear/disappear)

**Key Features:**
- Test clicking through/waiting for overlays
- Verify receivesEvents check works
- Test z-index scenarios

### 6. **Dynamic Content** (`/dynamic-content`)
Test dynamically added/removed elements:
- ➕ Add elements dynamically
- ➖ Remove elements
- 🔄 Replace content
- 📊 DOM mutations
- 🎯 AJAX-loaded content

## 🎛️ Configuration

### Delay Configuration
Most test pages include a delay slider to configure element appearance timing:
- **Range:** 0-10,000ms (0-10 seconds)
- **Default:** 2000ms (2 seconds)
- **Step:** 500ms

This allows you to test auto-wait functionality with different timeout values.

### Port Configuration
Default port is **3001**. To change:
```bash
PORT=3002 npm start
```

Or set the `PORT` environment variable in your system.

## 🧪 Testing with Selenium

### Example Test Using SanElement

```typescript
import { DriverManager } from '../src/driver/DriverManager';
import { SanElement } from '../src/core/elements/SanElement';

// Navigate to test page
await DriverManager.getDriver().get('http://localhost:3001/delayed-elements');

// Test delayed element with auto-wait
const triggerBtn = new SanElement({ using: 'css', value: '#triggerDelayedBtn' });
await triggerBtn.click();

// This will auto-wait for the element to appear and be actionable
const delayedBtn = new SanElement({ using: 'css', value: '#delayedButton' });
await delayedBtn.click(); // Waits for visibility, stability, enabled, and receivesEvents

// Test with force option to bypass checks
await delayedBtn.click({ force: true });

// Test with custom timeout
await delayedBtn.click({ timeout: 15000 });
```

### Example Test Using SanAssertion

```typescript
import { expect } from '../src/assertion/SanAssertion';

const button = new SanElement({ using: 'css', value: '#enableBtn' });

// Auto-retrying assertions
await expect(button).toBeVisible();
await expect(button).toBeEnabled();
await expect(button).toHaveText('Now Enabled!');

// Editable assertion
const input = new SanElement({ using: 'css', value: '#editableInput' });
await expect(input).toBeEditable();
```

## 📊 Test Scenarios Coverage

| Feature | Test Page | Scenarios |
|---------|-----------|-----------|
| Auto-wait | Delayed Elements | 6 scenarios |
| Form Inputs | Form Interactions | 15+ input types |
| Visibility | Actionability Tests | 4 scenarios |
| Stability | Actionability Tests | 2 scenarios |
| Enabled State | Actionability Tests | 3 scenarios |
| Editability | Actionability Tests | 3 scenarios |
| Receives Events | Actionability Tests | 2 scenarios |
| Overlays | Overlay Tests | 6 scenarios |
| Dynamic Content | Dynamic Content | 5 scenarios |

## 🔧 API Endpoints

### POST `/api/submit-form`
Submit form data for testing.

**Request:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "age": 25
}
```

**Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

## 📝 Development

### File Structure
```
webapp-for-unit-tests-no-review-required/
├── server.js           # Express server
├── package.json        # Dependencies
└── public/            # Static files
    ├── index.html             # Home page
    ├── delayed-elements.html   # Delayed elements tests
    ├── form-interactions.html  # Form testing
    ├── actionability-tests.html # Actionability checks
    ├── overlay-tests.html      # Overlay tests
    ├── dynamic-content.html    # Dynamic content tests
    └── styles.css             # Global styles
```

### Adding New Test Pages

1. Create HTML file in `public/` directory
2. Add route in `server.js`:
```javascript
app.get('/your-test-page', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'your-test-page.html'));
});
```
3. Add link in `index.html`

## 🎯 Best Practices for Testing

1. **Start with low delays** (500-1000ms) for quick feedback
2. **Increase delays** (5-10s) to test timeout handling
3. **Test force option** when intentionally bypassing checks
4. **Verify error messages** when elements aren't actionable
5. **Test combined scenarios** (multiple issues at once)
6. **Check console logs** for detailed debugging info

## 🐛 Troubleshooting

### Port Already in Use
If port 3001 is already in use:
```bash
PORT=3002 npm start
```

### Page Not Loading
- Ensure server is running: `npm start`
- Check console for errors
- Verify correct URL: `http://localhost:3001`

### Elements Not Appearing
- Check browser console for JavaScript errors
- Verify delay slider value
- Click "Reset All" to clear state

## 📚 Related Documentation

- [SanElement Documentation](../src/core/elements/SanElement.ts)
- [ActionabilityChecker](../src/core/elements/ActionabilityChecker.ts)
- [SanAssertion](../src/assertion/SanAssertion.ts)
- [Playwright Actionability](https://playwright.dev/docs/actionability)

## 🎉 Happy Testing!

This webapp provides a complete testing environment for validating your Selenium framework's actionability checks and auto-wait functionality. Use it to ensure your framework behaves like Playwright with intelligent waiting and proper error handling.
