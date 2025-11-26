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
│  │  - teardown()     │          │  - waitForElement()           │   │
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
│  │  │  - toHaveURLContaining(url, timeout)                │   │   │
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
│  │  │  - click(timeout) → auto-wait + click              │    │  │
│  │  │  - fill(text, timeout) → auto-wait + fill          │    │  │
│  │  │  - sendKeys(text, timeout) → auto-wait + type      │    │  │
│  │  │  - clear(timeout) → auto-wait + clear              │    │  │
│  │  │  - getText(timeout) → auto-wait + get text         │    │  │
│  │  │  - getAttribute(attr, timeout)                      │    │  │
│  │  │  - internal waitForElement() logic                  │    │  │
│  │  │  - retry mechanism on stale elements               │    │  │
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

**Responsibility**: All element interactions with automatic waiting

#### Classes:

```
SanElement
├── constructor(locator, driver, timeout)
├── find(locator): WebElement (internal)
├── waitForElement(timeout): void
├── click(timeout?: number): Promise<void>
├── fill(text, timeout?: number): Promise<void>
├── sendKeys(text, timeout?: number): Promise<void>
├── clear(timeout?: number): Promise<void>
├── getText(timeout?: number): Promise<string>
├── getAttribute(attr, timeout?: number): Promise<string>
├── isVisible(timeout?: number): Promise<boolean>
├── isClickable(timeout?: number): Promise<boolean>
├── waitForVisibility(timeout): void
├── waitForClickability(timeout): void
└── retry(fn, timeout): Result (internal)

ElementFinder
├── findElement(locator): WebElement
├── findElements(locator): WebElement[]
└── withTimeout(ms): ElementFinder
```

**Auto-Wait Mechanism**:
```
await element.click()
  ↓
waitForClickability(timeout)
  ↓
Retry loop:
  - Try to find element
  - Check if visible
  - Check if clickable
  - If fails, retry until timeout
  ↓
Perform click action
  ↓
Handle StaleElementReferenceException (retry)
```

**Usage Example**:
```typescript
// Auto-waits before every interaction
await page.loginButton.click();      // Auto-waits up to 10s
await page.usernameInput.fill('demo'); // Auto-waits for visibility
const text = await page.title.getText(); // Auto-waits then reads

// With custom timeout
await page.submitButton.click(20000); // 20 second timeout
```

---

### Layer 3: Assertion with Auto-Retry

**Responsibility**: All assertions with automatic retry mechanism

#### Classes:

```
SanAssertion
├── constructor(subject, timeout, retryCount)
├── toBeVisible(timeout?: number): Promise<void>
├── toBeHidden(timeout?: number): Promise<void>
├── toHaveTitle(expected, timeout?: number): Promise<void>
├── toHaveURLContaining(url, timeout?: number): Promise<void>
├── toHaveText(text, timeout?: number): Promise<void>
├── toContainText(text, timeout?: number): Promise<void>
├── toHaveAttribute(attr, value, timeout?: number): Promise<void>
├── toHaveCount(count, timeout?: number): Promise<void>
├── toHaveClass(className, timeout?: number): Promise<void>
├── toBeEnabled(timeout?: number): Promise<void>
├── toBeDisabled(timeout?: number): Promise<void>
├── toBeChecked(timeout?: number): Promise<void>
└── retry(assertion, timeout): Result (internal)

AssertionError (Custom Exception)
├── message: string
├── expected: any
├── actual: any
└── retries: number
```

**Auto-Retry Mechanism**:
```
await expect(page).toHaveTitle('Dashboard')
  ↓
Retry loop (default: 5 retries):
  - Get current title
  - Compare with expected
  - If mismatch and retries left, wait 500ms and retry
  - If mismatch and no retries, throw AssertionError
  ↓
Assertion passes
```

**Usage Example**:
```typescript
// Auto-retries assertion up to 5 times
await expect(page).toHaveTitle('Dashboard');
await expect(page.loginButton).toBeVisible();
await expect(page).toHaveURLContaining('/dashboard');

// Custom timeout
await expect(page.message).toHaveText('Success', 30000);
```

