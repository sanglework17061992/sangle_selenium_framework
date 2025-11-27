# Page Objects

## What is a Page Object?

A Page Object is a class that represents a page or component and encapsulates all interactions with that UI element. It separates test logic from page logic, making tests more maintainable and reusable.

## Basic Page Object

```typescript
import { BasePage } from '@pages/BasePage';
import SanElement from '@core/elements/SanElement';

export class LoginPage extends BasePage {
  // Define elements as properties using locator helpers
  readonly usernameInput: SanElement = this.id('username');
  readonly passwordInput: SanElement = this.id('password');
  readonly loginButton: SanElement = this.css('button[type="submit"]');
  readonly errorMessage: SanElement = this.css('.error-message');

  // Define page actions as methods
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.type(username);
    await this.passwordInput.type(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.getText();
  }
}
```

## Finding Elements

Page objects inherit from `BasePage`, which provides locator helper methods:

### By ID

```typescript
readonly usernameInput: SanElement = this.id('username');
// Finds element with id="username"
```

### By CSS Selector

```typescript
readonly submitButton: SanElement = this.css('button[type="submit"]');
// Finds element with CSS selector
```

### By XPath

```typescript
readonly element: SanElement = this.xpath('//div[@class="header"]');
// Finds element with XPath expression
```

### By Class Name

```typescript
readonly activeItem: SanElement = this.className('active');
// Finds element with class name
```

## Element Interactions

### Click Element

```typescript
// Auto-waits for visibility, stability, and enabled state
await page.submitButton.click();

// With custom timeout
await page.submitButton.click({ timeout: 15000 });
```

### Type Text into Input

```typescript
// Auto-waits for editability before typing
await page.emailInput.type('user@example.com');

// With custom timeout
await page.emailInput.type('password', { timeout: 10000 });
```

### Get Text

```typescript
// Auto-waits for visibility before reading
const text = await page.heading.getText();

// With custom timeout
const text = await page.heading.getText({ timeout: 10000 });
```

### Check if Displayed

```typescript
// Returns boolean - true if element is visible
const isVisible = await page.element.isDisplayed();

// With custom timeout
const isVisible = await page.element.isDisplayed({ timeout: 10000 });
```

## Real Page Object Example

Here's a complete page object based on the TodoMVC application:

```typescript
import { BasePage } from './BasePage';
import SanElement from '@core/elements/SanElement';

export class TodoPage extends BasePage {
  // Locators
  readonly newTodoInput: SanElement = this.css('.new-todo');
  readonly todoList: SanElement = this.css('.todo-list');
  readonly todoItems: SanElement = this.css('.todo-list li');
  readonly clearCompletedBtn: SanElement = this.css('.clear-completed');

  // Get specific todo item by index
  getTodoItem(index: number): SanElement {
    return this.todoList.findChild({ using: 'css', value: `li:nth-child(${index + 1})` });
  }

  // Page actions
  async addTodo(todoText: string): Promise<void> {
    // Type with auto-wait
    await this.newTodoInput.type(todoText);
  }

  async toggleTodo(index: number): Promise<void> {
    const checkbox = this.getTodoItem(index).findChild({ using: 'css', value: '.toggle' });
    // Click with auto-wait
    await checkbox.click();
  }

  async deleteTodo(index: number): Promise<void> {
    const deleteBtn = this.getTodoItem(index).findChild({ using: 'css', value: '.destroy' });
    // Click with auto-wait
    await deleteBtn.click();
  }

  async verifyPageTitle(): Promise<void> {
    // Can verify page title using BasePage methods if available
    // Or use assertions in tests instead
  }
}
```

## Chaining Elements

Find child elements within parent elements for better scoping:

```typescript
// From TodoPage example
readonly todoList: SanElement = this.css('.todo-list');

// Get child element within todoList
getTodoItem(index: number): SanElement {
  // Searches within todoList context
  return this.todoList.findChild({ using: 'css', value: `li:nth-child(${index + 1})` });
}

// Usage in test
const firstTodo = page.getTodoItem(0);  // Gets first li within .todo-list
await firstTodo.click();  // Click with auto-wait
```

## Page Object Best Practices

