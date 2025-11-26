# Writing Tests

## Test Structure

Every test file follows this structure using Mocha and the framework's assertion library:

```typescript
import { describe, it, before, after, beforeEach } from 'mocha';
import { expect as sanExpect } from '@assertion/index';
import { BaseTest } from '@tests/BaseTest';
import { YourPage } from '@pages/YourPage';

class YourTest extends BaseTest<YourPage> {
  protected createPage(): YourPage {
    return new YourPage();
  }
}

describe('Feature Name', () => {
  const test = new YourTest();
  const page = test.page;

  before(async () => {
    await test.setupDriver();  // Initialize WebDriver
  });

  after(async () => {
    await test.teardownDriver();  // Close browser
  });

  beforeEach(async () => {
    // Optional: Navigate to fresh page before each test
  });

  it('should do something', async () => {
    // Test implementation here
  });
});
```

## Test Lifecycle

### before() - Setup

Runs once before all tests in the suite:

```typescript
before(async () => {
  await test.setupDriver();  // Initializes WebDriver and creates page object
  page = test.page;
});
```

BaseTest handles:
- Creating WebDriver instance
- Initializing page object via `createPage()`
- Starting browser

### beforeEach() - Setup Each Test

Runs before each individual test:

```typescript
beforeEach(async () => {
  // Reset page state if needed
  await page.open('https://example.com');
});
```

### it() - Test Case

Individual test case using Arrange-Act-Assert pattern:

```typescript
it('should add todo item', async () => {
  // Arrange
  const todoText = 'Learn SaniumTS Framework';

  // Act
  await page.newTodoInput.type(todoText);
  await page.addButton.click();

  // Assert
  await sanExpect(page.todoList).toBeVisible();
});
```

### afterEach() - Cleanup Each Test

Runs after each test:

```typescript
afterEach(async () => {
  // Optional cleanup per test
});
```

### after() - Teardown

Runs once after all tests:

```typescript
after(async () => {
  await test.teardownDriver();  // Closes browser and WebDriver
});
```

## Real Test Example

Here's a complete test suite based on TodoMVC:

```typescript
import { describe, it, before, after, beforeEach } from 'mocha';
import { expect as sanExpect } from '@assertion/index';
import { configLoader } from '@config/ConfigLoader';
import { logger } from '@utils/Logger';
import { BaseTest } from '@tests/BaseTest';
import { TodoPage } from '@pages/TodoPage';

class TodoTest extends BaseTest<TodoPage> {
  protected createPage(): TodoPage {
    return new TodoPage();
  }
}

describe('TodoMVC App - Page Object Pattern & Assertions', () => {
  const test = new TodoTest();
  let page: TodoPage;
  let baseUrl: string;

  before(async () => {
    await test.setupDriver();
    page = test.page;
    baseUrl = configLoader.getBaseUrl();
  });

  beforeEach(async () => {
    await page.open(baseUrl);  // Fresh page for each test
  });

  after(async () => {
    await test.teardownDriver();
  });

  describe('Add Todo Item', () => {
    it('should add multiple todo items', async () => {
      const todos = ['Learn SaniumTS', 'Build tests', 'Deploy app'];

      for (const todoText of todos) {
        logger.info(`Adding: ${todoText}`);
        await page.addTodo(todoText);
      }

      // Verify input is visible (auto-wait handles it)
      await sanExpect(page.newTodoInput).toBeVisible();
      
      // Verify todos are created
      await sanExpect(page.todoList).toBeVisible();
    });
  });

  describe('Todo Interactions', () => {
    it('should toggle todo item', async () => {
      // Add items
      await page.addTodo('First task');
      await page.addTodo('Second task');

      // Toggle first item (auto-wait ensures element is ready)
      await page.toggleTodo(0);

      // Verify list is still visible
      await sanExpect(page.todoList).toBeVisible();
    });

    it('should delete todo item', async () => {
      // Add item
      await page.addTodo('Item to delete');

      // Delete it
      await page.deleteTodo(0);

      // Verify input is still visible
      await sanExpect(page.newTodoInput).toBeVisible();
    });
  });
});
```

## Test Best Practices

### 1. One Primary Assertion Per Test

```typescript
// Good - single primary assertion
it('should display welcome message after login', async () => {
  // Setup
  await page.login('user@example.com', 'password');

  // Single primary assertion
  await sanExpect(page.welcomeMessage).toHaveText('Welcome');
});

// Supporting assertions OK (verify preconditions)
it('should complete login flow', async () => {
  await page.login('user@example.com', 'password');

  // Primary assertion
  await sanExpect(page).toHaveURL('https://example.com/dashboard');

  // Supporting assertions
  await sanExpect(page.userProfile).toBeVisible();
});
```

### 2. Clear Descriptive Test Names

