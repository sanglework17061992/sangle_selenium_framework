# Sangle Capture Tool - Extension Implementation

A Maestro-like automation tool for recording and generating test automation code by capturing user interactions on web applications.

## 🎯 Overview

The Capture Tool is a comprehensive solution that allows QA engineers to:
- 🌐 Open a browser and navigate to any URL
- 🖱️ Hover over elements to see their properties in real-time
- 📍 Select elements and capture their locators (CSS, XPath, ID, Smart XPath)
- ⚡ Choose actions (click, type, check, etc.) or assertions (visible, enabled, etc.)
- 💾 Insert captured code into test files with single-click or Insert & Run mode
- ✅ Optionally execute tests immediately to verify captured actions

## 📁 Project Structure

```
capture-extension/
├── src/
│   ├── services/           # Core business logic
│   │   ├── TemplateGenerator.ts    # Generate test boilerplate
│   │   ├── LocatorCapture.ts       # Extract and rank locators
│   │   ├── CodeGenerator.ts        # Generate action/assertion code
│   │   ├── FileWriter.ts           # Safe file operations
│   │   ├── ActionHandler.ts        # Insert vs Insert & Run logic
│   │   ├── TestRunner.ts           # Execute tests
│   │   ├── CDPManager.ts           # Browser control (TODO)
│   │   └── ActionExecutor.ts       # Execute actions in browser (TODO)
│   ├── ui/                 # React components
│   │   ├── App.tsx         # Main app component
│   │   ├── App.css         # Styling
│   │   ├── index.tsx       # React entry point
│   │   └── components/
│   │       ├── LeftPanel.tsx       # Template & code display
│   │       ├── RightPanel.tsx      # Browser preview
│   │       ├── ActionPopup.tsx     # Action selection
│   │       └── LocatorPopup.tsx    # Locator selection (TODO)
│   ├── types/              # Type definitions
│   │   └── index.ts        # Shared interfaces
│   ├── content-script.ts   # Browser injection script
│   └── server.ts           # Express & WebSocket server
├── public/
│   └── index.html          # HTML entry point
├── dist/                   # Compiled output
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript configuration
├── webpack.config.js       # Build configuration
├── TODO.md                 # Implementation checklist
└── README.md               # This file
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- Chrome browser (latest version)

### Installation

```bash
# Navigate to capture-extension directory
cd capture-extension

# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm run dev:server
```

### Running

```bash
# Terminal 1: Start the server
npm run dev:server

# Terminal 2: In a browser, navigate to
http://localhost:3000
```

## 💡 How It Works

### 1. Template Generation
```typescript
// User enters test name and URL
// System generates:
describe('My Test - Captured Flow', () => {
    // ... boilerplate code
    it('should execute captured actions', async () => {
        // CAPTURED ACTIONS START
        // <- Insertion point for captured code
        // CAPTURED ACTIONS END
    });
});
```

### 2. Element Capture
```
User hovers over element → Content script detects → Highlight appears
Right-click → Show locator options (CSS, XPath, ID, SmartXPath)
```

### 3. Action Selection
```
User selects locator → Action menu appears
Choose action (click, type, check, etc.)
Or choose assertion (toBeVisible, toBeEnabled, etc.)
```

### 4. Code Generation (Option B Format)
```typescript
// Generated code is inserted into test:
logger.info('Captured: Click submit button');
await this.page.css('button[type="submit"]').click();

logger.info('Captured: Verify success message is visible');
await sanExpect(this.page.css('.success-message')).toBeVisible();
```

### 5. Insert Modes

#### Insert Only
- Code is inserted into test file
- No test execution
- User reviews before running

#### Insert & Run
- Code is inserted into test file
- Test is executed immediately
- If successful: code stays, backup deleted
- If fails: code removed, file restored from backup

## 🔧 API Reference

### WebSocket Messages

#### GENERATE_TEMPLATE
```json
{
  "type": "GENERATE_TEMPLATE",
  "payload": {
    "testName": "User Registration",
    "url": "https://example.com/register"
  }
}
```

#### GENERATE_LOCATORS
```json
{
  "type": "GENERATE_LOCATORS",
  "payload": {
    "elementInfo": { /* element data */ }
  }
}
```

#### GENERATE_CODE
```json
{
  "type": "GENERATE_CODE",
  "payload": {
    "locator": { "type": "css", "value": ".button" },
    "actionType": "click",
    "parameters": {}
  }
}
```

#### INSERT_CODE
```json
{
  "type": "INSERT_CODE",
  "payload": {
    "testFilePath": "/path/to/test.spec.ts",
    "code": "await this.page.css('.button').click();",
    "insertionPoint": 1234
  }
}
```

#### INSERT_AND_RUN
```json
{
  "type": "INSERT_AND_RUN",
  "payload": {
    "testFilePath": "/path/to/test.spec.ts",
    "code": "await this.page.css('.button').click();",
    "insertionPoint": 1234,
    "testName": "should click button"
  }
}
```

### REST API Endpoints

#### GET /api/health
Health check endpoint
```bash
curl http://localhost:3000/api/health
```

#### GET /api/tests
List available test files
```bash
curl http://localhost:3000/api/tests
```

#### GET /api/tests/:filename
Get test file content
```bash
curl http://localhost:3000/api/tests/my-test.spec.ts
```

## 🎨 UI Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    Sangle Capture Tool                   │
├──────────────────────────────┬──────────────────────────┤
│                              │                          │
│   LEFT PANEL (40%)           │   RIGHT PANEL (60%)      │
│   ├─ Test Config             │   ├─ Browser Preview     │
│   │  └─ Name, URL            │   │                      │
│   │  └─ Generate Button      │   ├─ Element Info        │
│   │                          │   │  └─ On hover:        │
│   ├─ Code Display            │   │    Tag, Classes,     │
│   │  └─ Template             │   │    Locators          │
│   │  └─ Live Code Insert     │   │                      │
│   │                          │   └─ Action Popup       │
│   └─ Action History          │      ├─ Locators        │
│                              │      ├─ Actions         │
│                              │      └─ Assertions      │
└──────────────────────────────┴──────────────────────────┘
```

