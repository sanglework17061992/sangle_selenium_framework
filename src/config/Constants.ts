import { BrowserType } from '../types/Enums';

/**
 * Framework constants for browser configurations and defaults
 */

// Browser arguments
export const CHROME_ARGS = {
  HEADLESS: '--headless=new',
  NO_SANDBOX: '--no-sandbox',
  DISABLE_DEV_SHM: '--disable-dev-shm-usage',
} as const;

export const FIREFOX_ARGS = {
  HEADLESS: '-headless',
  PROFILE: '-profile',
} as const;

// Default configuration values
export const DEFAULT_CONFIG = {
  BROWSER: BrowserType.CHROME,
  LOG_LEVEL: 'INFO',
  TIMEOUT: 5000,
  ELEMENT_TIMEOUT: 10000,
  PAGE_LOAD_TIMEOUT: 30000,
};

// Validation constraints
export const VALIDATION = {
  MIN_TIMEOUT: 0,
  MAX_TIMEOUT: 300000, // 5 minutes
};
