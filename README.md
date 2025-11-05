# SaniumTS Selenium Framework

A small TypeScript Selenium framework that demonstrates 4 layers requested:
- SanElement (custom web element wrapper with auto-wait)
- Assertion helpers with retry
- DriverManager (register additional browsers easily)
- Test layer using Page Object Model

## Framework Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           👤 USER LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  Test Files (.spec.ts)                                                      │
│  └── todo.spec.ts        ──► Todo application tests                        │
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
│                      🔧 FRAMEWORK LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ConfigLoader (Singleton)                                                   │
│  ├── BrowserConfig {name, headless, noSandbox, args}                       │
│  ├── TimeoutConfig {default, element, pageLoad}                            │
│  ├── TestConfig {environment, retryCount, retryInterval, parallel}         │
│  └── AppConfig {baseUrl, loginUrl, productsUrl, username, password}        │
│                                                                             │
│  DriverManager                                                              │
│  ├── register(name, factory)                                                │
│  ├── getDriver(name?, options?)                                             │
│  └── getConfiguredDriver()                                                  │
│                                                                             │
│  BrowserFactory (Interface)                                                 │
│  ├── DefaultChromeFactory ────┐                                             │
│  └── DefaultFirefoxFactory ───┼──► WebDriver Instance                      │
│                                                                             │
│  SanElement (Unified wrapper)                                               │
│  ├── Basic: click(), type(), getText(), getAttribute(), isDisplayed()      │
│  ├── Checkboxes: check(), uncheck(), isChecked(), toggle()                 │
│  ├── Mouse: doubleClick(), rightClick(), hover(), dragAndDrop()            │
│  ├── Dropdowns: selectByValue/Text/Index(), getSelectedValue/Text()        │
│  ├── Scrolling: scrollIntoView()                                           │
│  ├── Waiting: waitUntilVisible/Clickable/Present()                         │
│  ├── Collections: count(), getTexts(), getElements(), clickAll()           │
│                                                                             │
│  SanAssertion (Fluent API)                                                  │
│  ├── expectElement(element) ───► Fluent assertions                         │
│  ├── toBeVisible(), toHaveText(), toContainText()                          │
│  ├── toHaveAttribute(), toHaveClass(), toHaveValue()                       │
│  └── Retry logic with configurable timeouts                                │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Relationships

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
PageObject.$(locator) → SanElement → WebElement interactions (single or collections)
```

#### Assertion Flow
```
expectElement(sanElement) → SanAssertion fluent API → Retry-based verifications
```

#### Test Flow
```
Test → PageObject methods → SanElement actions → SanAssertion → Verification
```

### 4-Layer Architecture Benefits

#### 👤 User Layer
- **Test Code**: Focus on business logic and test scenarios
- **Page Objects**: Clean UI abstraction with auto-waiting elements
- **Separation**: User code is isolated from framework internals

#### 🔧 Framework Layer
- **SanElement**: Unified wrapper for single elements and collections
- **DriverManager**: Browser factory with multiple browser support
- **SanAssertion**: Fluent API with retry logic and timeouts
- **ConfigLoader**: Centralized configuration management

### Design Patterns Used

- **Singleton**: ConfigLoader for global configuration
- **Factory**: DriverManager for browser creation
- **Decorator**: SanElement wraps WebElement with auto-wait and advanced methods
- **Fluent Interface**: SanAssertion for readable, chainable assertions
- **Page Object Model**: BasePage and TodoPage for UI abstraction
- **Strategy**: BrowserFactory interface for different browser implementations
- **Unified Interface**: SanElement handles both single elements and collections

### Framework Capabilities

#### SanElement Features
- **Auto-waiting**: All operations wait for elements to be ready
- **Single Elements**: click(), type(), getText(), etc.
- **Collections**: count(), getTexts(), getElements(), clickAll()
- **Checkboxes**: check(), uncheck(), isChecked(), toggle()
- **Mouse Actions**: doubleClick(), rightClick(), hover(), dragAndDrop()
- **Dropdowns**: selectByValue/Text/Index(), getSelectedValue/Text()
- **Advanced**: scrollIntoView(), waitUntilVisible/Clickable/Present()

#### SanAssertion Features
- **Fluent API**: expectElement().toBeVisible().toHaveText()
- **Retry Logic**: Automatic retries with configurable timeouts
- **Rich Assertions**: Text, attributes, visibility, state checks
- **Type Safety**: Full TypeScript support with IntelliSense

## Class Diagram

```mermaid
classDiagram
    %% Configuration Layer
    class ConfigLoader {
        +config: FrameworkConfig
        +getInstance(): ConfigLoader
        +getConfig(): FrameworkConfig
        +getBrowserConfig(): BrowserConfig
        +getTimeoutConfig(): TimeoutConfig
        +getTestConfig(): TestConfig
        +getAppConfig(): AppConfig
        +reload(): void
        +printConfig(): void
    }

    %% Driver Layer
    class DriverManager {
        -factories: Map~string, BrowserFactory~
        +register(name: string, factory: BrowserFactory): void
        +getDriver(name?: BrowserName, options?: any): Promise~WebDriver~
        +getConfiguredDriver(): Promise~WebDriver~
    }

    class BrowserFactory {
        <<interface>>
        +build(options?: any): Promise~WebDriver~
    }

    class DefaultChromeFactory {
        +build(options?: any): Promise~WebDriver~
    }

    class DefaultFirefoxFactory {
        +build(options?: any): Promise~WebDriver~
    }

    %% Core Layer - Unified element wrapper for single elements and collections
    class SanElement {
        -driver: ThenableWebDriver
        -locator: Locator
        -defaultTimeout: number
        +constructor(driver: ThenableWebDriver, locator: Locator, defaultTimeout?: number)
        +click(timeout?: number): Promise~void~
        +type(text: string, timeout?: number): Promise~void~
        +getText(timeout?: number): Promise~string~
        +getAttribute(name: string, timeout?: number): Promise~string|null~
        +isDisplayed(timeout?: number): Promise~boolean~
        +raw(timeout?: number): Promise~WebElement~
        +check(): Promise~void~
        +uncheck(): Promise~void~
        +isChecked(): Promise~boolean~
        +toggle(): Promise~void~
        +doubleClick(): Promise~void~
        +rightClick(): Promise~void~
        +hover(): Promise~void~
        +dragAndDrop(target: SanElement): Promise~void~
        +selectByValue(value: string): Promise~void~
        +selectByText(text: string): Promise~void~
        +selectByIndex(index: number): Promise~void~
        +getSelectedValue(): Promise~string~
        +getSelectedText(): Promise~string~
        +scrollIntoView(): Promise~void~
        +waitUntilVisible(): Promise~void~
        +waitUntilClickable(): Promise~void~
        +waitUntilPresent(): Promise~void~
        +count(): Promise~number~
        +getTexts(): Promise~string[]~
        +getElements(): Promise~SanElement[]~
        +clickAll(): Promise~void~
    }

    %% Assertion Layer
    class SanAssertion {
        -element: SanElement
        -timeout: number
        +constructor(element: SanElement, timeout?: number)
        +toHaveText(expectedText: string): Promise~void~
        +toContainText(expectedSubstring: string): Promise~void~
        +toHaveAttribute(attributeName: string, expectedValue: string): Promise~void~
        +toHaveAttributeContaining(attributeName: string, expectedSubstring: string): Promise~void~
        +toBeVisible(): Promise~void~
        +toBeHidden(): Promise~void~
        +toBeEnabled(): Promise~void~
        +toBeDisabled(): Promise~void~
        +toHaveClass(className: string): Promise~void~
        +toHaveValue(expectedValue: string): Promise~void~
        +toHaveValueContaining(expectedSubstring: string): Promise~void~
    }

    %% Page Object Layer
    class BasePage {
        +driver: ThenableWebDriver
        +constructor(driver: ThenableWebDriver)
        +$(locator: Locator): SanElement
    }

    class TodoPage {
        +title: SanElement
        +moreInfo: SanElement
        +constructor(driver: ThenableWebDriver)
        +open(): Promise~void~
    }

    %% Relationships
    ConfigLoader --> DriverManager : uses
    ConfigLoader --> SanElement : uses
    ConfigLoader --> SanAssertion : uses

    DriverManager --> BrowserFactory : manages
    BrowserFactory <|.. DefaultChromeFactory : implements
    BrowserFactory <|.. DefaultFirefoxFactory : implements

    SanElement --> SanAssertion : wrapped by

    BasePage <|-- TodoPage : extends
    BasePage --> SanElement : creates

    %% Usage relationships
    TodoPage ..> SanAssertion : uses in tests
    TodoPage ..> DriverManager : uses for navigation

    %% Configuration interfaces
    class BrowserConfig {
        +name: string
        +headless: boolean
        +noSandbox: boolean
        +args: string[]
    }

    class TimeoutConfig {
        +default: number
        +element: number
        +pageLoad: number
    }

    class TestConfig {
        +environment: string
        +retryCount: number
        +retryInterval: number
        +parallel: boolean
        +threadCount: number
    }

    class AppConfig {
        +baseUrl: string
        +loginUrl: string
        +productsUrl: string
        +username: string
        +password: string
    }

    class FrameworkConfig {
        +browser: BrowserConfig
        +timeouts: TimeoutConfig
        +test: TestConfig
        +logging: LoggingConfig
        +reporting: ReportingConfig
        +app: AppConfig
    }

    ConfigLoader --> BrowserConfig : contains
    ConfigLoader --> TimeoutConfig : contains
    ConfigLoader --> TestConfig : contains
    ConfigLoader --> AppConfig : contains
    ConfigLoader --> FrameworkConfig : contains
