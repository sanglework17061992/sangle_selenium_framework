# Complete Assertion API Guide

## Overview

This framework provides a **unified `expect()` assertion API** inspired by Playwright, supporting **three types of assertions**:

1. 🎯 **Element Assertions** - Auto-retrying assertions for web elements
2. 📄 **Page Assertions** - Auto-retrying assertions for page-level checks
3. 💎 **Value Assertions** - Immediate assertions for resolved values

All assertions use the same `expect()` function with TypeScript overloads for perfect type inference.

---

## Quick Start

```typescript
import { expect } from './assertion/SanAssertion';

// 🎯 Element assertions (auto-retry, 5s timeout)
await expect(element).toBeVisible();
await expect(todoItem).toHaveText('Buy milk');
await expect(checkbox).toBeChecked();

// 📄 Page assertions (auto-retry, 5s timeout)
await expect(page).toHaveTitle('Todo App');
await expect(page).toHaveURL('https://example.com/todos');
await expect(page).toHaveTitleContaining('Todo');

// 💎 Value assertions (immediate, no retry)
expect(count).toBe(3);
expect(items).toInclude('apple');
expect(score).toBeGreaterThan(90);
```

---

## Migration from Old API

### ❌ Before (Deprecated)
```typescript
import { expectElement, expectValue } from './assertion/SanAssertion';

await expectElement(todoInput).toBeVisible();
await expectElement(todoItem).toHaveText('Buy milk');
expectValue(count).toBe(3);
```

### ✅ After (Recommended)
```typescript
import { expect } from './assertion/SanAssertion';

await expect(todoInput).toBeVisible();
await expect(todoItem).toHaveText('Buy milk');
await expect(page).toHaveTitle('Todo App'); // NEW!
expect(count).toBe(3);
```

---

## 🎯 Element Assertions

Auto-retrying assertions for `SanElement` instances. These will retry until the condition passes or timeout (default 5s) is reached.

### Visibility & DOM State

```typescript
// Element visibility
await expect(element).toBeVisible();
await expect(modal).toBeHidden();
await expect(dynamicElement).toBeAttached(); // Exists in DOM

// Viewport position
await expect(heroSection).toBeInViewport();
```

### Element State

```typescript
// Enabled/Disabled
await expect(submitButton).toBeEnabled();
await expect(submitButton).toBeDisabled();

// Editable (enabled + not readonly)
await expect(textInput).toBeEditable();

// Focus
await expect(activeInput).toBeFocused();

// Empty (no text content)
await expect(emptyDiv).toBeEmpty();
```

### Checkbox & Radio Buttons

```typescript
// Checked state
await expect(termsCheckbox).toBeChecked();
await expect(optOutCheckbox).toBeUnchecked();
```

### Text Content

```typescript
// Exact text match
await expect(heading).toHaveText('Welcome Back');

// Contains text (substring)
await expect(paragraph).toContainText('important notice');

// Empty element
await expect(placeholder).toBeEmpty();
```

### Attributes & Properties

```typescript
// HTML attributes
await expect(link).toHaveAttribute('href', '/dashboard');
await expect(image).toHaveAttribute('alt', 'Company Logo');

// Specific attributes
await expect(element).toHaveId('main-content');
await expect(button).toHaveClass('btn-primary');
await expect(input).toHaveValue('john@example.com');

// CSS properties
await expect(element).toHaveCSS('display', 'flex');
await expect(header).toHaveCSS('background-color', 'rgb(255, 0, 0)');

// JavaScript properties
await expect(checkbox).toHaveJSProperty('checked', true);
await expect(input).toHaveJSProperty('disabled', false);
```

### Collections & Multi-Select

```typescript
// Element count
await expect(todoItems).toHaveCount(5);
await expect(searchResults).toHaveCount(0); // No results

// Multi-select dropdown values
await expect(multiSelect).toHaveValues(['option1', 'option2']);
```

### Custom Timeout

```typescript
// Override default 5s timeout
await expect(slowLoadingElement, 10000).toBeVisible(); // 10 seconds
await expect(quickElement, 1000).toHaveText('Fast'); // 1 second
```

---

