# Architecture & Class Diagram

## Overview

SaniumTS follows a **4-layer architecture** with clean separation of concerns:

1. **Driver & Browser Factory Layer** - Configuration and WebDriver management
2. **Core Element Layer** - Auto-wait element interactions
3. **Assertion Layer** - Auto-retry assertions
4. **User Layer** - Page Objects and Test Cases

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER LAYER (Your Code)                      │
│  ┌──────────────────────┐        ┌──────────────────────────────┐   │
│  │   Test Case (*.spec)  │        │   Page Objects (Page.ts)    │   │
│  │  - describe/it blocks │        │  - Locators                 │   │
│  │  - Setup/Teardown     │        │  - Helper Methods           │   │
│  │  - Assertions         │        │  - Business Logic           │   │
│  └──────────────────────┘        └──────────────────────────────┘   │
│           △                                 △                        │
│           │                                 │                        │
│    extends BaseTest<T>          extends BasePage                     │
│           │                                 │                        │
└───────────┼─────────────────────────────────┼────────────────────────┘
            │                                 │
┌───────────┼─────────────────────────────────┼────────────────────────┐
│           │    FRAMEWORK LAYER              │                        │
│  ┌────────▼──────────┐          ┌──────────▼────────────────────┐   │
│  │   BaseTest<T>     │          │      BasePage                 │   │
│  │  - driver         │          │  - driver: WebDriver          │   │
│  │  - page: T        │          │  - timeout settings           │   │
│  │  - setup()        │          │  - findElement(locator)       │   │
│  │  - teardown()     │          │  - open(url)                  │   │
│  │  - expect()       │          │  - isVisible(), isClickable() │   │
│  └───────────────────┘          └──────────────────────────────┘   │
│           △                                 △                        │
│           │                                 │                        │
│           └─────────────────┬───────────────┘                        │
│                             │                                        │
│                   Uses SanElement & SanAssertion                      │
│                             │                                        │
│  ┌──────────────────────────┴──────────────────────────────────┐   │
│  │                    ASSERTION LAYER                          │   │
│  │  ┌─────────────────────────────────────────────────────┐   │   │
│  │  │           SanAssertion (with Auto-Retry)            │   │   │
│  │  │  - toBeVisible(timeout, retryCount)                 │   │   │
│  │  │  - toHaveTitle(expected, timeout)                   │   │   │
│  │  │  - toHaveURL(expectedUrl: string | RegExp)         │   │   │
│  │  │  - toHaveText(text, timeout)                        │   │   │
│  │  │  - expectation logic with retry                     │   │   │
│  │  │  - automatic retry on failure                       │   │   │
│  │  └─────────────────────────────────────────────────────┘   │   │
│  └──────────────────────────────────────────────────────────────┘   │
│           △                                                          │
│           │                                                          │
│           │ Uses                                                     │
│           │                                                          │
│  ┌────────┴──────────────────────────────────────────────────────┐  │
│  │                    ELEMENT LAYER                              │  │
│  │  ┌──────────────────────────────────────────────────────┐    │  │
│  │  │        SanElement (with Auto-Wait)                  │    │  │
│  │  │  - click(options?) → auto-wait + click              │    │  │
│  │  │  - type(text, options?) → auto-wait + type          │    │  │
│  │  │  - getText(options?) → auto-wait + get text         │    │  │
│  │  │  - isDisplayed(options?) → check visibility         │    │  │
│  │  │  - findChild(locator) → get child element           │    │  │
│  │  │  - internal recovery from stale elements            │    │  │
│  │  │  - retry mechanism on stale elements                │    │  │
│  │  └──────────────────────────────────────────────────────┘    │  │
│  └────────┬──────────────────────────────────────────────────────┘  │
│           │                                                          │
│           │ Wraps                                                    │
│           │                                                          │
└───────────┼──────────────────────────────────────────────────────────┘
            │