```typescript
// Good - describes what is tested and expected
it('should display error message when email field is empty', async () => {
  await page.emailInput.type('');
  await page.submitButton.click();
  await sanExpect(page.errorMessage).toHaveText('Email is required');
});

// Avoid - unclear or too vague
it('should work', async () => { ... });
it('test form', async () => { ... });
```

### 3. Use Page Objects to Encapsulate Logic

```typescript
// Good - page object encapsulates interaction
it('should login successfully', async () => {
  // Page object method handles all steps
  await page.login('user@example.com', 'password');
  await sanExpect(page).toHaveURL('/dashboard');
});

// Avoid - logic in test (brittle, hard to maintain)
it('should login successfully', async () => {
  await page.emailInput.type('user@example.com');
  await page.passwordInput.type('password');
  await page.loginButton.click();
  await sanExpect(page).toHaveURL('/dashboard');
});
```

### 4. Use Test Fixtures for Data

```typescript
// fixtures/userData.ts
export const CREDENTIALS = {
  VALID: { email: 'user@example.com', password: 'password123' },
  INVALID: { email: 'invalid', password: '' },
  EXPIRED: { email: 'expired@example.com', password: 'password123' }
};

// In test
import { CREDENTIALS } from '../fixtures/userData';

it('should login with valid credentials', async () => {
  await page.login(CREDENTIALS.VALID.email, CREDENTIALS.VALID.password);
  await sanExpect(page).toHaveURL('/dashboard');
});

it('should show error with invalid credentials', async () => {
  await page.login(CREDENTIALS.INVALID.email, CREDENTIALS.INVALID.password);
  await sanExpect(page.errorMessage).toHaveText('Invalid email or password');
});
```

### 5. Organize Tests with describe() Blocks

```typescript
describe('Authentication', () => {
  describe('Login', () => {
    it('should login with valid credentials', async () => { ... });
    it('should show error with invalid credentials', async () => { ... });
    it('should clear password on failed attempt', async () => { ... });
  });

  describe('Logout', () => {
    it('should logout and redirect to login', async () => { ... });
    it('should clear session data on logout', async () => { ... });
  });

  describe('Session Timeout', () => {
    it('should redirect to login after timeout', async () => { ... });
  });
});
```

## Test Patterns

### Testing Form Submission

```typescript
it('should submit form with valid data', async () => {
  // Fill form (auto-wait handles element readiness)
  await page.nameInput.type('John Doe');
  await page.emailInput.type('john@example.com');
  await page.messageInput.type('Hello world');

  // Submit (auto-wait ensures button is clickable)
  await page.submitButton.click();

  // Verify success (auto-retry handles result appearing)
  await sanExpect(page.successMessage).toBeVisible();
  await sanExpect(page.successMessage).toHaveText('Thank you for your message');
});
```

### Testing Dynamic Content

```typescript
it('should load and display search results', async () => {
  // Trigger search (auto-wait for button)
  await page.searchInput.type('typescript');
  await page.searchButton.click();

  // Wait for results (auto-wait and auto-retry)
  await sanExpect(page.resultsList).toBeVisible();
  
  // Verify content
  const firstResult = page.getResultItem(0);
  const text = await firstResult.getText();
  
  await sanExpect(page.resultsList).toHaveText(text);
});
```

### Testing Error States

```typescript
it('should display error message on server error', async () => {
  // Trigger action that causes error
  await page.unreachableButton.click();

  // Wait for error message (auto-wait for visibility)
  await sanExpect(page.errorAlert).toBeVisible();
  
  // Verify error details
  const errorText = await page.errorAlert.getText();
  
  await sanExpect(page.errorAlert).toHaveText('Server error');
});
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test File

```bash
npm test tests/example.spec.ts
```

### Run Tests Matching Pattern

```bash
npm test -- --grep "Login"
```

### Run with Custom Configuration

```bash
# Override timeout
ELEMENT_TIMEOUT=15000 npm test

# Run with debugging
DEBUG=* npm test
```

## Debugging Tests

### Add Logging

```typescript
import { logger } from '@utils/Logger';

it('should debug test execution', async () => {
  logger.info('Starting test');
  await page.button.click();
  
  logger.debug('Button clicked');
  const result = await page.result.getText();
  
  logger.info(`Result: ${result}`);
  await sanExpect(page.result).toHaveText(result);
});
```

### Use Browser DevTools

```typescript
// Add delay to inspect element
await page.element.click();
await TimeUtils.sleep(5000);  // Inspect in browser
```

### Check Logs

```bash
# View test logs
tail -f logs/test.log

# View Allure report
npm run report:allure
```

## Next Steps

- [Page Objects](04-page-objects.md)
- [Assertions](05-assertions.md)
- [Auto-Wait Feature](07-auto-wait.md)
