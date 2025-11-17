# SaniumTS Selenium Framework

A modern TypeScript Selenium framework with type-safe configuration and flexible driver management.

## Installation

```bash
npm install
npm run build
```

## Configuration

Create a `.env` file:

```properties
# Browser Configuration
BROWSER=chrome
HEADLESS=false
NO_SANDBOX=true

# Application URLs
BASE_URL=https://demo.playwright.dev/

# Timeouts (in milliseconds)
DEFAULT_TIMEOUT=5000
ELEMENT_TIMEOUT=10000
PAGE_LOAD_TIMEOUT=30000
```

## Project Structure

```
src/
├── config/
│   └── ConfigLoader.ts       # Configuration management
├── core/
│   └── elements/
│       ├── SanElement.ts     # Smart element wrapper with auto-wait
│       ├── ActionConfig.ts   # Action requirement mapping
│       ├── ActionabilityChecker.ts  # Element readiness validation
│       └── ElementFinder.ts  # Element location and preparation
├── driver/
│   └── DriverManager.ts      # WebDriver factory
├── types/
│   ├── Enums.ts              # Type-safe enums
│   └── ConfigTypes.ts        # Configuration interfaces
└── utils/
    └── Logger.ts             # Winston-based logging
```

## Features

- ✅ TypeScript with full type safety
- ✅ Multi-browser support (Chrome, Firefox)
- ✅ Environment-based configuration
- ✅ Extensible driver factory pattern
- ✅ Winston-based logging with file output
- ✅ **SanElement Framework** - Smart element wrapper with auto-wait
- ✅ **Actionability Checking** - Ensures elements are ready before interaction
- ✅ **Flexible Options** - Configurable timeouts, scrolling, and force options
- ✅ **Comprehensive Element API** - Click, type, check, hover, and more

## SanElement Framework

SanElement is the core of this framework - a smart element wrapper that provides auto-wait functionality and comprehensive interaction methods.

### Basic Usage

```typescript
import SanElement from '../src/core/elements/SanElement';

// Create an element with CSS selector
const todoInput = new SanElement({ using: 'css', value: '.new-todo' });

// All interactions automatically wait for element to be ready
await todoInput.type('My new todo');
await todoInput.click();

// Reading operations also auto-wait
const text = await todoInput.getText();
const isVisible = await todoInput.isDisplayed();
```

### Locator Types

```typescript
// CSS Selector
const element1 = new SanElement({ using: 'css', value: '.my-class' });

// XPath
const element2 = new SanElement({ using: 'xpath', value: '//button[@id="submit"]' });

// ID
const element3 = new SanElement({ using: 'id', value: 'username' });

// Name
const element4 = new SanElement({ using: 'name', value: 'email' });

// Class
const element5 = new SanElement({ using: 'class', value: 'btn-primary' });
```

### Action Options

All interaction methods support optional `ActionOptions`:

```typescript
interface ActionOptions {
  timeout?: number;    // Override default timeout
  force?: boolean;     // Skip actionability checks
  scroll?: boolean;    // Scroll element into view
}

// Examples
await element.click({ timeout: 5000 });           // Custom timeout
await element.type('text', { force: true });      // Skip readiness checks
await element.click({ scroll: true });            // Auto-scroll before click
```

### Read Options

Read operations support `ReadOptions`:

```typescript
interface ReadOptions {
  timeout?: number;    // Override default timeout
}

// Example
const text = await element.getText({ timeout: 3000 });
```

### Interaction Methods

#### Basic Interactions
```typescript
// Click with auto-wait for clickability
await element.click();
await element.click({ timeout: 5000, scroll: true });

// Type text with auto-wait for editability
await element.type('Hello World');

// Send special keys
import { Key } from 'selenium-webdriver';
await element.sendKeys(Key.RETURN);
await element.sendKeys(Key.chord(Key.CONTROL, 'a'));

// Clear field content
await element.clear();
```

#### Checkbox/Radio Operations
```typescript
// Check if not already checked
await checkbox.check();

// Uncheck if currently checked
await checkbox.uncheck();

// Get checked state
const isChecked = await checkbox.isChecked();
```

#### Mouse Operations
```typescript
// Hover over element
await element.hover();

// Manual scrolling
await element.scrollIntoView();
```

#### Reading Element State
```typescript
// Get text content
const text = await element.getText();

// Get attribute value
const id = await element.getAttribute('id');
const value = await element.getAttribute('value');

// Check visibility
const isVisible = await element.isDisplayed();
```

### Actionability Checking

SanElement automatically ensures elements are ready before interaction:

- **Visible**: Element is displayed and has non-zero size
- **Stable**: Element position is not changing
- **Enabled**: Element is not disabled or aria-disabled
- **Editable**: Element accepts text input (for type operations)

```typescript
// These all wait for appropriate conditions automatically:
await element.click();    // Waits for: visible, stable, enabled
await element.type('hi'); // Waits for: visible, stable, enabled, editable
await element.hover();    // Waits for: visible, stable
```

### Custom Timeouts

```typescript
// Set default timeout for an element
const slowElement = new SanElement(
  { using: 'css', value: '.slow-loader' }, 
  15000  // 15 second default timeout
);

// Or use per-operation timeouts
await element.click({ timeout: 2000 });
```

### Parent-Child Elements

```typescript
const parentElement = new SanElement({ using: 'css', value: '.parent' });

// Create child element scoped to parent
const childElement = new SanElement(
  { using: 'css', value: '.child' },
  undefined,
  parentElement  // Parent scope
);

// Child will be found within parent
await childElement.click();
```

### Error Handling

SanElement provides detailed error messages:

```typescript
try {
  await element.click({ timeout: 5000 });
} catch (error) {
  // Error will include details like:
  // "Element not ready for click within 5000ms. Failed: enabled (Element is disabled)"
  console.error(error.message);
}
```

## Running Tests

```bash
# Clean test output (recommended for CI)
npm test

# Development mode with detailed logs
npm run test:dev
```

## Quick Start Example

Here's a complete example using SanElement:

```typescript
import { describe, it, before, after } from 'mocha';
import driverManager from '../src/driver/DriverManager';
import { configLoader } from '../src/config/ConfigLoader';
import SanElement from '../src/core/elements/SanElement';

describe('TodoMVC Test', () => {
  before(async () => {
    await driverManager.createDriver();
  });

  after(async () => {
    await driverManager.quitDriver();
  });

  it('should add a todo item', async () => {
    const driver = driverManager.getDriver();
    await driver.get('https://demo.playwright.dev/todomvc/');

    // Create elements - no need for explicit waits!
    const todoInput = new SanElement({ using: 'css', value: '.new-todo' });
    const firstTodo = new SanElement({ using: 'css', value: '.todo-list li:first-child label' });

    // Type and submit - auto-waits for element to be ready
    await todoInput.type('Buy groceries');
    
    const { Key } = await import('selenium-webdriver');
    await todoInput.sendKeys(Key.RETURN);

    // Verify - auto-waits for element to appear and be readable
    const todoText = await firstTodo.getText();
    console.log(`Added todo: ${todoText}`);
  });
});
```