# SaniumTS Selenium Framework

A modern TypeScript Selenium framework with Playwright-style actionability checks and intelligent auto-wait capabilities.

## Key Features

- **🎯 Playwright-Style Actionability** - Auto-wait with Check enum: `VISIBLE`, `STABLE`, `ENABLED`, `EDITABLE`
- **🔒 Type-Safe Actions** - ActionType enum for all interactions (CLICK, TYPE, HOVER, etc.)
- **⚡ Smart Auto-Wait** - Automatic waiting and retry logic with configurable timeouts
- **🎨 Fluent Assertions** - Chainable assertion API with built-in retry mechanisms
- **📊 Multi-Reporter Support** - Run Allure and Mochawesome reporters simultaneously
- **🏗️ Clean Architecture** - Page Object Model with separation of concerns
- **🔧 Zero Duplication** - DRY principles with shared utilities across all modules

## Quick Start

### Installation

```bash
npm install
```

### Run Tests

```bash
# Run tests with default reporter
npm test

# Run with multi-reporter (Allure + Mochawesome)
npm run test:multi

# Clean old reports and run tests
npm run test:clean
npm run test:multi:clean
```

### View Reports

```bash
# Allure Report
npm run report:allure

# Mochawesome Report
npm run report:mochawesome
```

## Core Components

### 1. ActionabilityChecker - Smart Auto-Wait System

The `ActionabilityChecker` module provides Playwright-style actionability validation with type-safe checks.

#### Check Enum

```typescript
export enum Check {
  VISIBLE = 'visible',    // Element is visible and has non-zero size
  STABLE = 'stable',      // Element position is stable (not animating)
  ENABLED = 'enabled',    // Element is enabled (not disabled)
  EDITABLE = 'editable',  // Element is editable (not readonly)
}
```

#### Key Features

- **Type-Safe Checks** - Enum-based validation prevents typos
- **Configurable Requirements** - Each action type has specific check requirements
- **Timeout Management** - Shared `getRemainingTimeout()` utility for DRY code
- **Polling Strategy** - Efficient 100ms polling with stability verification

#### Usage Example

```typescript
import { waitForActionability, Check } from './core/elements/ActionabilityChecker';

await waitForActionability(element, driver, {
  checks: [Check.VISIBLE, Check.STABLE, Check.ENABLED],
  timeout: 10000
});
```

#### Action Requirements (ActionConfig)

Different actions require different checks:

```typescript
const ACTION_REQUIREMENTS: Record<ActionType, ActionabilityOptions> = {
  [ActionType.CLICK]: { checks: [Check.VISIBLE, Check.STABLE, Check.ENABLED] },
  [ActionType.TYPE]: { checks: [Check.VISIBLE, Check.ENABLED, Check.EDITABLE] },
  [ActionType.CLEAR]: { checks: [Check.VISIBLE, Check.ENABLED, Check.EDITABLE] },
  [ActionType.HOVER]: { checks: [Check.VISIBLE, Check.STABLE] },
  // ... more actions
};
```

### 2. SanElement - Unified Element Wrapper

Smart element wrapper with auto-wait and actionability checks built-in.

#### Core Features

```typescript
// Basic interactions with auto-wait
await element.click();
await element.type('text');
await element.clear();

// Checkbox operations
await checkbox.check();
await checkbox.uncheck();
await checkbox.toggleCheckbox();
const isChecked = await checkbox.isChecked();

// Mouse interactions
await element.doubleClick();
await element.rightClick();
await element.hover();
await element.dragAndDrop(targetElement);

// Dropdown operations
await dropdown.selectByValue('value');
await dropdown.selectByText('Option 1');
await dropdown.selectByIndex(0);

// Reading element state
const text = await element.getText();
const value = await element.getAttribute('value');
const isDisplayed = await element.isDisplayed();

// Collection operations
const count = await elements.count();
const texts = await elements.getTexts();
const allElements = await elements.getElements();
await elements.clickAll();
```

