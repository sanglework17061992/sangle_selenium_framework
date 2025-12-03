# Sangle Capture Tool - Implementation Todo

## Project Setup (COMPLETED)
- [x] Create capture-extension directory structure
- [x] Setup package.json with dependencies
- [x] Create TypeScript configuration
- [x] Setup webpack configuration
- [x] Create type definitions
- [x] Create public/index.html

## Core Services (IN PROGRESS)

### 1. Template Generator - COMPLETED
- [x] Generate test boilerplate templates
- [x] Support custom test names and URLs
- [x] Mark insertion points for captured code
- [x] Insert new actions into templates

### 2. Locator Capture - COMPLETED
- [x] Generate multiple locator types (CSS, XPath, ID, SmartXPath)
- [x] Rank locators by confidence score
- [x] Extract element attributes and positioning
- [x] Support data-testid and other semantic locators

### 3. Code Generator - COMPLETED
- [x] Generate action code (click, type, hover, etc.)
- [x] Generate assertion code (toBeVisible, toBeEnabled, etc.)
- [x] Format code in Option B style (this.page.css/xpath/id)
- [x] Include logger.info statements
- [x] Handle action parameters (text, values, etc.)

### 4. File Writer - COMPLETED
- [x] Insert code into test files safely
- [x] Create backup before modifications
- [x] Read test file content
- [x] List available test files
- [x] Restore from backup on failure

### 5. Action Handler - COMPLETED
- [x] Handle Insert Only workflow
- [x] Handle Insert & Run workflow
- [x] Validate actions before execution
- [x] Generate and validate code

### 6. Test Runner - COMPLETED
- [x] Run specific test or all tests
- [x] Capture test output
- [x] Determine test status (pass/fail)

### 7. CDP Manager - NOT STARTED
- [ ] Launch Chrome with CDP enabled
- [ ] Manage browser lifecycle
- [ ] Handle element detection
- [ ] Support browser configuration

### 8. Action Executor - NOT STARTED
- [ ] Execute captured actions in browser
- [ ] Handle click, type, select actions
- [ ] Perform read operations (getText)
- [ ] Take screenshots after actions

## Server & Communication (IN PROGRESS)

### 1. Express Server - COMPLETED
- [x] Setup HTTP server on port 3000
- [x] Create REST API endpoints (/api/health, /api/tests)
- [x] Setup WebSocket connection handler
- [x] Implement message routing for different action types

### 2. WebSocket Events - COMPLETED
- [x] GENERATE_TEMPLATE - Generate test boilerplate
- [x] GENERATE_LOCATORS - Generate element locators
- [x] GENERATE_CODE - Generate action code
- [x] INSERT_CODE - Insert code into test file
- [x] INSERT_AND_RUN - Insert and execute test

### 3. Content Script - COMPLETED
- [x] Track mouse hover events
- [x] Extract element data (tag, classes, attributes)
- [x] Generate XPath and CSS selectors
- [x] Create visual highlights on elements
- [x] Send element data via postMessage

## UI Components (IN PROGRESS)

### 1. Main App Component - COMPLETED
- [x] Setup WebSocket connection
- [x] Manage app state
- [x] Handle WebSocket messages
- [x] Route between panels

### 2. Left Panel - COMPLETED
- [x] Display test template
- [x] Show captured code
- [x] Input fields for test name/URL
- [x] Generate template button

### 3. Right Panel - COMPLETED
- [x] Display browser iframe
- [x] Show element information on hover
- [x] Connection status indicator
- [x] Element metadata display

### 4. Action Popup Component - COMPLETED
- [x] Display action list (click, type, hover, etc.)
- [x] Display assertion list (toBeVisible, etc.)
- [x] Handle action selection
- [x] Show locator information

### 5. Locator Selection - NOT STARTED
- [ ] Display top 3 locator options
- [ ] Show confidence scores
- [ ] Preview locator descriptions
- [ ] Allow user to select preferred locator

### 6. Advanced Components - NOT STARTED
- [ ] Code diff viewer
- [ ] Test execution results panel
- [ ] Element screenshot display
- [ ] Action history/undo

## Build & Deployment (NOT STARTED)
- [ ] Configure webpack for production
- [ ] Setup build script for TypeScript compilation
- [ ] Create dev server with hot reload
- [ ] Package extension for distribution
- [ ] Create installation guide

## Testing & Documentation (NOT STARTED)
- [ ] Unit tests for services
- [ ] Integration tests for server
- [ ] E2E tests for capture workflow
- [ ] User documentation
- [ ] API documentation
- [ ] Setup troubleshooting guide

## Future Enhancements (BACKLOG)
- [ ] Support for multiple browsers (Firefox, Safari)
- [ ] Record entire user flows automatically
- [ ] AI-powered locator selection
- [ ] Integration with CI/CD pipelines
- [ ] Cloud-based test management
- [ ] Team collaboration features
- [ ] Browser extension version
- [ ] VS Code extension integration

## Known Issues & TODO
- [ ] Fix TypeScript import path aliases (@types, @services, @ui)
- [ ] Add error handling and user feedback
- [ ] Implement retry logic for failed operations
- [ ] Add logging/debug mode
- [ ] Handle edge cases (iframes, shadow DOM)
- [ ] Improve CSS selector generation
- [ ] Add support for data-testid attributes
- [ ] Implement undo/redo functionality

## Current Status
Phase 1: Core Services & Server - 70% Complete
Phase 2: UI Components - 50% Complete
Phase 3: Integration & Testing - 0% Complete
