# SaniumTS Framework - Class Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CONFIGURATION LAYER                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  ConfigLoader (Singleton)                                                   │
│  ├── BrowserConfig {name, headless, noSandbox, args}                       │
│  ├── TimeoutConfig {default, element, pageLoad}                            │
│  ├── TestConfig {environment, retryCount, retryInterval, parallel}         │
│  └── AppConfig {baseUrl, loginUrl, productsUrl, username, password}        │
└─────────────────┬───────────────────────────────────────────────────────────┘
                  │ configures
                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                DRIVER LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│  DriverManager                                                              │
│  ├── register(name, factory)                                                │
│  ├── getDriver(name?, options?)                                             │
│  └── getConfiguredDriver()                                                  │
│                                                                             │
│  BrowserFactory (Interface)                                                 │
│  ├── DefaultChromeFactory ────┐                                             │
│  └── DefaultFirefoxFactory ───┼──► WebDriver Instance                      │
└─────────────────┬─────────────┴─────────────────────────────────────────────┘
                  │ provides driver
                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 CORE LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  SanElement                                                                │
│  ├── constructor(driver, locator, defaultTimeout?)                         │
│  ├── click(timeout?)                                                        │
│  ├── type(text, timeout?)                                                   │
│  ├── getText(timeout?)                                                      │
│  ├── getAttribute(name, timeout?)                                           │
│  ├── isDisplayed(timeout?)                                                  │
│  └── raw(timeout?)                                                          │
│                                                                             │
│  Locator {using: 'css'|'xpath'|'id'|'name'|'tag'|'class', value: string}    │
└─────────────────┬───────────────────────────────────────────────────────────┘
                  │ wraps elements
                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              ASSERTION LAYER                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ElementAssertions                                                         │
│  ├── toHaveText(expected)                                                   │
│  ├── toContainText(substring)                                               │
│  ├── toHaveAttribute(name, value)                                           │
│  ├── toHaveAttributeContaining(name, substring)                             │
│  ├── toBeVisible()                                                          │
│  ├── toBeHidden()                                                           │
│  ├── toBeEnabled()                                                          │
│  ├── toBeDisabled()                                                         │
│  ├── toHaveClass(className)                                                 │
│  ├── toHaveValue(expected)                                                  │
│  └── toHaveValueContaining(substring)                                       │
│                                                                             │
│  expectElement(element, timeout?) ───► ElementAssertions instance           │
└─────────────────┬───────────────────────────────────────────────────────────┘
                  │ used by
                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             PAGE OBJECT LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  BasePage (Abstract)                                                       │
│  ├── constructor(driver)                                                   │
│  └── $(locator) ───► SanElement                                            │
│                                                                             │
│  ExamplePage extends BasePage                                              │
│  ├── title: SanElement                                                     │
│  ├── moreInfo: SanElement                                                  │
│  └── open(): Promise<void>                                                 │
└─────────────────┬───────────────────────────────────────────────────────────┘
                  │ tested by
                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                TEST LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│  config.spec.ts      ──► Configuration tests                               │
│  framework.spec.ts   ──► Framework core tests                             │
│  fluent-assertions.spec.ts ──► Assertion API tests                        │
│  example.spec.ts     ──► Browser integration tests                        │
│                                                                             │
│  Test Runner: Mocha + ts-node                                              │
│  Assertion Library: Chai (via custom fluent API)                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Key Relationships

### Configuration Flow
```
.env file → ConfigLoader → FrameworkConfig → All layers
```

### Driver Creation Flow
```
ConfigLoader.getBrowserConfig() → DriverManager.getConfiguredDriver() → WebDriver
```

### Element Interaction Flow
```
PageObject.$(locator) → SanElement → WebElement interactions
```

### Assertion Flow
```
expectElement(sanElement) → ElementAssertions → Fluent assertions with retry
```

### Test Flow
```
Test → PageObject methods → SanElement actions → ElementAssertions → Verification
```

## Design Patterns Used

- **Singleton**: ConfigLoader for global configuration
- **Factory**: DriverManager for browser creation
- **Decorator**: SanElement wraps WebElement with auto-wait
- **Fluent Interface**: ElementAssertions for readable assertions
- **Page Object Model**: BasePage and ExamplePage for UI abstraction
- **Strategy**: BrowserFactory interface for different browser implementations

## Benefits

- **Modular**: Each layer can be modified independently
- **Testable**: Each layer has its own test coverage
- **Extensible**: New browsers, assertions, or page objects can be added easily
- **Maintainable**: Clear separation of concerns
- **Readable**: Fluent API makes tests self-documenting</content>
<parameter name="filePath">/home/sangle/Documents/sangle_selenium_framework/FRAMEWORK_DIAGRAM.md