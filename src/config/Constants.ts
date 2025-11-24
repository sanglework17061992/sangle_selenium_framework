import { BrowserType } from '@enums';

/**
 * Framework constants for browser configurations and defaults
 */

// Browser arguments
export const CHROME_ARGS = {
  HEADLESS: '--headless=new',
  NO_SANDBOX: '--no-sandbox',
  DISABLE_DEV_SHM: '--disable-dev-shm-usage',
  DISABLE_GPU: '--disable-gpu',
  DISABLE_CRASH_REPORTER: '--disable-crash-reporter',
  NO_FIRST_RUN: '--no-first-run',
  NO_DEFAULT_BROWSER_CHECK: '--no-default-browser-check',
} as const;

export const FIREFOX_ARGS = {
  HEADLESS: '-headless',
} as const;

// Default configuration values
export const DEFAULT_CONFIG = {
  BROWSER: BrowserType.CHROME,
  LOG_LEVEL: 'info',
  HEADLESS: false,
  NO_SANDBOX: false,
  ELEMENT_TIMEOUT: 30000,
};

// Framework timing constants
export const TIMING = {
  DEFAULT_RETRY_INTERVAL: 100,
  DEFAULT_ASSERTION_TIMEOUT: 5000,
  STABILITY_CHECK_DELAY: 250,
  STALE_RETRY_DELAY: 100,
  MAX_STALE_RETRIES: 3,
} as const;