┌───────────▼──────────────────────────────────────────────────────────┐
│                 DRIVER & BROWSER FACTORY LAYER                        │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │              DriverManager                                  │    │
│  │  - createDriver(browserType): WebDriver                     │    │
│  │  - quitDriver()                                             │    │
│  │  - singleton pattern                                        │    │
│  │  - config integration                                       │    │
│  └────────────┬────────────────────────────────────────────────┘    │
│               │                                                      │
│               │ Uses BrowserRegistry & BrowserFactory               │
│               │                                                      │
│  ┌────────────▼────────────────────────────────────────────────┐    │
│  │              BrowserRegistry                                │    │
│  │  - register(browserType, factory)                           │    │
│  │  - getFactory(browserType): BrowserFactory                  │    │
│  │  - singleton pattern                                        │    │
│  └────────────┬────────────────────────────────────────────────┘    │
│               │                                                      │
│      ┌────────┴──────────────────┐                                   │
│      │                           │                                   │
│  ┌───▼─────────────────────┐ ┌──▼──────────────────────────┐        │
│  │ BaseBrowserFactory      │ │ BrowserFactory (Interface)  │        │
│  │ (Abstract Base)         │ │                             │        │
│  │  - createDriver()       │ │  + createDriver()           │        │
│  │  - configureOptions()   │ │                             │        │
│  │  - setHeadless()        │ │                             │        │
│  │  - addArguments()       │ │                             │        │
│  └─────────────────────────┘ └──▲──────────────────────────┘        │
│                                  │                                   │
│                 ┌────────────────┼────────────────┐                  │
│                 │                │                │                  │
│          ┌──────▼────────┐ ┌─────▼────────┐ ┌───▼──────────┐        │
│          │ ChromeFactory │ │FirefoxFactory│ │...Factories  │        │
│          │               │ │              │ │              │        │
│          │ - createDriver│ │- createDriver│ │- createDriver│        │
│          │ - configOpts()│ │- configOpts()│ │- configOpts()│        │
│          └───────────────┘ └──────────────┘ └──────────────┘        │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────┐        │
│  │           ConfigLoader                                   │        │
│  │  - loadConfig(): Config                                  │        │
│  │  - getEnv(key, defaultValue): string                     │        │
│  │  - getBrowserType(): 'chrome' | 'firefox'                │        │
│  │  - getHeadless(): boolean                                │        │
│  │  - getTimeouts(): TimeoutConfig                          │        │
│  └──────────────────────────────────────────────────────────┘        │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
         ↓
    Selenium WebDriver
```

---

## Layer-by-Layer Details

### Layer 1: Driver & Browser Factory Configuration

**Responsibility**: WebDriver lifecycle and browser configuration

#### Classes:

```
DriverManager
├── createDriver(browserType): WebDriver
├── quitDriver(): void
├── getDriver(): WebDriver
└── isCIEnv(): boolean

BrowserRegistry (Singleton)
├── register(type, factory): void
├── getFactory(type): BrowserFactory
└── instance: BrowserRegistry

BrowserFactory (Interface)
├── createDriver(): WebDriver
└── + implemented by: ChromeFactory, FirefoxFactory, ...

BaseBrowserFactory (Abstract)
├── createDriver(): WebDriver (abstract)
├── configureOptions(): DriverOptions (abstract)
├── setHeadless(value: boolean): this
├── addArguments(args: string[]): this
└── addPreferences(prefs: object): this

ChromeFactory extends BaseBrowserFactory
├── createDriver(): WebDriver
└── configureOptions(): ChromeOptions

FirefoxFactory extends BaseBrowserFactory
├── createDriver(): WebDriver
└── configureOptions(): FirefoxOptions

ConfigLoader (Singleton)
├── loadConfig(): Config
├── getEnv(key, default): string
├── getBrowserType(): string
├── getHeadless(): boolean
├── getTimeouts(): TimeoutConfig
└── getBaseURL(): string
```

**Interaction Flow**:
```
DriverManager.createDriver('chrome')
  ↓