#### Smart Options

```typescript
// Bypass actionability checks
await element.click({ force: true });

// Custom timeout
await element.click({ timeout: 15000 });

// Both options
await element.type('text', { force: true, timeout: 5000 });
```

### 3. SanAssertion - Fluent Assertion API

Chainable assertions with auto-retry for better test stability.

```typescript
import { expectElement } from './assertion';

// Visibility assertions
await expectElement(loginButton).toBeVisible();
await expectElement(errorMessage).toBeHidden();

// Text assertions
await expectElement(title).toHaveText('Welcome');
await expectElement(message).toContainText('Success');

// Attribute assertions
await expectElement(link).toHaveAttribute('href', '/home');
await expectElement(input).toHaveValue('username');
await expectElement(div).toHaveClass('active');

// State assertions
await expectElement(submitButton).toBeEnabled();
await expectElement(loadingSpinner).toBeDisabled();
```

### 4. Shared Utilities - DRY Principles

#### Timeout Management

All modules share the same timeout calculation logic:

```typescript
import { getRemainingTimeout } from './core/elements/ActionabilityChecker';

const startTime = Date.now();
while (getRemainingTimeout(startTime, timeout) > 0) {
  // Retry logic
}
```

**Used across:**
- `ActionabilityChecker` - waitForActionability polling
- `SanElement` - findElement retry logic
- `AssertionUtils` - waitUntil retry mechanism

#### Reporter Utilities (ReporterUtils)

Shared utilities for all reporters eliminate code duplication:

```typescript
// Screenshot capture
await captureScreenshot(driver, outputPath);

// Filename sanitization
const safeFilename = sanitizeFilename(testName);

// Directory management
await ensureDirectoryExists(reportDir);

// CLI reporter detection
const hasCliReporter = hasCliReporter();

// Parallel mode detection
const isParallel = isParallelMode();
```

## Framework Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           USER LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  Test Files (.spec.ts)                                                      │
│  └── todo.spec.ts        ──► TodoMVC application tests                     │
│                                                                             │
│  Page Objects                                                               │
│  ├── BasePage (Abstract)                                                    │
│  │   ├── constructor(driver)                                               │
│  │   └── $(locator) ───► SanElement                                        │
│  └── TodoPage extends BasePage                                              │
│      ├── title: SanElement                                                 │
│      ├── moreInfo: SanElement                                              │
│      └── open(): Promise<void>                                             │
└─────────────────┬───────────────────────────────────────────────────────────┘
                  │ uses
                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FRAMEWORK LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ConfigLoader (Singleton)                                                   │
