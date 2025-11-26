# Auto-Wait Feature

## Overview

Auto-Wait automatically waits for elements to become visible, stable, and interactable before performing actions. This eliminates the need for manual `sleep()` calls and reduces flaky tests.

## How It Works

When you interact with an element:

```typescript
await page.submitButton.click();
```

The framework automatically:
1. **Finds** the element in the DOM
2. **Validates Visibility**: Checks if element is displayed and visible on screen
3. **Validates Stability**: Ensures element is not moving or animating
4. **Validates Enabled State** (for click): Checks if element is enabled for interaction
5. **Performs the action**: Once all checks pass, executes the click

If any validation step times out, the test fails with clear error messages showing which check failed.

## Timeout Configuration

Set timeouts in `.env`:

```properties
ELEMENT_TIMEOUT=10000        # Element-specific timeout (used for all element operations)
```

Override at runtime:

```bash
ELEMENT_TIMEOUT=15000 npm test
```

Configure in code:

```typescript
// Per-action override
await page.button.click({ timeout: 20000 });

// Global configuration in config/Config.ts
timeout: {
  element: 10000
}
```

## Auto-Wait in Actions

### Click Element

```typescript
// Automatically waits for visibility, stability, and enabled state before clicking
await page.submitButton.click();

// With custom timeout
await page.submitButton.click({ timeout: 15000 });

// Force click without waiting for all checks (not recommended)
await page.submitButton.click({ force: true });
```

**Checks performed:**
- Visible on screen
- Enabled (not disabled attribute)
- Stable (not moving)

### Type Text Into Input

```typescript
// Automatically waits for visibility and editability before typing
await page.emailInput.type('user@example.com');

// With custom timeout
await page.emailInput.type('password', { timeout: 15000 });

// Force type without waiting (not recommended)
await page.emailInput.type('text', { force: true });
```

**Checks performed:**
- Visible on screen
- Enabled (not disabled)
- Editable (is input/textarea/contenteditable)
- Stable (not moving)

### Get Text

```typescript
// Automatically waits for visibility before reading text
const text = await page.heading.getText();

// With custom timeout
const text = await page.heading.getText({ timeout: 15000 });
```

**Checks performed:**
- Visible on screen

### Check if Displayed

```typescript
// Checks if element is currently visible
const isVisible = await page.element.isDisplayed();

// With custom timeout
const isVisible = await page.element.isDisplayed({ timeout: 15000 });
```

**Checks performed:**
- Checks if element is currently visible


## Best Practices

### 1. Let Framework Handle Waiting

```typescript
// Good - framework handles waiting
await page.submitButton.click();
const message = await page.successMessage.getText();

// Avoid - manual hardcoded wait
await TimeUtils.sleep(2000);
const message = await page.successMessage.getText();
```

### 2. Use Timeouts for Complex Scenarios

```typescript
// Default timeout for fast operations
await page.button.click();

// Longer timeout for slow operations or animations
await page.longAnimationButton.click({ timeout: 20000 });
```

### 3. Combine Auto-Wait with Assertions

```typescript
// Good pattern: auto-wait handles element readiness
it('should interact with dynamic page', async () => {
  await page.open('/page');
  
  // Auto-wait ensures button is ready
  await page.button.click();
  
  // Auto-retry ensures element appears after click
  await expect(page.result).toBeVisible();
  await expect(page.result).toHaveText('Success');
});
```

### 4. Don't Disable Waits Unnecessarily

```typescript
// Good - use framework waits
await page.button.click();

// Avoid - forcing actions can cause failures
await page.button.click({ force: true });  // Use only when necessary
```

## Debugging Auto-Wait Issues

### Element Not Found

```
Error: Element not found
  Locator: {"css": ".submit-btn"}
  Timeout: 10000ms
  
  Solution:
  1. Verify locator is correct
  2. Check if element ID/class changed
  3. Increase timeout if element loads slowly
```

### Element Not Visible

```
Error: Element not visible
  Locator: {"css": ".message"}
  Timeout: 10000ms
  
  Solution:
  1. Check if element is behind another element
  2. Verify element's display CSS (not hidden)
  3. Check if parent container has overflow: hidden
```

### Element Not Stable

```
Error: Element not stable within 10000ms
  Locator: {"id": "animated"}
  Failed check: STABLE
  
  Solution:
  1. Increase timeout for animations
  2. Wait for animation to complete in test
  3. Use { timeout: 20000 } for slow animations
```

### Element Not Enabled

```
Error: Element not ready for action
  Locator: {"css": "button"}
  Failed checks: ENABLED
  
  Solution:
  1. Check if button has disabled attribute
  2. Verify aria-disabled is not 'true'
  3. Wait longer for async operations that enable button
```

## Next Steps

- [Assertions](05-assertions.md)
- [Troubleshooting](10-troubleshooting.md)