BrowserRegistry.getFactory('chrome')
  ↓
ChromeFactory.createDriver()
  ↓
ConfigLoader.getHeadless(), getTimeouts()
  ↓
Returns configured WebDriver instance
```

---

### Layer 2: Element Interaction with Auto-Wait

**Responsibility**: All element interactions with automatic waiting for actionability

#### Classes:

```
SanElement
├── constructor(locator, parentElement?: SanElement)
├── factory methods:
│   ├── static css(selector): SanElement
│   ├── static xpath(expression): SanElement
│   ├── static id(elementId): SanElement
│   └── static className(name): SanElement
├── click(options?: ActionOptions): Promise<void>
├── type(text, options?: ActionOptions): Promise<void>
├── getText(options?: ReadOptions): Promise<string>
├── isDisplayed(options?: ReadOptions): Promise<boolean>
├── findChild(locator: Locator): SanElement
└── internal:
    ├── findElement(actionType, options): WebElement (internal)
    ├── findVisibleElement(options): WebElement (internal)
    └── executeWithRecovery<T>(actionType, action, options): T (internal)

ActionOptions
├── timeout?: number
├── force?: boolean
└── scroll?: boolean

ReadOptions
└── timeout?: number

Locator
├── using: 'css' | 'xpath' | 'id' | 'name' | 'class'
└── value: string
```

**Auto-Wait Mechanism**:
```
await element.click()
  ↓
executeWithRecovery (retry loop on stale element):
  ├── Find element with actionability check
  ├── Check element is STABLE, ENABLED, etc (per ActionType)
  ├── Perform click action
  └── If StaleElementReferenceError → retry up to MAX_STALE_RETRIES times
```

**Usage Example**:
```typescript
// Auto-waits for actionability before interaction
const usernameInput = this.css('input[name="username"]');
await usernameInput.type('demo');              // Auto-waits for editable

const submitButton = this.id('submit-btn');
await submitButton.click();                    // Auto-waits for clickable

const message = this.css('.success-message');
const text = await message.getText();          // Auto-waits for visible then reads
const visible = await message.isDisplayed();   // Check visibility

// Using factory methods for clean syntax
const element = SanElement.css('.my-element');
await element.type('text', { timeout: 15000 }); // Custom timeout
```

---

### Layer 3: Assertion with Auto-Retry

**Responsibility**: All assertions with automatic retry mechanism for flaky tests

#### Classes:

```
SanElementAssertion (for SanElement assertions)
├── constructor(element: SanElement, timeout?: number)
├── toBeVisible(): Promise<void>
├── toHaveText(expectedText: string): Promise<void>
└── internal:
    └── waitUntil(condition, message, timeout): Promise<void>

SanPageAssertion (for page/driver assertions)
├── constructor(driver: WebDriver, timeout?: number)
├── toHaveTitle(expectedTitle: string): Promise<void>
├── toHaveURL(expectedUrl: string | RegExp): Promise<void>
└── internal:
    └── waitUntil(condition, message, timeout): Promise<void>

expect() Function (Unified API)
├── expect(element: SanElement, timeout?): SanElementAssertion
├── expect(driver: WebDriver, timeout?): SanPageAssertion
└── expect(page: BasePage, timeout?): SanPageAssertion (auto-extracts driver)
```

**Auto-Retry Mechanism**:
```
await expect(element).toHaveText('Welcome')
  ↓
Retry loop (default: ~4s timeout):
  - Get current text
  - Compare with expected (trimmed)
  - If mismatch and time left, wait and retry
  - If mismatch and timeout reached, throw AssertionError
  ↓
Assertion passes
```

**Usage Example**:
```typescript
import { expect } from '@assertion/index';

// Auto-retries element assertions
await expect(page.welcomeMessage).toBeVisible();
await expect(page.greeting).toHaveText('Hello, User');