│  ├── BrowserConfig {name, headless, noSandbox, args}                       │
│  ├── TimeoutConfig {default, element, pageLoad}                            │
│  ├── TestConfig {environment, retryCount, retryInterval, parallel}         │
│  ├── ReportingConfig {reporterTypes: ReporterType[], screenshotOnFailure} │
│  └── AppConfig {baseUrl, loginUrl, username, password}                     │
│                                                                             │
│  DriverManager                                                              │
│  ├── register(name, factory)                                                │
│  ├── getDriver(name?, options?)                                             │
│  └── getConfiguredDriver()                                                  │
│                                                                             │
│  ActionabilityChecker (Core auto-wait module)                               │
│  ├── Check Enum: VISIBLE, STABLE, ENABLED, EDITABLE                        │
│  ├── waitForActionability(element, driver, options)                        │
│  ├── delay(ms) - Async delay utility                                       │
│  └── getRemainingTimeout(startTime, totalTimeout) - Shared utility         │
│                                                                             │
│  SanElement (Unified wrapper)                                               │
│  ├── Basic: click(), type(), getText(), getAttribute(), isDisplayed()      │
│  ├── Checkboxes: check(), uncheck(), isChecked(), toggleCheckbox()         │
│  ├── Mouse: doubleClick(), rightClick(), hover(), dragAndDrop()            │
│  ├── Dropdowns: selectByValue/Text/Index(), getSelectedValue/Text()        │
│  ├── Scrolling: scrollIntoView()                                           │
│  ├── Waiting: waitUntilVisible/Clickable/Present()                         │
│  ├── Collections: count(), getTexts(), getElements(), clickAll()           │
│  └── Uses: ActionabilityChecker, ActionConfig, getRemainingTimeout         │
│                                                                             │
│  SanAssertion (Fluent API)                                                  │
│  ├── expectElement(element) ───► Fluent assertions                         │
│  ├── toBeVisible(), toHaveText(), toContainText()                          │
│  ├── toHaveAttribute(), toHaveClass(), toHaveValue()                       │
│  ├── Retry logic with configurable timeouts                                │
│  └── Uses: AssertionUtils.waitUntil() with getRemainingTimeout             │
│                                                                             │
│  Reporters (Multi-reporter support)                                         │
│  ├── CompositeReporter - Runs multiple reporters simultaneously            │
│  ├── AllureReporter - Rich interactive HTML reports                        │
│  ├── MochawesomeReporter - Clean modern HTML reports                       │
│  └── ReporterUtils - Shared screenshot, filename, directory utilities      │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Flows

#### Configuration Flow
```
.env file → ConfigLoader → FrameworkConfig → All framework components
```

#### Driver Creation Flow
```
ConfigLoader.getBrowserConfig() → DriverManager.getConfiguredDriver() → WebDriver
```

#### Element Interaction Flow
```
PageObject.$(locator) → SanElement.findElement() → 
  → ActionabilityChecker.waitForActionability() → 
  → WebDriver action → Result
```

#### Assertion Flow
```
expectElement(sanElement) → SanAssertion → 
  → AssertionUtils.waitUntil() → 
  → Retry with getRemainingTimeout() → Pass/Fail
```

#### Reporter Flow
```
Test execution → BaseTest hooks → 
  → CompositeReporter → [AllureReporter, MochawesomeReporter] → 
  → ReporterUtils (screenshots, filenames) → Reports generated
```

### Design Patterns

- **Singleton**: ConfigLoader for global configuration
- **Factory**: DriverManager for browser creation  
- **Decorator**: SanElement wraps WebElement with auto-wait
- **Fluent Interface**: SanAssertion for chainable assertions
- **Page Object Model**: BasePage and page classes for UI abstraction
- **Composite**: CompositeReporter runs multiple reporters
- **DRY Utilities**: Shared functions (getRemainingTimeout, ReporterUtils) eliminate duplication

## Configuration

### Environment Variables (.env)

```bash
# Browser Configuration
BROWSER=chrome                    # chrome | firefox
HEADLESS=false                   # true | false
NO_SANDBOX=false                 # true | false (for Docker/CI)

# Timeout Configuration (milliseconds)
DEFAULT_TIMEOUT=10000            # Default wait timeout
ELEMENT_TIMEOUT=15000            # Element-specific timeout
PAGE_LOAD_TIMEOUT=30000          # Page load timeout

# Test Configuration
ENVIRONMENT=qa                   # dev | qa | staging | production
RETRY_COUNT=3                    # Number of retries for flaky tests
RETRY_INTERVAL=1000              # Delay between retries (ms)
PARALLEL=false                   # Enable parallel execution
THREAD_COUNT=1                   # Number of parallel threads

# Logging
LOG_LEVEL=info                   # debug | info | warn | error
VERBOSE=false                    # Enable verbose logging

# Reporting - MULTIPLE REPORTERS SUPPORTED
REPORTER_TYPE=allure,mochawesome # Comma-separated: allure, mochawesome, none
SCREENSHOT_ON_FAILURE=true       # Capture screenshots on test failure

# Application URLs
BASE_URL=https://todomvc.com/examples/react/dist/
```