## 📄 Page Assertions

Auto-retrying assertions for `BasePage` instances. Useful for verifying navigation and page state.

### Page Title

```typescript
// Exact title match
await expect(page).toHaveTitle('Todo Application');

// Title contains substring
await expect(page).toHaveTitleContaining('Todo');
await expect(page).toHaveTitleContaining('Application');

// Title matches regex pattern
await expect(page).toHaveTitleMatching(/^Todo.*App$/);
await expect(page).toHaveTitleMatching(/\d+\s+items?/); // "5 items" or "1 item"
```

### Page URL

```typescript
// Exact URL match
await expect(page).toHaveURL('https://todomvc.com/');
await expect(page).toHaveURL('https://example.com/dashboard');

// URL contains substring
await expect(page).toHaveURLContaining('/todos');
await expect(page).toHaveURLContaining('?filter=active');

// URL matches regex pattern
await expect(page).toHaveURLMatching(/^https:\/\/.*\.com\/todos$/);
await expect(page).toHaveURLMatching(/\/user\/\d+/); // /user/123
```

### Navigation Verification

```typescript
// After login, verify redirect
await loginPage.login('user@example.com', 'password');
await expect(dashboardPage).toHaveURL(/\/dashboard$/);
await expect(dashboardPage).toHaveTitleContaining('Dashboard');

// After form submission, verify page change
await contactForm.submit();
await expect(page).toHaveTitle('Thank You');
await expect(page).toHaveURLContaining('/thank-you');
```

### Custom Timeout

```typescript
// Slow page loads
await expect(page, 15000).toHaveTitle('Heavy Page');
await expect(page, 10000).toHaveURL('https://slow-site.com');
```

---

## 💎 Value Assertions

Immediate (non-retrying) assertions for resolved values. Perfect for data validation.

### Equality Checks

```typescript
// Strict equality (===)
expect(count).toBe(3);
expect(name).toBe('John');
expect(status).toBe('active');

// Deep equality
expect(user).toEqual({ id: 1, name: 'John', role: 'admin' });
expect(settings).toEqual({ theme: 'dark', language: 'en' });

// Negation
expect(status).toNotBe('pending');
expect(count).toNotBe(0);
```

### String & Array Contains

```typescript
// String contains substring
expect(errorMessage).toInclude('validation failed');
expect(url).toInclude('localhost');
expect(email).toNotInclude('@spam.com');

// Array contains element
expect(fruits).toInclude('apple');
expect(['a', 'b', 'c']).toInclude('b');
expect(tags).toNotInclude('deprecated');
```

### Array Membership

```typescript
// Check array has all specified members (order doesn't matter)
expect(fruits).toHaveMembers(['apple', 'banana']);
expect([1, 2, 3, 4]).toHaveMembers([2, 4]); // ✅ Pass
expect(['a', 'b', 'c']).toHaveMembers(['c', 'a']); // ✅ Pass
```

### Boolean Checks

```typescript
expect(isLoggedIn).toBeTrue();
expect(hasErrors).toBeFalse();
expect(isValid).toBeTrue();
```

### Numeric Comparisons

```typescript
expect(score).toBeGreaterThan(90);
expect(age).toBeGreaterThan(18);
expect(temperature).toBeLessThan(100);
expect(discount).toBeLessThan(50);
```

---

## Complete API Reference

### 🎯 ElementAssertions Methods

