# SaniumTS Selenium Framework

A modern TypeScript Selenium framework with type-safe configuration and flexible driver management.

## Installation

```bash
npm install
npm run build
```

## Configuration

Create a `.env` file:

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

## Project Structure

```
src/
├── config/
│   └── ConfigLoader.ts    # Configuration management
├── driver/
│   └── DriverManager.ts   # WebDriver factory
└── types/
    └── Enums.ts           # Type-safe enums
```

## Features

- ✅ TypeScript with full type safety
- ✅ Multi-browser support (Chrome, Firefox)
- ✅ Environment-based configuration
- ✅ Extensible driver factory pattern