### Multi-Reporter Configuration

You can run multiple reporters simultaneously:

```bash
# Single reporter
REPORTER_TYPE=allure

# Multiple reporters (recommended)
REPORTER_TYPE=allure,mochawesome

# No reporter
REPORTER_TYPE=none
```

The framework will automatically create a `CompositeReporter` that runs all specified reporters.

## Test Reporting

### Multiple Reporters Support ⭐

The framework supports running **multiple reporters simultaneously** using the CompositeReporter pattern.

### Quick Start

```bash
# Run all tests with Allure + Mochawesome
npm run test:multi:clean

# View Allure report
npm run report:allure

# View Mochawesome report  
npm run report:mochawesome
```

### Available Reporters

#### 1. Allure Reporter
Rich, interactive HTML reports with test history, trends, and detailed execution timeline.

**Features:**
- 📊 Interactive dashboard with test trends
- 🕒 Detailed test steps and timeline
- 📸 Screenshots automatically attached on failures
- 🔍 Flaky test detection
- 📝 Test parameters and environment info

#### 2. Mochawesome Reporter
Clean, modern single-page HTML reports with embedded screenshots.

**Features:**
- 🎨 Clean, modern UI  
- 📸 Screenshots embedded directly
- ⚡ Fast loading (single HTML file)
- 🔍 Quick pass/fail filtering
- 📤 Easy to share (no server needed)

### npm Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run tests with configured reporter(s) |
| `npm run test:clean` | Clean reports and run tests |
| `npm run test:multi` | Run with Allure + Mochawesome |
| `npm run test:multi:clean` | Clean and run with both reporters |
| `npm run test:allure:clean` | Clean and run with Allure only |
| `npm run test:mochawesome:clean` | Clean and run with Mochawesome only |
| `npm run report:allure` | Generate and open Allure report |
| `npm run report:mochawesome` | Open Mochawesome HTML report |

### Report Locations

| Reporter | Results | Report |
|----------|---------|--------|
| **Allure** | `allure-results/` | `allure-report/` (after generation) |
| **Mochawesome** | `mochawesome-report/` | `mochawesome-report/mochawesome.html` |

## Page Object Model Example

```typescript
// src/pages/TodoPage.ts
import { BasePage } from './BasePage';
import { SanElement } from '../core/elements/SanElement';

export class TodoPage extends BasePage {
  // Element locators
  private get newTodoInput(): SanElement {
    return this.$({ using: 'css', value: '.new-todo' });
  }

  private get todoList(): SanElement {
    return this.$({ using: 'css', value: '.todo-list li' });
  }

  private get clearCompletedBtn(): SanElement {
    return this.$({ using: 'css', value: '.clear-completed' });
  }

  // Page actions
  async open(): Promise<void> {
    await this.driver.get('https://todomvc.com/examples/react/dist/');
  }

  async addTodo(text: string): Promise<void> {
    await this.newTodoInput.type(text);
    await this.newTodoInput.sendKeys('\n'); // Press Enter
  }

  async getTodoCount(): Promise<number> {
    return await this.todoList.count();
  }

  async getTodoTexts(): Promise<string[]> {
    return await this.todoList.getTexts();
  }

  async clearCompleted(): Promise<void> {
    await this.clearCompletedBtn.click();
  }
}
```

## Test Example

```typescript
// tests/todo.spec.ts
import { expect } from 'chai';
import { DriverManager } from '../src/driver/DriverManager';
import { TodoPage } from '../src/pages/TodoPage';
import { expectElement } from '../src/assertion';

describe('Todo App', () => {
  let driver: ThenableWebDriver;
  let todoPage: TodoPage;

  before(async () => {
    driver = await DriverManager.getConfiguredDriver();
    todoPage = new TodoPage(driver);
  });

  after(async () => {
    await driver?.quit();
  });

  it('should add new todo items', async () => {
    await todoPage.open();
    
    // Add todos
    await todoPage.addTodo('Buy groceries');
    await todoPage.addTodo('Walk the dog');
    
    // Verify count
    const count = await todoPage.getTodoCount();
    expect(count).to.equal(2);
    
    // Verify text with fluent assertion
    const texts = await todoPage.getTodoTexts();
    expect(texts).to.include('Buy groceries');
    expect(texts).to.include('Walk the dog');
  });
});
```