| Method | Description | Example |
|--------|-------------|---------|
| `toBeVisible()` | Element is visible | `await expect(el).toBeVisible()` |
| `toBeHidden()` | Element is not visible | `await expect(el).toBeHidden()` |
| `toBeAttached()` | Element exists in DOM | `await expect(el).toBeAttached()` |
| `toBeEnabled()` | Element is enabled | `await expect(btn).toBeEnabled()` |
| `toBeDisabled()` | Element is disabled | `await expect(btn).toBeDisabled()` |
| `toBeEditable()` | Enabled & not readonly | `await expect(input).toBeEditable()` |
| `toBeChecked()` | Checkbox is checked | `await expect(cb).toBeChecked()` |
| `toBeUnchecked()` | Checkbox is unchecked | `await expect(cb).toBeUnchecked()` |
| `toBeFocused()` | Element has focus | `await expect(input).toBeFocused()` |
| `toBeEmpty()` | No text content | `await expect(div).toBeEmpty()` |
| `toBeInViewport()` | Visible in viewport | `await expect(el).toBeInViewport()` |
| `toHaveText(text)` | Exact text match | `await expect(el).toHaveText('Hi')` |
| `toContainText(text)` | Contains substring | `await expect(el).toContainText('lo')` |
| `toHaveAttribute(name, val)` | Has attribute | `await expect(el).toHaveAttribute('id', 'x')` |
| `toHaveId(id)` | Has specific ID | `await expect(el).toHaveId('main')` |
| `toHaveClass(className)` | Has CSS class | `await expect(el).toHaveClass('active')` |
| `toHaveValue(value)` | Input value | `await expect(input).toHaveValue('text')` |
| `toHaveCSS(prop, val)` | CSS property | `await expect(el).toHaveCSS('color', 'red')` |
| `toHaveJSProperty(prop, val)` | JS property | `await expect(el).toHaveJSProperty('checked', true)` |
| `toHaveCount(count)` | Element count | `await expect(items).toHaveCount(5)` |
| `toHaveValues(values)` | Multi-select values | `await expect(sel).toHaveValues(['a', 'b'])` |

### 📄 PageAssertions Methods

| Method | Description | Example |
|--------|-------------|---------|
| `toHaveTitle(title)` | Exact title | `await expect(page).toHaveTitle('Home')` |
| `toHaveTitleContaining(text)` | Title contains | `await expect(page).toHaveTitleContaining('App')` |
| `toHaveTitleMatching(regex)` | Title pattern | `await expect(page).toHaveTitleMatching(/^Home/)` |
| `toHaveURL(url)` | Exact URL | `await expect(page).toHaveURL('https://x.com')` |
| `toHaveURLContaining(text)` | URL contains | `await expect(page).toHaveURLContaining('/todos')` |
| `toHaveURLMatching(regex)` | URL pattern | `await expect(page).toHaveURLMatching(/\/todos$/)` |

### 💎 ValueAssertions Methods

| Method | Description | Example |
|--------|-------------|---------|
| `toBe(value)` | Strict equality | `expect(x).toBe(3)` |
| `toEqual(value)` | Deep equality | `expect(obj).toEqual({...})` |
| `toNotBe(value)` | Not equal | `expect(x).toNotBe(0)` |
| `toNotEqual(value)` | Deep not equal | `expect(obj).toNotEqual({...})` |
| `toInclude(substring)` | Contains | `expect(str).toInclude('sub')` |
| `toNotInclude(substring)` | Not contains | `expect(arr).toNotInclude('x')` |
| `toHaveMembers(array)` | Array members | `expect(arr).toHaveMembers([1, 2])` |
| `toBeTrue()` | Is true | `expect(flag).toBeTrue()` |
| `toBeFalse()` | Is false | `expect(flag).toBeFalse()` |
| `toBeGreaterThan(num)` | Numeric > | `expect(score).toBeGreaterThan(90)` |
| `toBeLessThan(num)` | Numeric < | `expect(temp).toBeLessThan(100)` |

---

## Best Practices

### ✅ DO: Use Auto-Retry for Dynamic UI

```typescript
// Good - Waits for element to appear
await expect(successMessage).toBeVisible();
await expect(loadingSpinner).toBeHidden();

// Bad - Timing issues
const isVisible = await element.isDisplayed();
expect(isVisible).toBeTrue();
```

### ✅ DO: Use Page Assertions for Navigation

```typescript
// Good - Waits for navigation
await loginButton.click();
await expect(page).toHaveURL(/\/dashboard$/);
await expect(page).toHaveTitle('Dashboard');
```

### ✅ DO: Use Value Assertions for Data

```typescript
// Good - Immediate check
const items = await page.getTodoItems();
expect(items).toHaveMembers(['Buy milk', 'Walk dog']);
expect(items.length).toBe(2);
```

### ✅ DO: Chain Assertions for Robustness

