# Advanced Topics

## Parallel Execution

Run tests in parallel across multiple workers for faster execution:

```bash
npm run test:parallel        # 4 workers
npm run test:parallel:8      # 8 workers
```

### How It Works

Each worker gets its own:
- WebDriver instance
- Cache directory
- Log file

Tests are automatically distributed across workers.

### Configuration

In `.mocharc.json`:
```json
{
  "parallel": true,
  "jobs": 4
}
```

### Parallel Best Practices

1. Each test must be independent
2. No shared state between tests
3. Use unique locator cache per worker
4. Clean up after each test

## Multi-Browser Testing

Test across different browsers:

```bash
BROWSER=chrome npm test
BROWSER=firefox npm test
```

### Run with Multiple Browsers

Create a script to run all browsers:

```bash
#!/bin/bash
BROWSER=chrome npm test
BROWSER=firefox npm test
```

### Browser Configuration

Browsers are defined in `src/browser/`:
- `ChromeFactory.ts` - Chrome options
- `FirefoxFactory.ts` - Firefox options

Add new browsers by extending `BaseBrowserFactory`.

## Custom Browser Configuration

Override browser options:

```typescript
// src/browser/CustomFactory.ts
import { BaseBrowserFactory } from './BaseBrowserFactory';
import { Builder } from 'selenium-webdriver';

export class CustomFactory extends BaseBrowserFactory {
  protected configureOptions(): any {
    const options = super.configureOptions();
    options.add_argument('--disable-gpu');
    options.add_argument('--disable-software-rasterizer');
    return options;
  }
}
```

## Test Data Management

### Fixtures

Store test data in fixture files:

```typescript
// tests/fixtures/users.ts
export const USERS = {
  VALID_ADMIN: {
    email: 'admin@example.com',
    password: 'admin123'
  },
  VALID_USER: {
    email: 'user@example.com',
    password: 'user123'
  },
  INVALID: {
    email: 'invalid',
    password: ''
  }
};

// In test
import { USERS } from '../fixtures/users';

it('should login as admin', async () => {
  await page.login(USERS.VALID_ADMIN.email, USERS.VALID_ADMIN.password);
  await expect(page).toHaveURL('/admin');
});
```

### Environment-Specific Data

```typescript
// tests/fixtures/environments.ts
export const ENVIRONMENTS = {
  DEV: {
    url: 'https://dev.example.com',
    username: 'devuser'
  },
  STAGING: {
    url: 'https://staging.example.com',
    username: 'staginguser'
  },
  PROD: {
    url: 'https://example.com',
    username: 'produser'
  }
};

// In test
const env = ENVIRONMENTS[process.env.ENV || 'DEV'];
await page.open(env.url);
```

## Debugging Tests

### Enable Debug Logging

```bash
DEBUG=* npm test
```

### Debug Specific Test

```bash
DEBUG=* npm run test:example
```

### Browser DevTools

Run with head to see browser:

```bash
HEADLESS=false npm test
```

Then use browser DevTools while tests run.

### Taking Screenshots

```typescript
import * as fs from 'fs';
import * as path from 'path';

async function takeScreenshot(driver: WebDriver, filename: string) {
  const screenshot = await driver.takeScreenshot();
  const filepath = path.join(process.cwd(), 'screenshots', filename);
  fs.writeFileSync(filepath, screenshot, 'base64');
}

it('should show error', async () => {
  await page.login('invalid', 'invalid');
  await takeScreenshot(page.driver, 'login-error.png');
});
```

## Custom Reporters

Extend reporting capabilities:

```typescript
// src/reporting/CustomReporter.ts
import { BaseReporter } from './BaseReporter';

export class CustomReporter extends BaseReporter {
  onTestStart(test: Test): void {
    console.log(`Starting: ${test.title}`);
  }

  onTestEnd(test: Test, result: TestResult): void {
    const status = result.passed ? 'PASSED' : 'FAILED';
    console.log(`${test.title}: ${status}`);
  }
}
```

## Performance Optimization

### Reduce Timeouts

In `.env`:
```properties
DEFAULT_TIMEOUT=3000
ELEMENT_TIMEOUT=5000
```

### Use Headless Mode

```bash
HEADLESS=true npm test
```

Headless mode is 20-30% faster than headed.

### Parallel Execution

Run tests in parallel:
```bash
npm run test:parallel:8
```

Can reduce test suite time by 60-80%.

### Lazy Initialization

Only create page objects when needed:

```typescript
class DashboardPage extends BasePage {
  private _settingsPage: SettingsPage;

  get settingsPage(): SettingsPage {
    if (!this._settingsPage) {
      this._settingsPage = new SettingsPage(this.driver);
    }
    return this._settingsPage;
  }
}
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chrome, firefox]
    
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: 18
      
      - run: npm install
      - run: npm run build
      - run: BROWSER=${{ matrix.browser }} npm run test:parallel:8
      
      - uses: actions/upload-artifact@v2
        if: always()
        with:
          name: reports-${{ matrix.browser }}
          path: mochawesome-report/
```

### Jenkins Example

```groovy
pipeline {
  agent any
  
  stages {
    stage('Install') {
      steps {
        sh 'npm install'
      }
    }
    
    stage('Build') {
      steps {
        sh 'npm run build'
      }
    }
    
    stage('Test') {
      steps {
        sh 'npm run test:parallel:8'
      }
    }
    
    stage('Report') {
      steps {
        publishHTML([
          reportDir: 'mochawesome-report',
          reportFiles: 'mochawesome.html'
        ])
      }
    }
  }
}
```

## Next Steps

- [Troubleshooting](10-troubleshooting.md)