// Auto-retries page assertions
await expect(page).toHaveTitle('Dashboard');
// String match (exact)
await expect(page).toHaveURL('https://example.com/dashboard');
// RegExp match (pattern matching)
await expect(page).toHaveURL(/dashboard/i);  // RegExp support

// Works with any object that has a driver property
await expect(somePageObject).toHaveTitle('Home');
```

---

### Layer 4: User Layer - Page Objects & Tests

**Responsibility**: Test logic using framework abstraction

#### Classes:

```
BasePage<T extends WebDriver>
├── protected driver: WebDriver
├── locator helper methods (protected):
│   ├── css(selector): SanElement
│   ├── id(elementId): SanElement
│   ├── xpath(expression): SanElement
│   └── className(name): SanElement
├── page actions:
│   └── open(url): Promise<void>
└── page assertions (delegate to SanPageAssertion):
    ├── toHaveTitle(expectedTitle): Promise<void>
    └── toHaveURL(expectedUrl): Promise<void>

BaseTest<PageType extends BasePage>
├── protected driver: WebDriver
├── protected page: PageType
├── setupDriver(): Promise<void>
├── teardownDriver(): Promise<void>
├── abstract createPage(): PageType
└── (subclass implements createPage())
```

**Example Page Object** (Field Initialization Pattern):
```typescript
// Extends BasePage (Framework Layer)
// Important: Use field initialization, NOT getters - matches actual framework pattern
import { BasePage } from './BasePage';
import SanElement from '@core/elements/SanElement';

class LoginPage extends BasePage {
  // Locators - Field initialization using BasePage helpers
  // This is the actual pattern used in framework (see TodoPage.ts)
  readonly usernameInput: SanElement = this.id('username');
  readonly passwordInput: SanElement = this.id('password');
  readonly loginButton: SanElement = this.css('button[type="submit"]');

  // Business logic methods
  async login(username: string, password: string): Promise<void> {
    // Use SanElement API: type(), click(), getText(), isDisplayed(), etc.
    await this.usernameInput.type(username);      // Auto-waits for editable
    await this.passwordInput.type(password);
    await this.loginButton.click();               // Auto-waits for clickable
  }
  
  // Child element pattern - using findChild()
  getTodoItem(index: number): SanElement {
    return this.css('.todo-list').findChild({ 
      using: 'css', 
      value: `li:nth-child(${index + 1})` 
    });
  }
}
```

**Example Test Case**:
```typescript
// Example using BaseTest - matches actual todo.spec.ts pattern
import { describe, it, before, after } from 'mocha';
import { expect } from '@assertion/index';
import { BaseTest } from '@tests/BaseTest';
import { LoginPage } from '@pages/LoginPage';

class LoginTest extends BaseTest<LoginPage> {
  protected createPage(): LoginPage {
    return new LoginPage();
  }
}

describe('Login Tests', () => {
  const test = new LoginTest();

  before(async () => {
    // BaseTest handles driver initialization and page creation
    await test.setupDriver();
  });

  after(async () => {
    // BaseTest handles driver cleanup
    await test.teardownDriver();
  });

  it('should login successfully', async () => {
    // Navigate using page object
    await test.page.open('http://localhost:5000/login');

    // Business flow using Page Object methods
    await test.page.login('demo', 'password');

    // Use unified expect() for page-level assertions (auto-retry)
    await expect(test.page).toHaveURL(/dashboard/);
    
    // Element-level assertions
    await expect(test.page.usernameInput).toBeVisible();
  });
});
```

---

## Data Flow Example: Complete Login Scenario

```
User writes test code:
  await page.usernameInput.type('demo')
    ↓
SanElement.type() is invoked:
  - executeWithRecovery() for stale element handling [Layer 2: Element]
  - findElement() with actionability check
    - Uses ActionabilityChecker for ActionType.TYPE
    - Waits for element to be editable
  - Performs underlying type action via WebElement.sendKeys()
  - On StaleElementReferenceError → retry up to MAX_STALE_RETRIES times
    ↓