```

## Framework Overview

**SaniumTS** is a modern, TypeScript-based Selenium WebDriver testing framework designed for scalable, maintainable web automation testing. It provides a clean 4-layer architecture that separates user test code from framework internals.

### Key Features

- **🔧 Unified Element Wrapper**: `SanElement` handles both single elements and collections with auto-waiting
- **✅ Fluent Assertions**: `SanAssertion` provides readable, retry-enabled assertions
- **🌐 Browser Management**: `DriverManager` supports Chrome, Firefox, and custom browsers
- **⚙️ Configuration-Driven**: Environment-based configuration with sensible defaults
- **📊 Rich Reporting**: Allure integration for detailed test execution reports
- **🔄 Auto-Retry Logic**: Built-in retry mechanisms for flaky elements and assertions
- **📱 Page Object Model**: Clean abstraction for UI interactions

### Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment** (optional - uses sensible defaults):
   ```bash
   cp .env .env.local  # for custom configuration
   ```

3. **Run tests**:
   ```bash
   npm test                    # Basic test run
   npm run test:allure        # With Allure reporting
   npm run test:allure-demo   # Demo with detailed reporting
   ```

### Core Components

#### SanElement - Smart Element Interactions
```typescript
// Single element operations
await element.click();
await element.type('Hello World');
await element.getText();

