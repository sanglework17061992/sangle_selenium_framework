# SaniumTS Selenium Framework

A small TypeScript Selenium framework that demonstrates 4 layers requested:
- SanElement (custom web element wrapper with auto-wait)
- Assertion helpers with retry
- DriverManager (register additional browsers easily)
- Test layer using Page Object Model

## Configuration

The framework uses environment-based configuration via `.env` files. Copy the provided `.env` file and modify values for your environment:

```bash
cp .env .env.local  # for local overrides
```

### Configuration Options

- **Browser Settings**: `BROWSER`, `HEADLESS`, `NO_SANDBOX`, `CHROME_ARGS`, `FIREFOX_ARGS`
- **Timeouts**: `DEFAULT_TIMEOUT`, `ELEMENT_TIMEOUT`, `PAGE_LOAD_TIMEOUT`
- **Test Settings**: `ENVIRONMENT`, `RETRY_COUNT`, `RETRY_INTERVAL`, `PARALLEL`, `THREAD_COUNT`
- **Application URLs**: `BASE_URL`, `LOGIN_URL`, `PRODUCTS_URL`
- **Credentials**: `USERNAME`, `PASSWORD`
- **Logging**: `LOG_LEVEL`, `LOG_FILE`
- **Reporting**: `SCREENSHOT_ON_FAILURE`, `VIDEO_RECORDING`

## Quick start
1. Install dependencies:
```bash
npm install
```
2. Configure your environment in `.env` file
3. Run tests:
```bash
npm test
```

## How to add a new browser
Register a new factory in `src/driver/DriverManager.ts` using `DriverManager.register('mybrowser', myFactory)`; `myFactory` must implement `build()` that returns a `ThenableWebDriver`.

## Page Object Model

Create page classes that extend `BasePage` and define element locators:

```typescript
import { BasePage } from './src/pages/BasePage';

export class LoginPage extends BasePage {
  // User-friendly locator declarations
  usernameField = this.byId('username');
  passwordField = this.byName('password');
  loginButton = this.byCss('button[type="submit"]');
  errorMessage = this.byXpath('//div[@class="error"]');

  // Alternative shorthand syntax
  // usernameField = this.id('username');
  // passwordField = this.name('password');
  // loginButton = this.css('button[type="submit"]');
  // errorMessage = this.xpath('//div[@class="error"]');

  async login(username: string, password: string) {
    await this.usernameField.type(username);
    await this.passwordField.type(password);
    await this.loginButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.getText();
  }
}
```

### Available Locator Helpers

- `byCss(selector)` / `css(selector)` - CSS selector
- `byId(id)` / `id(id)` - Element ID
- `byXpath(xpath)` / `xpath(xpath)` - XPath expression
- `byName(name)` / `name(name)` - Name attribute
- `byTag(tagName)` / `tag(tagName)` - Tag name
- `byClass(className)` / `className(className)` - Class name

### Legacy Locator Syntax (Still Supported)

```typescript
// Old verbose syntax (still works)
usernameField = this.$({ using: 'css', value: 'input[name="username"]' });
```

## Assertions

The framework provides a modern Playwright-style fluent assertion API with automatic retry logic.

```typescript
import { expectElement } from './src/assertion/FluentAssertions';

// Text assertions
await expectElement(page.title).toHaveText('Expected Title');
await expectElement(page.description).toContainText('partial text');

// Visibility assertions
await expectElement(button).toBeVisible();
await expectElement(loadingSpinner).toBeHidden();

// State assertions
await expectElement(submitButton).toBeEnabled();
await expectElement(disabledButton).toBeDisabled();

// Attribute assertions
await expectElement(link).toHaveAttribute('href', 'https://example.com');
await expectElement(input).toHaveAttributeContaining('class', 'form-control');

// CSS class assertions
await expectElement(button).toHaveClass('btn-primary');

// Value assertions (for inputs)
await expectElement(input).toHaveValue('expected value');
await expectElement(textarea).toHaveValueContaining('partial');
```

All assertions include automatic retry logic based on your `.env` configuration (`RETRY_COUNT` and `RETRY_INTERVAL`).