### 1. Define Elements as readonly Properties

```typescript
// Good - elements are defined once
export class LoginPage extends BasePage {
  readonly usernameInput: SanElement = this.id('username');
  readonly passwordInput: SanElement = this.id('password');
  readonly loginButton: SanElement = this.css('button[type="submit"]');
  
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.type(username);
    await this.passwordInput.type(password);
    await this.loginButton.click();
  }
}
```

### 2. Encapsulate Page Interactions

```typescript
// Good - test uses high-level page methods
it('should login', async () => {
  await page.login('user@example.com', 'password');
  // Verify success in test
  await expect(page.userProfile).toBeVisible();
});

// Avoid - test interacts directly with low-level elements
it('should login', async () => {
  await page.usernameInput.type('user@example.com');
  await page.passwordInput.type('password');
  await page.loginButton.click();
  await expect(page.userProfile).toBeVisible();
});
```

### 3. Use Descriptive Locator Names

```typescript
// Good - clear what element represents
readonly primaryButton: SanElement = this.css('.btn-primary');
readonly errorAlert: SanElement = this.css('.alert-danger');
readonly loadingSpinner: SanElement = this.css('.spinner');

// Avoid - unclear
readonly el1: SanElement = this.css('button');
readonly el2: SanElement = this.css('div');
readonly el3: SanElement = this.css('span');
```

### 4. Organize Elements by Functionality

```typescript
// Good - logically grouped
export class RegistrationPage extends BasePage {
  // Personal info section
  readonly firstNameInput: SanElement = this.id('firstName');
  readonly lastNameInput: SanElement = this.id('lastName');

  // Contact section
  readonly emailInput: SanElement = this.id('email');
  readonly phoneInput: SanElement = this.id('phone');

  // Form actions
  readonly submitButton: SanElement = this.css('button[type="submit"]');
  readonly cancelButton: SanElement = this.css('button[type="cancel"]');

  // Async methods for page actions
  async fillPersonalInfo(firstName: string, lastName: string): Promise<void> {
    await this.firstNameInput.type(firstName);
    await this.lastNameInput.type(lastName);
  }

  async fillContactInfo(email: string, phone: string): Promise<void> {
    await this.emailInput.type(email);
    await this.phoneInput.type(phone);
  }
}
```

### 5. Use Methods for Complex Interactions

```typescript
// Good - method encapsulates multi-step action
export class SearchPage extends BasePage {
  readonly searchInput: SanElement = this.id('search');
  readonly firstResult: SanElement = this.css('.result:first-child');

  async searchAndClickFirst(query: string): Promise<void> {
    await this.searchInput.type(query);
    // Auto-wait handles result appearance
    await this.firstResult.click();
  }
}

// Usage
it('should search and click result', async () => {
  await page.searchAndClickFirst('typescript framework');
  // Verify result clicked
  await expect(page.firstResult).toBeVisible();
});
```

## Page Object Patterns

### Login Flow

```typescript
export class LoginPage extends BasePage {
  readonly usernameInput: SanElement = this.id('username');
  readonly passwordInput: SanElement = this.id('password');
  readonly loginButton: SanElement = this.css('button[type="submit"]');
  readonly errorMessage: SanElement = this.css('.error');

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.type(username);
    await this.passwordInput.type(password);
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.getText();
  }
}
```

### Form Submission

```typescript
export class ContactPage extends BasePage {
  readonly nameInput: SanElement = this.id('name');
  readonly emailInput: SanElement = this.id('email');
  readonly messageInput: SanElement = this.id('message');
  readonly submitButton: SanElement = this.css('button[type="submit"]');
  readonly successMessage: SanElement = this.css('.success');

  async submitForm(name: string, email: string, message: string): Promise<void> {
    await this.nameInput.type(name);
    await this.emailInput.type(email);
    await this.messageInput.type(message);
    await this.submitButton.click();
  }

  async waitForSuccess(): Promise<string> {
    // Auto-retry handles success message appearing
    return await this.successMessage.getText();
  }
}
```

## Next Steps

- [Writing Tests](03-writing-tests.md)
- [Assertions](05-assertions.md)
- [Auto-Wait Feature](07-auto-wait.md)
