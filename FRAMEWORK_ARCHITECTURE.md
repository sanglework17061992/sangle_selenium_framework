# SaniumTS Selenium Framework - 4-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    👤 USER LAYER                           │
│  - Test files (.spec.ts)                                    │
│  - Page Objects (TodoPage, LoginPage, etc.)                │
│  - Test suites and scenarios                               │
│  - Business logic test implementations                     │
└─────────────────────┬───────────────────────────────────────┘
                      │ uses
┌─────────────────────▼───────────────────────────────────────┐
│                 � EMBEDDED FRAMEWORK LAYER               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ SanElement: Web element wrapper with auto-wait     │   │
│  │ - Single element: click(), type(), getText()       │   │
│  │ - Collections: count(), getTexts(), getElements()  │   │
│  │ - Advanced: check(), doubleClick(), selectByText() │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ DriverManager: Browser driver factory              │   │
│  │ - Chrome, Firefox, Edge browser support            │   │
│  │ - Headless mode configuration                       │   │
│  │ - Driver lifecycle management                       │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ SanAssertion: Fluent assertion library             │   │
│  │ - expectElement() with retry logic                 │   │
│  │ - Fluent API: .toBeVisible(), .toHaveText()        │   │
│  │ - Configurable timeouts and retry attempts         │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ConfigLoader: Configuration management             │   │
│  │ - .env file parsing                                 │   │
│  │ - Browser, timeout, and app configurations         │   │
│  │ - Singleton pattern for global access              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### � User Layer
**What users write and maintain:**
- Test specifications (`.spec.ts` files)
- Page Object classes extending `BasePage`
- Test scenarios and business logic
- Custom assertions and helpers

### 🔧 Embedded Framework Layer
**Framework components (pre-built):**
- **`SanElement`**: Unified element wrapper for single & collection operations
- **`DriverManager`**: Browser driver factory and lifecycle management
- **`SanAssertion`**: Fluent assertion API with retry logic
- **`ConfigLoader`**: Configuration management from environment files

## Data Flow Architecture

```
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Config    │───▶│  DriverManager  │───▶│   SanElement    │
│  (.env)     │    │  (Browser)      │    │  (Elements)     │
└─────────────┘    └─────────────────┘    └─────────────────┘
       ▲                     ▲                     ▲
       │                     │                     │
┌─────────────┐    ┌─────────────────┐    ┌─────────────────┐
│SanAssertion │◀───│   Page Objects  │◀───│     Tests       │
│ (Fluent API)│    │  (User Code)    │    │  (User Code)    │
└─────────────┘    └─────────────────┘    └─────────────────┘
```

## Component Interactions

### SanElement (Core Element Wrapper)
```typescript
// Single element operations
await element.click();
await element.type('text');
await element.getText();

// Collection operations
const count = await elements.count();
const texts = await elements.getTexts();

// Advanced operations
await checkbox.check();
await element.doubleClick();
await dropdown.selectByText('Option');
```

### DriverManager (Browser Management)
```typescript
// Browser initialization
const driver = await DriverManager.getDriver('chrome');

// Headless mode
const headlessDriver = await DriverManager.getDriver('chrome', true);
```

### SanAssertion (Fluent Assertions)
```typescript
// Fluent assertion API
await expectElement(loginButton).toBeVisible();
await expectElement(usernameField).toHaveText('Welcome');
await expectElement(errorMessage).toContainText('Invalid');
```

### ConfigLoader (Configuration)
```typescript
// Access configurations
const browserConfig = configLoader.getBrowserConfig();
const timeoutConfig = configLoader.getTimeoutConfig();
const appConfig = configLoader.getAppConfig();
```

## Framework Benefits

### For Users 👤
- **Simple API**: Focus on test logic, not browser automation details
- **Auto-waiting**: Elements automatically wait to be ready
- **Fluent Assertions**: Readable, chainable assertion syntax
- **Type Safety**: Full TypeScript support with IntelliSense

### For Framework 🔧
- **Modular Design**: Each component has single responsibility
- **Extensible**: Easy to add new browsers, assertions, or element methods
- **Configurable**: Behavior modified via configuration files
- **Maintainable**: Clear separation between user code and framework code

## Usage Example

```typescript
// User Layer - Test Code
describe('Todo App', () => {
  let todoPage: TodoPage;

  beforeEach(async () => {
    // Embedded Layer - Framework handles browser setup
    const driver = await DriverManager.getDriver('chrome');
    todoPage = new TodoPage(driver);
    await todoPage.open();
  });

  it('should add todo item', async () => {
    // Embedded Layer - SanElement handles element interactions
    await todoPage.addTodo('Buy groceries');

    // Embedded Layer - SanAssertion handles verifications
    await expectElement(todoPage.todoItemsList).toHaveCount(1);
  });
});
```

This 4-layer architecture provides a clean separation between user-written test code and the embedded framework components, making the framework both powerful and easy to use! 🚀</content>
<parameter name="filePath">/home/sangle/Documents/sangle_selenium_framework/FRAMEWORK_ARCHITECTURE.md