## Architecture Benefits

### Separation of Concerns
- **User Layer**: Tests and Page Objects focus on business logic
- **Framework Layer**: Infrastructure handles all technical complexity
- **Clean Separation**: User code never deals with waits, retries, or driver management

### Type Safety
- **TypeScript Throughout**: Full IntelliSense support
- **Enum-Based**: Check, ActionType, ReporterType prevent typos
- **Compile-Time Safety**: Catch errors before runtime

### Extensibility
- **Pluggable Reporters**: Add new reporters without changing tests
- **Custom Browsers**: Implement BrowserFactory for new browser types
- **Custom Assertions**: Extend SanAssertion for domain-specific checks

### Maintainability
- **DRY Principles**: Shared utilities (getRemainingTimeout, ReporterUtils)
- **Single Responsibility**: Each module has one clear purpose
- **32-78% Line Reduction**: Removed duplication and verbose comments

### Reliability
- **Auto-Wait**: All actions wait for actionability automatically
- **Auto-Retry**: Assertions retry automatically with configurable timeouts
- **Flaky Test Reduction**: Smart polling and stability checks

## Advanced Topics

### Force Option - Bypass Actionability Checks

Sometimes you need to interact with elements that don't pass standard checks:

```typescript
// Click hidden element
await element.click({ force: true });

// Type into readonly field
await input.type('text', { force: true });

// Clear disabled field
await field.clear({ force: true });
```

### Custom Timeouts

Override default timeouts per action:

```typescript
// Wait up to 30 seconds for slow element
await slowElement.click({ timeout: 30000 });

// Quick timeout for expected fast element
await fastElement.click({ timeout: 2000 });
```

### Working with Collections

```typescript
// Get all matching elements
const items = await this.$({ using: 'css', value: '.item' });

// Count elements
const count = await items.count();

// Get all texts
const texts = await items.getTexts();

// Get individual elements
const elements = await items.getElements();
for (const element of elements) {
  await element.click();
}

// Click all at once
await items.clickAll();
```

### Checkbox Operations

```typescript
// Ensure checkbox is checked (idempotent)
await checkbox.check();

// Ensure checkbox is unchecked (idempotent)
await checkbox.uncheck();

// Toggle state
await checkbox.toggleCheckbox();

// Check current state
const isChecked = await checkbox.isChecked();
```

## Troubleshooting

### Element Not Found
```
TimeoutError: Timeout finding element with locator {"using":"css","value":".missing"}
```
**Solution**: Verify locator is correct, increase timeout, or check if element exists in DOM

### Element Not Actionable
```
Error: Timeout waiting for element to be actionable. Failed checks: Element is not visible
```
**Solution**: Check if element is hidden, overlapped, or still animating. Use `{ force: true }` if intentional.

### Tests Timing Out
**Solution**: Increase timeouts in `.env`:
```bash
DEFAULT_TIMEOUT=20000
ELEMENT_TIMEOUT=30000
```

### Reports Not Generating
**Solution**: Check REPORTER_TYPE in `.env` and ensure reporter dependencies are installed:
```bash
npm install --save-dev allure-commandline allure-mocha mochawesome
```

## Contributing

We welcome contributions! Areas for improvement:
- Additional browser support (Edge, Safari)
- More assertion methods
- Performance optimizations
- Additional reporters
- Documentation improvements

## License

MIT

---

**Happy Testing! 🚀**
