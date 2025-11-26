# SaniumTS Selenium Framework

A modern TypeScript Selenium framework with design patterns, auto-wait, auto-retry, and comprehensive reporting capabilities.

## Framework Requirements Status

The framework implements all required design patterns and features:

1. [x] Easy to use - Page Object Pattern with typed assertions
2. [x] Support cross browsers - Chrome, Firefox with factory pattern
3. [x] Auto-wait for interactions - Automatic element wait with retry
4. [x] Auto-retry assertions - Built-in retry mechanism for flaky tests
5. [x] Parallel execution - Multi-worker support with Mocha parallel
6. [x] Extensibility - Modular factory and plugin architecture
7. [x] Applied best practices - SOLID principles, design patterns
8. [x] CI/CD integration - Environment-based configuration, multi-reporter
9. [x] Documentation - Comprehensive guides and examples

## Quick Start

### 1. Install Dependencies

```bash
npm install
npm run build
```

### 2. Configure Environment

Create a `.env` file in project root:

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

### 3. Run Tests

#### Single Run (Clean Output)
```bash
npm test
```

#### Development Mode (Detailed Logs)
```bash
npm run test:dev
```

#### Run Specific Test File
```bash
npm run test:example
```

#### Parallel Execution
```bash
npm run test:parallel        # 4 workers
npm run test:parallel:8      # 8 workers
```

## View Test Reports

### Allure Report
```bash
npm run test:allure          # Run tests and generate Allure report
npm run report:allure        # Open existing Allure report
npm run report:allure:generate  # Generate report from existing results
```

### Mochawesome Report
```bash
npm run test:mochawesome     # Run tests and generate Mochawesome report
npm run report:mochawesome   # Open Mochawesome report
```

### Multi-Reporter (Allure + Mochawesome)
```bash
npm run test:multi           # Run tests with both reporters
npm run test:parallel:multi  # Run parallel with both reporters
npm run report:all           # Open both reports
```

### Clean Reports and Rerun
```bash
npm run clean:reports        # Remove all report files
npm run clean:test           # Clean reports and run tests with multi-reporter
```

## Project Structure

```
src/
├── assertion/               # Custom assertion framework
│   ├── SanAssertion.ts
│   ├── SanElement.ts
│   └── SanPage.ts
├── browser/                 # Browser factory implementations
│   ├── BaseBrowserFactory.ts
│   ├── ChromeFactory.ts
│   ├── FirefoxFactory.ts
│   └── BrowserRegistry.ts
├── config/                  # Configuration management
│   └── ConfigLoader.ts
├── core/                    # Core framework features
│   ├── elements/            # Element interaction and waiting
│   └── locators/            # Locator management
├── driver/                  # WebDriver management
│   └── DriverManager.ts
├── pages/                   # Base page objects
│   └── BasePage.ts
├── reporting/               # Test reporting
│   ├── AllureReporter.ts
│   └── MochawesomeReporter.ts
├── tests/                   # Base test class
│   └── BaseTest.ts
├── types/                   # TypeScript type definitions
└── utils/                   # Utilities and helpers
    ├── Logger.ts
    ├── TimeUtils.ts
    └── ValueFormatter.ts

tests/
├── example.spec.ts          # Example test
├── todo.spec.ts             # TodoMVC test
```

## Key Features

### Auto-Wait for Interactions
Elements automatically wait for visibility before interactions:
```typescript
await page.loginButton.click();  // Automatically waits for element to be clickable
```

### Auto-Retry Assertions
Assertions retry automatically for flaky tests:
```typescript
await expect(page).toHaveTitle('Expected Title');  // Retries until timeout
```

### Type-Safe Page Objects
```typescript
class LoginPage extends BasePage {
  get usernameInput() { return this.findElement({ id: 'username' }); }
  get loginButton() { return this.findElement({ css: 'button[type="submit"]' }); }
  
  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
```

### Type-Safe Assertions
```typescript
class TodoTest extends BaseTest<TodoPage> {
  it('should add todo', async () => {
    await expect(this.page.todoInput).toBeVisible();
    await expect(this.page).toHaveTitle('TodoMVC');
    await expect(this.page).toHaveURLContaining('todomvc');
  });
}
```

### Multi-Browser Support
```typescript
// Configure in .env or runtime
BROWSER=chrome   # or firefox
```

### Parallel Execution
Built-in support for parallel test execution with isolated driver instances per worker.

## Configuration

Environment variables can be set in `.env` or passed to npm scripts:

```bash
BROWSER=firefox npm test
HEADLESS=true npm run test:parallel:8
```

## Logging

Logs are written to `logs/` directory with timestamps:
- `logs/test-{timestamp}.log` - Main test log
- Console output for development mode

## Test Examples

### Example Test
```typescript
import { describe, it, before, after } from 'mocha';
import { expect as sanExpect } from '@assertion/index';
import { BaseTest } from '@tests/BaseTest';
import { TodoPage } from '@pages/TodoPage';

class TodoTest extends BaseTest<TodoPage> {
  protected createPage(): TodoPage {
    return new TodoPage();
  }
}

describe('Todo Tests', () => {
  const test = new TodoTest();

  before(async () => {
    await test.setupDriver();
  });

  after(async () => {
    await test.teardownDriver();
  });

  it('should add todo item', async () => {
    await test.page.open('https://demo.playwright.dev/todomvc');
    await test.page.addTodo('My first todo');
    await sanExpect(test.page.todoInput).toBeVisible();
  });
});
```

## Troubleshooting

### Tests fail with "Element not found"
- Check element selectors in page object
- Verify BASE_URL is correct
- Increase DEFAULT_TIMEOUT in .env

### Reports not generating
- Ensure report directory exists: `mkdir -p allure-results mochawesome-report`
- Check reporter configuration in package.json

### Parallel execution issues
- Reduce --jobs if resource limited
- Check for hardcoded timeouts or sleeps

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Run tests: `npm run test:multi`
3. View reports: `npm run report:all`
4. Commit changes: `git commit -am "description"`
5. Push and create pull request