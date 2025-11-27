# Auto-Retry Feature

## Overview

Auto-Retry automatically retries assertions when they fail due to timing issues. All assertions have built-in retry logic that makes tests resilient to timing delays without manual waits.

## How It Works

When you make an assertion:

```typescript
await expect(page.notification).toHaveText('Success');
```

The framework automatically:
1. **Evaluates** the assertion immediately
2. **Checks timeout**: If failed and time remaining, waits
3. **Retries**: Re-evaluates the assertion
4. **Success or Timeout**: Returns on success or fails with clear error after timeout

**No manual configuration needed** - retry logic is built-in to all assertions.

## Timeout Configuration

Default retry timeout for assertions:

```properties
# In .env file
ASSERTION_TIMEOUT=5000  # 5 seconds (default)
```

Override per assertion:

```typescript
// Custom timeout for specific assertion
await expect(page.element).toBeVisible({ timeout: 10000 });
```

## Assertions with Auto-Retry

### toBeVisible()

Retries until element becomes visible:

```typescript
await expect(page.notification).toBeVisible();
```

**Auto-retries because:**
- Element may not be rendered yet
- Element may be hidden by CSS
- Animation may not be complete

**Real scenario:**
```typescript
it('should wait for notification to appear', async () => {
  await page.saveButton.click();
  
  // Notification appears after AJAX response (1-2 seconds)
  // Auto-retry handles this automatically (no sleep needed)
  await expect(page.successNotification).toBeVisible();
});
```

### toHaveText()

Retries until element has exact text:

```typescript
await expect(page.counter).toHaveText('5');
```

**Auto-retries because:**
- Text content changes asynchronously
- Element exists but text is still loading
- Dynamic content updates take time

**Real scenario:**
```typescript
it('should wait for counter to update', async () => {
  await page.incrementButton.click();
  
  // Counter value updates after event handling (~200-500ms)
  // Auto-retry waits automatically until text matches
  await expect(page.counterDisplay).toHaveText('42');
});
```


## Auto-Retry vs Auto-Wait

These are two different mechanisms:

- **Auto-Wait**: Built into element interactions (click, type) - waits for element readiness before action
- **Auto-Retry**: Built into assertions - retries assertion evaluation when condition not met

**Example showing both:**
```typescript
it('should demonstrate both features', async () => {
  // Auto-wait: waits for button to be ready before clicking
  await page.submitButton.click();
  
  // Auto-retry: waits for success message to appear and have correct text
  await expect(page.successMessage).toBeVisible();
  await expect(page.successMessage).toHaveText('Form submitted successfully');
});
```

## Best Practices

### 1. Let Auto-Retry Handle Timing

```typescript
// Good - auto-retry handles delays automatically
it('should process form', async () => {
  await page.submitButton.click();
  await expect(page.result).toHaveText('Success');
});

// Avoid - manual sleep is brittle and slow
it('should process form', async () => {
  await page.submitButton.click();
  await TimeUtils.sleep(2000);
  await expect(page.result).toHaveText('Success');
});
```

### 2. Use Specific Assertions

```typescript
// Good - specific assertion on exact state
await expect(page.message).toHaveText('Order confirmed');

// Avoid - vague assertion
await expect(page.message).toBeVisible();
```

### 3. Adjust Timeouts When Needed

```typescript
// Default timeout for normal operations
await expect(page.result).toBeVisible();

// Longer timeout for operations that take time
await expect(page.report).toBeVisible({ timeout: 15000 });
```

## How Auto-Retry Works Internally

```typescript
// Pseudo-code of auto-retry logic
async toHaveText(expectedText: string): Promise<void> {
  const startTime = Date.now();
  let lastActualText = '';
  
  while (true) {
    try {
      lastActualText = await element.getText();
      if (lastActualText.trim() === expectedText.trim()) {
        return; // Success!
      }
    } catch (e) {
      // Element not found or not accessible yet
    }
    
    // Check if timeout exceeded
    if (Date.now() - startTime > timeout) {
      throw new Error(`Expected "${expectedText}" but got "${lastActualText}"`);
    }
    
    // Wait briefly before retry
    await sleep(100);
  }
}
```

## Real-World Scenarios

### Scenario 1: AJAX Response Delay

```typescript
it('should display search results after AJAX call', async () => {
  // Search takes 1-2 seconds on server
  await page.searchInput.type('typescript');
  await page.searchButton.click();
  
  // Auto-wait ensures button is clickable before click
  // Auto-retry ensures results element becomes visible
  await expect(page.searchResults).toBeVisible();
  
  // Auto-retry ensures results have loaded
  // Without framework: would need await sleep(2000) + unreliable
  // With framework: retries every 50ms until text appears
  await expect(page.resultCount).toHaveText('42 results found');
});
```

### Scenario 2: Animated Content Reveal

```typescript
it('should display content after animation', async () => {
  // Toggle menu (animation takes 300-500ms)
  await page.menuToggle.click();
  
  // Auto-wait: ensures toggle was clickable
  // Auto-retry: waits for menu to animate and become visible
  // Retries until element is both visible AND stable
  await expect(page.menuContent).toBeVisible();
  
  // Menu text is readable after animation
  await expect(page.menuItem1).toHaveText('Dashboard');
});
```

## Debugging Auto-Retry Issues

### Assertion Times Out

```
Error: Timeout waiting for element text
Expected: "Success"
Actual: "Processing..." (after 5000ms)

Solutions:
1. Increase timeout: { timeout: 10000 }
2. Verify element actually updates to "Success"
3. Check if expected text matches exactly (case-sensitive)
```

### Element Not Found

```
Error: Element not found
Locator: {"css": ".success-message"}

Solutions:
1. Verify locator is correct
2. Check if element ID or class changed
3. Increase timeout if element loads slowly
```

## Next Steps

- [Assertions](05-assertions.md)
- [Auto-Wait](07-auto-wait.md)
- [Troubleshooting](10-troubleshooting.md)

