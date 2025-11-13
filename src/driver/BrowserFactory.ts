import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import { BrowserType } from '../types/Enums';
import { BrowserConfig } from '../types/ConfigTypes';
import { logger } from '../utils/Logger';
import { CHROME_ARGS, FIREFOX_ARGS } from '../config/Constants';

export interface DriverOptions {
  headless?: boolean;
  noSandbox?: boolean;
  args?: string[];
}

export interface BrowserFactory {
  createWebDriver(config: BrowserConfig, options?: DriverOptions): Promise<WebDriver>;
}

/**
 * Base factory with proper type safety and extensibility
 * 
 * To add a new browser:
 * 1. Add browser type to BrowserType enum (e.g., EDGE = 'edge')
 * 2. Add browser-specific arguments to Constants.ts (e.g., EDGE_ARGS)
 * 3. Create new factory class extending BaseBrowserFactory
 * 4. Implement getBrowserName() and createBuilder() methods
 * 5. Register factory in DriverManager.createDefaultRegistry()
 * 
 * Example:
 * export class EdgeFactory extends BaseBrowserFactory {
 *   protected getBrowserName(): string { return BrowserType.EDGE; }
 *   protected createBuilder(config, options) { 
 *     // Configure Edge options and return Builder
 *   }
 * }
 */
abstract class BaseBrowserFactory implements BrowserFactory {
  protected abstract getBrowserName(): string;
  protected abstract createBuilder(config: BrowserConfig, options?: DriverOptions): Builder;

  /**
   * Validate and merge configuration options
   */
  protected mergeConfig(config: BrowserConfig, options?: DriverOptions) {
    if (!config) {
      throw new Error('Browser configuration is required');
    }

    return {
      headless: config.headless || options?.headless || false,
      noSandbox: config.noSandbox || options?.noSandbox || false,
      args: options?.args || []
    };
  }

  async createWebDriver(config: BrowserConfig, options?: DriverOptions): Promise<WebDriver> {
    try {
      const merged = this.mergeConfig(config, options);
      const browserName = this.getBrowserName();

      logger.debug(`Creating ${browserName} driver with headless=${merged.headless}`);

      const builder = this.createBuilder(config, options);
      return await builder.build();
    } catch (error) {
      const browserName = this.getBrowserName();
      logger.error(`Failed to create ${browserName} driver: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}

/**
 * Chrome browser factory
 */
export class ChromeFactory extends BaseBrowserFactory {
  protected getBrowserName(): string {
    return BrowserType.CHROME;
  }

  protected createBuilder(config: BrowserConfig, options?: DriverOptions): Builder {
    const chromeOptions = new chrome.Options();
    const merged = this.mergeConfig(config, options);

    // Apply headless mode
    if (merged.headless) {
      chromeOptions.addArguments(CHROME_ARGS.HEADLESS);
    }

    // Apply Chrome-specific no-sandbox
    if (merged.noSandbox) {
      chromeOptions.addArguments(CHROME_ARGS.NO_SANDBOX, CHROME_ARGS.DISABLE_DEV_SHM);
    }

    // Add additional arguments
    if (merged.args.length > 0) {
      chromeOptions.addArguments(...merged.args);
    }

    return new Builder().forBrowser(this.getBrowserName()).setChromeOptions(chromeOptions);
  }
}

/**
 * Firefox browser factory
 */
export class FirefoxFactory extends BaseBrowserFactory {
  protected getBrowserName(): string {
    return BrowserType.FIREFOX;
  }

  protected createBuilder(config: BrowserConfig, options?: DriverOptions): Builder {
    const firefoxOptions = new firefox.Options();
    const merged = this.mergeConfig(config, options);

    // Apply headless mode
    if (merged.headless) {
      firefoxOptions.addArguments(FIREFOX_ARGS.HEADLESS);
    }

    // Add additional arguments
    if (merged.args.length > 0) {
      firefoxOptions.addArguments(...merged.args);
    }

    return new Builder().forBrowser(this.getBrowserName()).setFirefoxOptions(firefoxOptions);
  }
}