## 🛠️ Services Documentation

### TemplateGenerator
Generates test boilerplate with marked insertion points for captured code.

```typescript
const template = TemplateGenerator.generateTemplate('My Test', 'https://example.com');
// Returns: { testName, url, template, insertionPoint }

const updated = TemplateGenerator.insertAction(template, code, insertionPoint);
```

### LocatorCapture
Generates and ranks multiple locator strategies.

```typescript
const locators = LocatorCapture.generateLocators(elementInfo);
// Returns: Top 3 locators with confidence scores
```

### CodeGenerator
Generates formatted action/assertion code.

```typescript
const code = CodeGenerator.generateActionCode(locator, 'click');
// Returns: { action, logger, fullCode }
```

### FileWriter
Safely writes code to test files with backup support.

```typescript
FileWriter.insertCodeIntoTestFile(filePath, code, insertionPoint);
FileWriter.restoreFromBackup(filePath);
```

### ActionHandler
Coordinates Insert and Insert & Run workflows.

```typescript
await ActionHandler.handleInsertOnly(filePath, code, insertionPoint);
await ActionHandler.handleInsertAndRun(filePath, code, insertionPoint, testName);
```

### TestRunner
Executes tests and captures output.

```typescript
const result = await TestRunner.runTest(filePath, testName);
// Returns: { success, output, error? }
```

## 📋 Code Generation Format (Option B)

All generated code follows this pattern:

```typescript
// Insert into test case body
logger.info('Captured: <Action Description>');
await this.page.<locatorType>('<locatorValue>').<action>();
```

### Supported Locator Types
- `css(selector)` - CSS selector
- `xpath(path)` - XPath expression
- `id(id)` - Element ID
- Custom generated based on element attributes

### Supported Actions
- `click()` - Click element
- `type(text)` - Type text
- `clear()` - Clear input
- `hover()` - Hover element
- `focus()` - Focus element
- `getText()` - Get text content
- `submit()` - Submit form
- `check()` - Check checkbox
- `uncheck()` - Uncheck checkbox
- `select(value)` - Select option

### Supported Assertions
- `toBeVisible()` - Assert element is visible
- `toBeHidden()` - Assert element is hidden
- `toBeEnabled()` - Assert element is enabled
- `toBeDisabled()` - Assert element is disabled
- `toContain(text)` - Assert element contains text
- `toEqual(value)` - Assert element equals value

## 🐛 Troubleshooting

### Connection Issues
```
Error: Cannot connect to server
→ Ensure server is running: npm run dev:server
→ Check port 3000 is available
→ Check firewall settings
```

### File Write Errors
```
Error: Failed to insert code into test file
→ Check file permissions
→ Verify file path is correct
→ Check backup file wasn't created from previous failure
```

### Test Execution Fails
```
Error: Test execution failed
→ Check test file syntax is valid
→ Verify npm test command works
→ Check test is not already failing
→ Code will be rolled back automatically
```

## 📝 Implementation Status

**Phase 1: Core Services** - ✅ 70% Complete
- ✅ Template Generator
- ✅ Locator Capture
- ✅ Code Generator
- ✅ File Writer
- ✅ Action Handler
- ✅ Test Runner
- ⏳ CDP Manager (TODO)
- ⏳ Action Executor (TODO)

**Phase 2: UI Components** - ⏳ 50% Complete
- ✅ App Component
- ✅ Left Panel
- ✅ Right Panel
- ✅ Action Popup
- ⏳ Locator Selection Popup (TODO)
- ⏳ Results Panel (TODO)

**Phase 3: Integration & Testing** - ⏳ 0% Complete
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E testing
- [ ] Build optimization
- [ ] Documentation

## 🔮 Future Enhancements

- [ ] Support for multiple browsers (Firefox, Safari)
- [ ] Record entire flows automatically
- [ ] AI-powered locator selection
- [ ] Browser extension version
- [ ] VS Code integration
- [ ] Cloud-based test management
- [ ] Team collaboration features
- [ ] Performance optimization

## 📄 License

Part of the Sangle Selenium Framework - same license as parent project

## 👥 Contributors

See parent project repository

## 📞 Support

For issues, questions, or feature requests, please refer to the parent project's issue tracker.

---

**Last Updated:** December 3, 2025
**Status:** Active Development - Phase 1 & 2
