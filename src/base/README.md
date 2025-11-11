# Generic BaseTest Architecture

## Overview
The BaseTest has been refactored to be **generic and reporter-agnostic**, allowing it to work with any Page Object and any test reporter (Allure, Mochawesome, custom reporters, etc.).

## Key Benefits

### 1. **Generic Page Object Support**
- No longer tied to `TodoPage`
- Works with any page object that extends `BasePage`
- Type-safe with TypeScript generics

### 2. **Reporter Independence**
- Not coupled to Allure - uses dependency injection
- Easy to add new reporters (Mochawesome, JUnit, custom, etc.)
- Falls back to no-op reporter if none provided

### 3. **Clean Architecture**
- Follows SOLID principles (Strategy Pattern for reporters)
- Single Responsibility: BaseTest manages test lifecycle, reporters handle reporting
- Open/Closed: Open for extension (new reporters), closed for modification

## Architecture

```
src/testing/
├── BaseTest.ts           # Generic base test class with TestReporter interface
├── AllureReporter.ts     # Allure-specific reporter adapter
└── index.ts              # Public exports
```

## Usage Examples

### Example 1: Using with TodoPage (existing tests)

```typescript
import { TodoPage } from '../src/pages/TodoPage';
import { BaseTest as GenericBaseTest, createReporter } from '../src/testing';
import { ThenableWebDriver } from 'selenium-webdriver';

class TodoTest extends GenericBaseTest<TodoPage> {
  protected createPage(driver: ThenableWebDriver): TodoPage {
    return new TodoPage(driver);
  }
}

// Automatically uses Allure if --reporter allure-mocha is specified
const test = new TodoTest(createReporter());
```

### Example 2: Using with Test Webapp Pages

```typescript
import { DelayedElementsPage } from '../src/pages/test-webapp/DelayedElementsPage';
import { BaseTest, createReporter } from '../src/testing';
import { ThenableWebDriver } from 'selenium-webdriver';

class DelayedElementsTest extends BaseTest<DelayedElementsPage> {
  protected createPage(driver: ThenableWebDriver): DelayedElementsPage {
    return new DelayedElementsPage(driver);
  }
}

describe('Delayed Elements Tests', () => {
  const test = new DelayedElementsTest(createReporter());

  before(async () => {
    await test.setupDriver();
  });

  after(async () => {
    await test.teardownDriver();
  });

  beforeEach(async () => {
    await test.setupTest('http://localhost:3001/delayed-elements');
  });

  afterEach(async function() {
    await test.teardownTest(this);
  });

  it('should test something', async () => {
    // Use test.page to access the page object
    await test.page.triggerDelayedButton();
  });
});
```

### Example 3: Using with Custom Reporter

```typescript
import { TestReporter } from '../src/testing';

// Create custom reporter
class MochawesomeReporter implements TestReporter {
  async beforeAll(): Promise<void> {
    console.log('Mochawesome: Starting test suite');
  }

  async onTestFailure(testName: string, error: any): Promise<void> {
    console.log(`Mochawesome: Test failed - ${testName}`, error);
    // Add custom screenshot, logging, etc.
  }

  // ... implement other methods
}

// Use it
const test = new DelayedElementsTest(new MochawesomeReporter());
```

### Example 4: No Reporter (Simple Tests)

```typescript
// Don't pass any reporter - uses NoOpReporter internally
const test = new DelayedElementsTest();

// Or explicitly pass undefined
const test2 = new DelayedElementsTest(undefined);
```

## TestReporter Interface

```typescript
export interface TestReporter {
  beforeAll?(): Promise<void>;        // Called before all tests
  afterAll?(): Promise<void>;         // Called after all tests
  beforeEach?(): Promise<void>;       // Called before each test
  afterEach?(): Promise<void>;        // Called after each test
  onTestFailure?(testName: string, error: any): Promise<void>; // Called on test failure
  setDriver?(driver: ThenableWebDriver): void; // Set driver for screenshots, etc.
}
```

All methods are **optional**, so you only need to implement what you need.

## Migration Guide

### Old Pattern (Todo-specific):
```typescript
import { BaseTest } from './BaseTest';

const baseTest = new BaseTest();
// baseTest.todoPage is always TodoPage
```

### New Pattern (Generic):
```typescript
import { BaseTest, createReporter } from '../src/testing';
import { YourPage } from '../src/pages/YourPage';

class YourTest extends BaseTest<YourPage> {
  protected createPage(driver: ThenableWebDriver): YourPage {
    return new YourPage(driver);
  }
}

const test = new YourTest(createReporter());
// test.page is YourPage (type-safe!)
```

## Built-in Reporters

### 1. **AllureReporter** (`src/testing/AllureReporter.ts`)
- Adapter for Allure reporting
- Automatically used when `--reporter allure-mocha` is detected
- Factory function: `createReporter()` handles auto-detection

### 2. **NoOpReporter** (Internal)
- Default reporter when none is provided
- Does nothing - useful for quick tests without reporting overhead

## Adding a New Reporter

```typescript
// 1. Create your reporter class
export class CustomReporter implements TestReporter {
  async beforeAll(): Promise<void> {
    // Your setup logic
  }

  async onTestFailure(testName: string, error: any): Promise<void> {
    // Your failure handling
  }

  // Implement other methods as needed
}

// 2. Use it in your tests
const test = new YourTest(new CustomReporter());

// 3. Or create a factory function (optional)
export function createCustomReporter(): TestReporter | undefined {
  if (process.env.CUSTOM_REPORTER === 'true') {
    return new CustomReporter();
  }
  return undefined;
}
```

## Best Practices

1. **Always extend BaseTest with your page type**: `class MyTest extends BaseTest<MyPage>`
2. **Use `createReporter()`** for automatic Allure detection
3. **Override `setupTest()`** if your page needs custom URL logic
4. **Access page via `test.page`** (type-safe!)
5. **Keep reporter logic separate** from test logic

## Testing Different Scenarios

```typescript
// With Allure
npm test -- --reporter allure-mocha

// Without Allure (faster for development)
npm test

// With custom reporter
CUSTOM_REPORTER=true npm test
```

## Benefits Summary

| Before | After |
|--------|-------|
| Tied to TodoPage | Works with any page |
| Hardcoded Allure dependency | Reporter agnostic |
| Hard to test reporter logic | Easy to mock/test |
| Difficult to add new reporters | Just implement interface |
| Duplication for new pages | Reusable for all pages |

## Future Enhancements

Potential improvements:
- Add more built-in reporters (JUnit, Mochawesome, HTML)
- Add reporter plugins/middleware
- Add test retry logic
- Add parallel execution support
- Add test data management
