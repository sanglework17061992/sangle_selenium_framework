import { BrowserType } from './Enums';

/**
 * Browser configuration with complete settings
 */
export interface BrowserConfig {
  name: BrowserType;
  headless: boolean;
  noSandbox: boolean;
}

/**
 * Browser factory configuration (subset without name)
 * Used by factories that already know which browser they're creating
 */
export interface BrowserFactoryConfig {
  headless: boolean;
  noSandbox: boolean;
}

/**
 * Timeout configuration for waits and operations
 */
export interface TimeoutConfig {
  default: number;
  element: number;
  pageLoad: number;
}