---

### Layer 4: User Layer - Page Objects & Tests

**Responsibility**: Test logic using framework abstraction

#### Classes:

```
BasePage<T extends WebDriver>
├── protected driver: WebDriver
├── protected timeout: number
├── constructor(driver, timeout)
├── protected findElement(locator): SanElement
├── protected findElements(locator): SanElement[]
├── protected goto(url): Promise<void>
├── protected waitFor(condition, timeout): void
├── getTitle(): Promise<string>
├── getCurrentUrl(): Promise<string>
└── getPageSource(): Promise<string>

BaseTest<PageType extends BasePage>
├── protected driver: WebDriver
├── protected page: PageType
├── protected before(): Promise<void>
├── protected after(): Promise<void>
├── beforeEach(): Promise<void>
├── afterEach(): Promise<void>
├── expect(subject): SanAssertion
├── delay(ms): Promise<void>
└── logger: Logger
```

**Example Page Object**:
```typescript
// Extends BasePage (Framework Layer)
class LoginPage extends BasePage {
  // Locators
  get usernameInput() {
    return this.findElement({ id: 'username' }); // Returns SanElement
  }
  
  get passwordInput() {
    return this.findElement({ id: 'password' });
  }
  
  get loginButton() {
    return this.findElement({ css: 'button[type="submit"]' });
  }
  
  // Business logic methods
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);     // Auto-wait
    await this.passwordInput.fill(password);     // Auto-wait
    await this.loginButton.click();              // Auto-wait
    await this.waitFor(() => this.getCurrentUrl().includes('/dashboard'), 10000);
  }
}
```

**Example Test Case**:
```typescript
// Extends BaseTest (Framework Layer)
describe('Login Tests', () => {
  class LoginTest extends BaseTest<LoginPage> {
    before() {
      this.page = new LoginPage(this.driver);
    }
  }

  it('should login successfully', async () => {
    // Uses BasePage & SanElement with auto-wait
    await loginPage.login('demo', 'password');
    
    // Uses SanAssertion with auto-retry
    await expect(loginPage).toHaveURLContaining('/dashboard');
    await expect(loginPage.welcomeMessage).toBeVisible();
  });
});
```

---

## Data Flow Example: Complete Login Scenario

```
User writes test code:
  await page.usernameInput.fill('demo')
    ↓
SanElement.fill() is invoked:
  - waitForElement(timeout)           [Layer 2: Element]
  - find element with locator
  - wait for visibility
  - perform fill action
  - handle stale element retry
    ↓
User writes assertion:
  await expect(page).toHaveTitle('Dashboard')
    ↓
SanAssertion.toHaveTitle() is invoked:
  - getTitle()
  - compare with expected
  - if mismatch, retry up to 5 times   [Layer 3: Assertion]
  - throw error if still fails
    ↓
All underlying config managed by:
  - DriverManager                      [Layer 1: Driver]
  - ConfigLoader for timeouts
  - BrowserRegistry for browser type
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
│ await page.usernameInput.fill('demo')   │
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

```
Example: Add "Safari" Browser Support

1. Layer 1 - Create SafariFactory
   class SafariFactory extends BaseBrowserFactory {
     createDriver(): WebDriver { ... }
     configureOptions(): SafariOptions { ... }
   }

2. Layer 1 - Register in BrowserRegistry
   registry.register('safari', new SafariFactory())

3. Layer 1 - Use in ConfigLoader
   BROWSER=safari in .env

4. Layers 2, 3, 4 - Automatically work!
   No changes needed - everything uses DriverManager
```

---

## Summary

This 4-layer architecture provides:
- ✅ **Clean Separation** - Each layer has specific responsibility
- ✅ **Testability** - Easy to mock and test each layer
- ✅ **Maintainability** - Changes isolated to one layer
- ✅ **Extensibility** - Add new browsers/features without touching user code
- ✅ **User-Friendly** - Tests are simple and focused on business logic
- ✅ **Production-Ready** - Battle-tested patterns and practices
