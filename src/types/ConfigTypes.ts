import { BrowserType } from './Enums';

/**
 * Browser configuration with complete settings
 */
export interface BrowserConfig {
  name: BrowserType;
  headless: boolean;
  noSandbox: boolean;
}