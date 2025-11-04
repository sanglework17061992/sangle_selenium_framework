# SaniumTS Selenium Framework - Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    🧪 TEST LAYER                            │
│  - test files (.spec.ts)                                    │
│  - Mocha test runner                                        │
│  - Test configuration                                       │
└─────────────────────┬───────────────────────────────────────┘
                      │ uses
┌─────────────────────▼───────────────────────────────────────┐
│                 📄 PAGE OBJECT LAYER                       │
│  - BasePage (abstract base class)                          │
│  - ExamplePage (concrete implementation)                   │
│  - Page-specific element definitions                       │
└─────────────────────┬───────────────────────────────────────┘
                      │ uses
┌─────────────────────▼───────────────────────────────────────┐
│                🔍 ASSERTION LAYER                          │
│  - ElementAssertions (fluent API)                          │
│  - expectElement() wrapper function                        │
│  - Retry logic with configurable timeouts                  │
└─────────────────────┬───────────────────────────────────────┘
                      │ uses
┌─────────────────────▼───────────────────────────────────────┐
│                  🎯 CORE LAYER                             │
│  - SanElement (web element wrapper)                        │
│  - Auto-wait functionality                                  │
│  - Element interactions (click, type, getText, etc.)       │
└─────────────────────┬───────────────────────────────────────┘
                      │ uses
┌─────────────────────▼───────────────────────────────────────┐
│                 🚗 DRIVER LAYER                            │
│  - DriverManager (factory registry)                        │
│  - BrowserFactory implementations                          │
│  - Chrome, Firefox, and custom browser support             │
└─────────────────────┬───────────────────────────────────────┘
                      │ uses
┌─────────────────────▼───────────────────────────────────────┐
│               ⚙️ CONFIGURATION LAYER                       │
│  - ConfigLoader (singleton)                                │
│  - .env file parsing                                       │
│  - Typed configuration interfaces                          │
└─────────────────────────────────────────────────────────────┘
```

## Layer Dependencies

```
Test Layer → Page Object Layer → Assertion Layer → Core Layer → Driver Layer → Configuration Layer
```

## Key Classes by Layer

### Configuration Layer
- `ConfigLoader` - Singleton configuration manager
- `BrowserConfig`, `TimeoutConfig`, `TestConfig`, `AppConfig` - Configuration interfaces

### Driver Layer
- `DriverManager` - Browser driver factory registry
- `BrowserFactory` - Interface for browser implementations
- `DefaultChromeFactory`, `DefaultFirefoxFactory` - Concrete browser factories

### Core Layer
- `SanElement` - Web element wrapper with auto-wait
- `Locator` - Element locator interface

### Assertion Layer
- `ElementAssertions` - Fluent assertion API
- `expectElement()` - Factory function for assertions

### Page Object Layer
- `BasePage` - Abstract base class for page objects
- `ExamplePage` - Concrete page implementation

### Test Layer
- `*.spec.ts` files - Test specifications
- Mocha test framework integration

## Data Flow

1. **Configuration** loads from `.env` file
2. **Driver Manager** creates browser instance using config
3. **Page Objects** initialize with driver and define elements
4. **SanElement** wraps web elements with auto-wait functionality
5. **Assertions** provide fluent API for element verification
6. **Tests** use page objects and assertions to verify behavior

## Benefits of Layered Architecture

- **Separation of Concerns**: Each layer has a specific responsibility
- **Testability**: Each layer can be tested independently
- **Maintainability**: Changes in one layer don't affect others
- **Extensibility**: New browsers, assertions, or pages can be added easily
- **Configuration**: Behavior can be modified without code changes</content>
<parameter name="filePath">/home/sangle/Documents/sangle_selenium_framework/FRAMEWORK_ARCHITECTURE.md