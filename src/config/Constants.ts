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
} as const;

// Default configuration values
export const DEFAULT_CONFIG = {
  BROWSER: BrowserType.CHROME,
  LOG_LEVEL: 'info',
  HEADLESS: false,
  NO_SANDBOX: false,
};
