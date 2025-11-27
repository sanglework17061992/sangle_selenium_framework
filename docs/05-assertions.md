# Assertions

## Introduction to Assertions

Assertions verify that the application behaves as expected. SaniumTS provides auto-retry assertions that automatically wait and retry until the condition is met or timeout occurs.

## Types of Assertions

SaniumTS provides three types of assertions:

1. **Element Assertions** (`SanElementAssertion`) - Auto-Retry
   - `toBeVisible()` - Element is displayed and visible
   - `toHaveText(text)` - Element contains exact text

2. **Page Assertions** (`SanPageAssertion`) - Auto-Retry
   - `toHaveTitle(title)` - Page has specific title
   - `toHaveURL(url)` - Page URL matches (string or RegExp)

3. **Type Assertions** (`TypeAssertion`) - No Retry
   - `toBe(expected)` - Strict equality check
   - `toEqual(expected)` - Deep equality check
   - `toBeNull()` - Value is null
   - `toBeDefined()` - Value is defined
   - And other standard Chai assertions

## Element Assertions

### toBeVisible()

Verifies an element is displayed and visible on the page:

```typescript
await expect(page.loginButton).toBeVisible();
```

**Auto-retries** until the element becomes visible or timeout occurs. This assertion handles dynamic content and timing issues automatically.

**Example:**
```typescript
// Wait for element to appear and be visible
it('should display login button when page loads', async () => {
  await page.open('/login');
  await expect(page.loginButton).toBeVisible();
});
```

### toHaveText()

Verifies element contains exact text (whitespace is trimmed):

```typescript
await expect(page.heading).toHaveText('Welcome');
```

**Auto-retries** until the element text matches exactly. Whitespace (spaces, newlines, indentation) is trimmed from both actual and expected text before comparison.

**Example:**
```typescript
// Wait for element to have specific text
it('should display welcome message', async () => {
  await page.login('user@example.com', 'password');
  await expect(page.welcomeMessage).toHaveText('Welcome to Dashboard');
});

// Handle dynamic content with auto-retry
it('should display updated status', async () => {
  await page.submitForm();
  // Automatically retries until text changes
  await expect(page.statusMessage).toHaveText('Processing complete');
});
```

## Page Assertions

### toHaveTitle()

Verifies the page has the expected title:

```typescript
await expect(page).toHaveTitle('Dashboard');
```

**Auto-retries** until the page title matches exactly. Whitespace is trimmed from both actual and expected title before comparison.

**Example:**
```typescript
it('should have correct page title', async () => {
  await page.open('https://example.com');
  await expect(page).toHaveTitle('Welcome - Example App');
});
```

### toHaveURL()

Verifies the page URL matches the expected value using either exact string match or RegExp pattern:

```typescript
// Exact string match
await expect(page).toHaveURL('https://example.com/dashboard');

// RegExp pattern match for flexible URL matching
await expect(page).toHaveURL(/dashboard/);
await expect(page).toHaveURL(/https?:\/\/.*example\.com/);
```

**Auto-retries** until the URL matches. Whitespace is trimmed for string comparisons.

**Example:**
```typescript
it('should navigate to dashboard', async () => {
  await page.login('user@example.com', 'password');
  
  // Exact URL match
  await expect(page).toHaveURL('https://example.com/dashboard');
});

it('should handle dynamic URLs with RegExp', async () => {
  await page.openProfile(userId);
  
  // Pattern matching - works with any domain
  await expect(page).toHaveURL(/\/profile\/\d+/);
  
  // Protocol-agnostic matching
  await expect(page).toHaveURL(/https?:\/\/.*example\.com/);
  
  // Hash fragment matching for single-page apps
  await expect(page).toHaveURL(/#\/?(?:active|completed)?$/);
});
```

## Type Assertions

### Value Assertions (No Auto-Retry)

Type assertions are for simple value comparisons without retry logic. Use these for non-UI assertions:

```typescript
// Strict equality
await expect(result).toBe(42);

// Deep equality
await expect(array).toEqual([1, 2, 3]);

// Null/undefined checks
await expect(value).toBeNull();
await expect(value).toBeDefined();
```

**Example:**
```typescript
it('should validate computation results', async () => {
  // Perform calculation
  const result = await page.calculateTotal([10, 20, 30]);
  
  // No retry - simple value assertion
  await expect(result).toBe(60);
});

it('should validate data structure', async () => {
  const userData = await page.fetchUserData();
  
  // Check structure matches expected
  await expect(userData).toEqual({
    id: 123,
    name: 'John',
    email: 'john@example.com'
  });
});
```