```typescript
// Verify multiple conditions
await expect(submitButton).toBeVisible();
await expect(submitButton).toBeEnabled();
await submitButton.click();
```

### ⚙️ DO: Adjust Timeouts Appropriately

```typescript
// Fast checks
await expect(cachedElement, 1000).toBeVisible();

// Slow operations
await expect(fileUploadProgress, 30000).toContainText('100%');

// Default (5s) for normal cases
await expect(element).toBeVisible();
```

---

## Common Patterns

### Form Validation

```typescript
// Fill form and verify submission
await nameInput.fill('John Doe');
await emailInput.fill('john@example.com');
await submitButton.click();

await expect(successMessage).toBeVisible();
await expect(successMessage).toContainText('Form submitted');
await expect(page).toHaveURLContaining('/thank-you');
```

### Element State Changes

```typescript
// Verify button becomes enabled
await expect(submitBtn).toBeDisabled();
await nameInput.fill('John');
await expect(submitBtn).toBeEnabled();

// Verify checkbox toggle
await expect(agreeCheckbox).toBeUnchecked();
await agreeCheckbox.check();
await expect(agreeCheckbox).toBeChecked();
```

### Dynamic Content Loading

```typescript
// Search and verify results
await searchBox.fill('selenium');
await searchButton.click();

await expect(resultsContainer).toBeVisible();
await expect(resultItems).toHaveCount(10);
await expect(firstResult).toContainText('selenium');
```

### Multi-Step Workflows

```typescript
// Complete todo workflow
await todoInput.fill('Buy groceries');
await addButton.click();

await expect(todoItems).toHaveCount(1);
await expect(todoItems).toContainText('Buy groceries');
await expect(todoCount).toHaveText('1 item left');

await todoCheckbox.check();
await expect(todoCheckbox).toBeChecked();
await expect(completedCount).toHaveText('1');
```

### Page Navigation

```typescript
// Login flow
await loginPage.open('https://example.com/login');
await expect(loginPage).toHaveTitle('Login');

await loginPage.login('user@test.com', 'password');
await expect(dashboardPage).toHaveURL(/\/dashboard$/);
await expect(dashboardPage).toHaveTitleContaining('Dashboard');
await expect(welcomeMessage).toContainText('Welcome back');
```

---

## TypeScript Support

Perfect type inference with function overloads:

```typescript
// SanElement → ElementAssertions
const element = page.byId('todo');
await expect(element).toBeVisible();     // ✅ Valid
await expect(element).toBe(3);           // ❌ Type error

// BasePage → PageAssertions
await expect(page).toHaveTitle('Home');  // ✅ Valid
await expect(page).toBeVisible();        // ❌ Type error

// T → ValueAssertions<T>
expect(5).toBe(5);                       // ✅ Valid
expect(5).toBeVisible();                 // ❌ Type error
```

---

## Troubleshooting

### Timeout Errors

**Error:**
```
Timeout 5000ms exceeded waiting for element to be visible
```

**Solutions:**
1. Increase timeout: `await expect(element, 10000).toBeVisible()`
2. Verify locator is correct
3. Check element actually appears in the application
4. Check for loading states or animations

### Type Inference Issues

**Problem:**
```typescript
const value = someCondition ? element : 'string';
await expect(value).toBeVisible(); // Type error
```

**Solution:**
```typescript
if (someCondition) {
  await expect(element).toBeVisible();
} else {
  expect(value).toInclude('text');
}
```

### Flaky Tests

**Bad (Flaky):**
```typescript
await button.click();
const text = await result.getText();
expect(text).toBe('Success');
```

**Good (Robust):**
```typescript
await button.click();
await expect(result).toHaveText('Success');
```

---

## Migration Checklist

- [ ] Replace `expectElement()` with `expect()`
- [ ] Replace `expectValue()` with `expect()`
- [ ] Add page-level assertions where appropriate
- [ ] Use `toHaveURL()` and `toHaveTitle()` for navigation checks
- [ ] Update imports to use unified `expect()`
- [ ] Run tests to verify everything works
- [ ] Remove deprecated function usage

---

**Happy Testing! 🎭✨**