User writes assertion:
  await expect(page).toHaveTitle('Dashboard')
    ↓
SanPageAssertion.toHaveTitle() is invoked:
  - waitUntil() helper with retry loop [Layer 3: Assertion]
  - Polls getTitle() until matches expected or timeout
  - Throws AssertionError if condition never met
    ↓
All underlying config managed by:
  - DriverManager (singleton)           [Layer 1: Driver]
  - ConfigLoader for timeouts and browser config
  - BrowserRegistry for factory lookup
```

---

## Dependency Injection Pattern

```
┌─────────────────────────────────────────┐
│ Mocha Test Runner                       │
└────────────┬────────────────────────────┘
             │
             ↓ Setup
┌─────────────────────────────────────────┐
│ BaseTest Setup                          │
│ - ConfigLoader.load()                   │
│ - DriverManager.createDriver(config)    │
│ - page = new LoginPage(driver)          │
└────────────┬────────────────────────────┘
             │
             ↓ Inject dependencies
┌─────────────────────────────────────────┐
│ LoginPage                               │
│ - driver: passed in constructor         │
│ - findElement: uses driver              │
│ - returns SanElement wrapped elements   │
└────────────┬────────────────────────────┘
             │
             ↓ Method call
┌─────────────────────────────────────────┐
│ await page.usernameInput.type('demo')   │
│ - SanElement has driver reference       │
│ - Uses DriverManager for config         │
│ - Applies auto-wait logic               │
└────────────┬────────────────────────────┘
             │
             ↓ Assertion
┌─────────────────────────────────────────┐
│ await expect(page).toHaveTitle(...)     │
│ - SanAssertion has driver reference     │
│ - Uses configured timeouts              │
│ - Applies auto-retry logic              │
└─────────────────────────────────────────┘
```

---

## Key Design Patterns

### 1. **Factory Pattern**
- `BrowserRegistry` creates appropriate browser factories
- Each browser type has specific factory (Chrome, Firefox)

### 2. **Singleton Pattern**
- `DriverManager` - single WebDriver instance per test
- `BrowserRegistry` - single registry for all browser types
- `ConfigLoader` - single configuration instance

### 3. **Wrapper Pattern**
- `SanElement` wraps WebElement with auto-wait
- `SanAssertion` wraps assertions with auto-retry

### 4. **Template Method Pattern**
- `BaseBrowserFactory` defines template for browser setup
- `ChromeFactory`, `FirefoxFactory` implement specific steps

### 5. **Strategy Pattern**
- Different browser factories implement same interface
- Easily swap between Chrome and Firefox

---

## Benefits of This Architecture

| Layer | Benefit |
|-------|---------|
| **Driver & Factory** | Decoupled browser management, easy to add new browsers |
| **Element** | Auto-wait reduces flakiness, cleaner test code |
| **Assertion** | Auto-retry handles async race conditions, more reliable |
| **User** | Simple API, focus on business logic, less boilerplate |

---

## Testing a Feature Across All Layers

```typescript
// Example: Add "Safari" Browser Support

// 1. Layer 1 - Create SafariFactory
class SafariFactory extends BaseBrowserFactory {
  createDriver(): WebDriver { ... }
  configureOptions(): SafariOptions { ... }
}

// 2. Layer 1 - Register in BrowserRegistry
registry.register('safari', new SafariFactory())

// 3. Layer 1 - Use in ConfigLoader
// BROWSER=safari in .env

// 4. Layers 2, 3, 4 - Automatically work!
// No changes needed - everything uses DriverManager
```

---

## Summary

This 4-layer architecture provides:
- **Clean Separation** - Each layer has specific responsibility
- **Testability** - Easy to mock and test each layer
- **Maintainability** - Changes isolated to one layer
- **Extensibility** - Add new browsers/features without touching user code
- **User-Friendly** - Tests are simple and focused on business logic
- **Production-Ready** - Battle-tested patterns and practices
