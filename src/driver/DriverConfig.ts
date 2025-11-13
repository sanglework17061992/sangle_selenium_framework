import { BrowserConfig } from '../config/ConfigLoader';
import { DriverOptions } from './BrowserFactory';

/**
 * Builder for driver configuration
 * Provides fluent API for creating driver configs
 */
export class DriverConfig {
  private config: BrowserConfig;
  private options: DriverOptions;

  constructor(baseConfig: BrowserConfig) {
    this.config = { ...baseConfig };
    this.options = {};
  }

  /**
   * Set browser type
   */
  browser(name: string): DriverConfig {
    this.config.name = name as any; // Will be validated by registry
    return this;
  }

  /**
   * Set headless mode
   */
  headless(enabled: boolean = true): DriverConfig {
    this.config.headless = enabled;
    return this;
  }

  /**
   * Set no-sandbox mode
   */
  noSandbox(enabled: boolean = true): DriverConfig {
    this.config.noSandbox = enabled;
    return this;
  }

  /**
   * Add browser arguments
   */
  args(...args: string[]): DriverConfig {
    this.options.args = [...(this.options.args || []), ...args];
    return this;
  }

  /**
   * Override options
   */
  withOptions(options: DriverOptions): DriverConfig {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * Build the configuration
   */
  build(): { config: BrowserConfig; options: DriverOptions } {
    return {
      config: { ...this.config },
      options: { ...this.options }
    };
  }
}