## Assertion Best Practices

### 1. One Primary Assertion Per Test

```typescript
// Good - single primary assertion
it('should display welcome message', async () => {
  await page.login('user@example.com', 'password');
  await expect(page.welcomeMessage).toHaveText('Welcome');
});

// Supporting assertions are OK
it('should complete login flow', async () => {
  await page.login('user@example.com', 'password');
  
  // Primary assertion
  await expect(page.userProfile).toBeVisible();
});
```

### 2. Use Specific Assertions

```typescript
// Good - specific assertion on exact text
await expect(page.message).toHaveText('Login successful');

// Avoid - too vague
await expect(page.message).toBeVisible();
```

### 3. Assert What Matters

```typescript
// Good - assert final state after action
await expect(page.userProfile).toBeVisible();

// Avoid - asserting intermediate states that may be brittle
await expect(page.loadingSpinner).toBeVisible();
await expect(page.loadingSpinner).toHaveText('Loading...'); // Could change
```

### 4. Let Auto-Retry Handle Timing

```typescript
// Good - framework handles retries automatically
await expect(page.result).toHaveText('Data loaded');

// Avoid - manual hardcoded waits
await TimeUtils.sleep(2000); // Brittle, slow, unreliable
await expect(page.result).toHaveText('Data loaded');
```

## How Auto-Retry Works

All assertions have built-in retry logic that respects the timeout configuration:

1. **Initial Attempt**: Tries the assertion immediately
2. **Condition Not Met**: If condition not met and timeout remaining, retries
3. **Exponential Backoff**: Short delays between retries to handle DOM updates
4. **Timeout Exceeded**: If timeout reached, assertion fails with clear error message
5. **Success**: Returns immediately when condition is met

**Example:**
```typescript
// This automatically retries until element is visible or 5 seconds pass
await expect(page.dynamicElement).toBeVisible();

// Under the hood:
// 1. T+0ms: Check if element visible → No → Retry
// 2. T+50ms: Check if element visible → No → Retry
// 3. T+150ms: Check if element visible → Yes → Return success
```

## Combining Assertions

Chain multiple assertions for comprehensive validation:

```typescript
it('should validate login page structure', async () => {
  await page.open('/login');
  
  // Verify elements are present
  await expect(page.usernameField).toBeVisible();
  await expect(page.passwordField).toBeVisible();
  await expect(page.loginButton).toBeVisible();
});

it('should handle form submission', async () => {
  await page.open('/login');
  
  // Fill and submit
  await page.usernameField.type('user@example.com');
  await page.passwordField.type('password123');
  await page.loginButton.click();
  
  // Verify result with element assertions
  await expect(page.userProfile).toBeVisible();
  await expect(page.welcomeMessage).toHaveText('Welcome');
  
  // Verify result with page assertions
  await expect(page).toHaveTitle('Dashboard - Example App');
  await expect(page).toHaveURL(/dashboard/);
});
```

## Timeout Configuration

Assertion timeouts can be configured globally or per-action:

```typescript
// Global configuration in config/Config.ts
assertion: {
  timeout: 5000  // 5 seconds for all assertions
}

// Per-action override
await expect(page.element).toBeVisible({ timeout: 10000 }); // 10 seconds
```

## Common Assertion Patterns

### Wait for Element After Action

```typescript
// Element appears after button click
it('should show dropdown menu', async () => {
  await page.menuButton.click();
  
  // Automatically waits for menu to appear
  await expect(page.dropdownMenu).toBeVisible();
});
```

### Wait for Text Change

```typescript
// Text changes after async operation
it('should update status', async () => {
  await page.processButton.click();
  
  // Automatically retries until status updates
  await expect(page.statusText).toHaveText('Process complete');
});
```

### Verify Navigation

```typescript
// Verify page navigation using page assertions
it('should navigate to dashboard after login', async () => {
  await page.login('user@example.com', 'password');
  
  // Wait for navigation to complete
  await expect(page).toHaveTitle('Dashboard');
  await expect(page).toHaveURL('https://example.com/dashboard');
});

// Handle multiple possible URLs with RegExp
it('should navigate to user profile', async () => {
  await page.clickUserProfile();
  
  // Matches /profile/123, /profile/456, etc.
  await expect(page).toHaveURL(/\/profile\/\d+/);
});
```

## Next Steps


- [Auto-Wait Feature](07-auto-wait.md)
- [Auto-Retry Feature](08-auto-retry.md)
- [Troubleshooting](10-troubleshooting.md)
