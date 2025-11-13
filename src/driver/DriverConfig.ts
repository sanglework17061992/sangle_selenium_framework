import { BrowserConfig } from '../types/ConfigTypes';
import { DriverOptions } from './BrowserFactory';

export class DriverConfig {
  private readonly config: BrowserConfig;
  private options: DriverOptions;

  constructor(baseConfig: BrowserConfig) {
    this.config = { ...baseConfig };
    this.options = {};
  }

  /**
   * Set browser type
   */
  browser(name: string): this {
    this.config.name = name as any;
    return this;
  }

  /**
   * Set headless mode
   */
  headless(enabled: boolean = true): this {
    this.config.headless = enabled;
    return this;
  }

  /**
   * Set no-sandbox mode
   */
  noSandbox(enabled: boolean = true): this {
    this.config.noSandbox = enabled;
    return this;
  }

  /**
   * Add browser arguments
   */
  args(...args: string[]): this {
    this.options.args = [...(this.options.args || []), ...args];
    return this;
  }

  /**
   * Override options
   */
  withOptions(options: DriverOptions): this {
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