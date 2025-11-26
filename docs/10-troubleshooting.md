# Troubleshooting

## Common Issues and Solutions

## Tests Fail with "Element not found"

### Error Message
```
Error: Element not found
  Locator: {"id": "username"}
  Timeout: 10000ms
```

### Causes
1. Element selector is incorrect
2. Element doesn't exist on page
3. Element is inside iframe

### Solutions

Check element selector:
```bash
# Open browser and inspect element
HEADLESS=false npm test

# Wait for browser, then check element in DevTools
```

Verify page has navigated:
```typescript
it('should find element', async () => {
  await page.open('https://example.com/login');
  
  // Check URL
  const url = await page.driver.getCurrentUrl();
  console.log('Current URL:', url);
  
  // Then find element
  await expect(page.usernameInput).toBeVisible();
});
```

Handle iframes:
```typescript
// Switch to iframe context
await driver.switchTo().frame(0);
await page.element.click();
await driver.switchTo().defaultContent();
```

## Tests Fail with "Element not visible"

### Error Message
```
Error: Element not visible
  Locator: {"css": ".message"}
  Timeout: 5000ms
```

### Causes
1. Element is covered by other element
2. Element has `display: none` or `visibility: hidden`
3. Element has negative z-index
4. Parent element is hidden

### Solutions

Increase timeout:
```properties
ELEMENT_TIMEOUT=15000
```

Check element visibility in browser:
```typescript
const isDisplayed = await page.element.isDisplayed();
console.log('Is displayed:', isDisplayed);
```

Scroll element into view:
```typescript
await driver.executeScript('arguments[0].scrollIntoView(true);', element);
await page.element.click();
```

Wait longer:
```typescript
await page.message.waitForVisibility(20000);
```

## Tests Fail with "Element not clickable"

### Error Message
```
Error: Element not clickable
  Locator: {"css": "button"}
  Timeout: 10000ms
```

### Causes
1. Element is disabled
2. Element is covered by popup/overlay
3. Element is animating
4. Button is still loading

### Solutions

Wait for loader to disappear:
```typescript
await page.loadingSpinner.waitForInvisibility(10000);
await page.submitButton.click();
```

Close overlays:
```typescript
const overlay = await driver.findElements(By.css('.overlay'));
if (overlay.length > 0) {
  await overlay[0].click();  // Close overlay
}
```

Use JavaScript click:
```typescript
await driver.executeScript('arguments[0].click();', element);
```

Enable element:
```typescript
await driver.executeScript('arguments[0].disabled = false;', element);
await page.button.click();
```

## Tests Hang or Timeout

### Causes
1. Infinite wait loop
2. Element never appears
3. Page never loads
4. Deadlock in parallel execution

### Solutions

Increase test timeout:
```bash
npm test --timeout 30000
```

Set timeout in test:
```typescript
it('should load data', async function() {
  this.timeout(20000);
  
  await page.loadButton.click();
  await expect(page.data).toBeVisible();
});
```

Debug hanging test:
```bash
DEBUG=* npm test
```

Check browser logs:
```typescript
const logs = await driver.manage().logs().get('browser');
logs.forEach(entry => console.log(entry));
```

Break infinite loop:
```typescript
// Add max attempts
let attempts = 0;
while (attempts < 10 && !done) {
  // Do something
  attempts++;
}
```

## Stale Element Errors

### Error Message
```
StaleElementReferenceError: Element is no longer attached to the DOM
```

### Causes
1. Page refreshed after finding element
2. Element removed from DOM
3. DOM reconstructed

### Solutions

Re-find element:
```typescript
// Instead of storing element
const element = await page.element;
await element.click();
await element.getText();

// Re-find each time
await page.element.click();
await page.element.getText();
```

Wait for element to stabilize:
```typescript
await page.element.waitForElement(10000);
await page.element.click();
```

Handle React/Angular re-renders:
```typescript
// Framework auto-handles this with retry mechanism
await expect(page.element).toBeVisible();
```

## Parallel Execution Issues

### Tests Interfere with Each Other

### Solutions

Isolate test data:
```typescript
beforeEach(async () => {
  await page.clearAllData();
  await page.open(baseUrl);
});
```

Use unique IDs:
```typescript
const uniqueId = `test_${Date.now()}_${Math.random()}`;
await page.fillName(uniqueId);
```

Check driver isolation:
```typescript
// Each worker should have its own driver
const workerId = process.env.MOCHA_WORKER_ID;
console.log('Worker:', workerId);
```

## Reporting Issues

### Reports Not Generating

Check reporter configuration:
```bash
# Check if allure-results directory exists
ls -la allure-results/

# Check if allure command is installed
which allure

# Generate report manually
allure generate allure-results -o allure-report --clean
```

Fix permissions:
```bash
# Fix directory permissions
chmod -R 755 allure-results/
chmod -R 755 mochawesome-report/
```

Clear old reports:
```bash
npm run clean:reports
npm run test:multi
```

## Browser Issues

### ChromeDriver Not Found

```bash
# Install ChromeDriver
npm install chromedriver

# Or specify path
CHROME_DRIVER_PATH=/usr/bin/chromedriver npm test
```

### Firefox Not Found

```bash
# Install GeckoDriver
npm install geckodriver

# Or specify path
GECKO_DRIVER_PATH=/usr/bin/geckodriver npm test
```

## Configuration Issues

### BASE_URL Not Set

```bash
# Set in .env
BASE_URL=https://example.com npm test

# Or set environment variable
export BASE_URL=https://example.com
npm test
```

### Invalid Timeout Values

```properties
# Good - milliseconds
DEFAULT_TIMEOUT=5000

# Avoid - seconds
DEFAULT_TIMEOUT=5
```

## Debugging Techniques

### Enable Debug Logging
```bash
DEBUG=* npm test
```

### Take Screenshots
```typescript
import * as fs from 'fs';

async function screenshot(driver: WebDriver, name: string) {
  const shot = await driver.takeScreenshot();
  fs.writeFileSync(`screenshots/${name}.png`, shot, 'base64');
}

it('should work', async () => {
  await screenshot(page.driver, 'step-1');
  await page.action();
  await screenshot(page.driver, 'step-2');
});
```

### Check Page HTML
```typescript
const html = await driver.getPageSource();
console.log(html);
```

### Get Console Logs
```typescript
const logs = await driver.manage().logs().get('browser');
logs.forEach(log => console.log(log.message));
```

### Slow Down Test Execution
```typescript
// Add waits between actions
async function slowFill(element: SanElement, text: string) {
  for (const char of text) {
    await element.sendKeys(char);
    await driver.sleep(50);
  }
}
```

## Getting Help

### Check Logs
```bash
# View latest log file
tail -f logs/test-*.log

# Search for errors
grep -i error logs/test-*.log
```

### Check Cache
```bash
# View locator cache
cat .locator-cache/cache-master.json

# View snapshots
cat .locator-cache/dom-snapshots/dom-before.json
cat .locator-cache/dom-snapshots/dom-after.json
```

### Run Single Test
```bash
# Narrow down issue
npm test -- --grep "should add todo"
```

### Run with Full Output
```bash
# See all output
npm run test:dev
```

## Next Steps

- [Advanced Topics](06-advanced.md)
- [API Reference](11-api-reference.md)
- [Support](12-support.md)
