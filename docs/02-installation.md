# Installation

## Prerequisites

- Node.js 14+ and npm
- Chrome or Firefox browser
- Git (for version control)

## Step 1: Clone Repository

```bash
git clone https://github.com/sanglework17061992/sangle_selenium_framework.git
cd sangle_selenium_framework
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `selenium-webdriver` - WebDriver client
- `mocha` - Test runner
- `chai` - Assertion library
- `typescript` - TypeScript compiler
- `winston` - Logging library
- `allure-mocha` - Allure reporting
- `mochawesome` - HTML reporting

## Step 3: Build TypeScript

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` folder.

## Step 4: Configure Environment

Create `.env` file in project root:

```properties
# Browser Configuration
BROWSER=chrome
HEADLESS=false
NO_SANDBOX=true

# Application URLs
BASE_URL=https://demo.playwright.dev/

# Timeouts (in milliseconds)
DEFAULT_TIMEOUT=5000
ELEMENT_TIMEOUT=10000
PAGE_LOAD_TIMEOUT=30000
```

## Supported Browsers

- **Chrome** (default) - Set `BROWSER=chrome`
- **Firefox** - Set `BROWSER=firefox`
- More browsers can be added via factory pattern

## Headless Mode

Run tests without GUI:

```bash
HEADLESS=true npm test
```

## Next Steps

- [Writing Tests](03-writing-tests.md)
- [Page Objects](04-page-objects.md)
- [Assertions](05-assertions.md)
