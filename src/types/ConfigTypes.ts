import { BrowserType } from '@enums';

/**
 * Browser configuration with complete settings
 */
export interface BrowserConfig {
  name: BrowserType;
  headless: boolean;
  noSandbox: boolean;
  args?: string[];
}

/**
 * Timeout configuration for element operations
 */
export interface TimeoutConfig {
  element: number;
}