// Collection operations
const count = await elements.count();
const texts = await elements.getTexts();

// Advanced interactions
await checkbox.check();
await dropdown.selectByText('Option 1');
await element.scrollIntoView();
```

#### SanAssertion - Fluent Test Assertions
```typescript
// Fluent assertion API with auto-retry
await expectElement(loginButton).toBeVisible();
await expectElement(usernameField).toHaveText('Welcome');
await expectElement(errorMessage).toContainText('Invalid');
```

#### DriverManager - Browser Factory
```typescript
// Automatic browser setup
const driver = await DriverManager.getConfiguredDriver();

// Custom browser configuration
const chromeDriver = await DriverManager.getDriver('chrome', { headless: true });
```

#### Page Object Model
```typescript
export class TodoPage extends BasePage {
  todoInput = this.byCss('.new-todo');
  todoList = this.byCss('.todo-list');

  async addTodo(text: string) {
    await this.todoInput.type(text);
    await this.todoInput.pressEnter();
  }

  async getTodoCount() {
    return await this.todoList.count();
  }
}
```

### Configuration

The framework uses environment-based configuration via `.env` files with sensible defaults:

```bash
# Browser settings
BROWSER=chrome
HEADLESS=false

# Timeouts (milliseconds)
DEFAULT_TIMEOUT=5000
ELEMENT_TIMEOUT=10000

# Test settings
ENVIRONMENT=qa
RETRY_COUNT=3

# Reporting
SCREENSHOT_ON_FAILURE=true
```

### Allure Reporting

Generate beautiful, interactive test reports:

```bash
# Run tests with reporting
npm run test:allure

# View reports
npm run report:allure
```

### Architecture Benefits

- **Separation of Concerns**: User tests isolated from framework internals
- **Type Safety**: Full TypeScript support with IntelliSense
- **Extensibility**: Easy to add new browsers, assertions, and page objects
- **Maintainability**: Clean architecture with clear component responsibilities
- **Reliability**: Auto-waiting and retry logic reduce test flakiness

### Getting Help

- **Documentation**: Comprehensive README with examples
- **Examples**: Working TodoMVC test suite included
- **Configuration**: Environment-based with sensible defaults
- **Extensibility**: Well-documented extension points

Ready to write reliable, maintainable web automation tests! 🚀