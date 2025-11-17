import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import { BrowserType } from '../types/Enums';
import { BrowserConfig } from '../types/ConfigTypes';
import { logger } from '../utils/Logger';
import { FIREFOX_ARGS, CHROME_ARGS } from '../config/Constants';

export interface BrowserFactory {
  createWebDriver(config: BrowserConfig): Promise<WebDriver>;
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
  protected abstract createBuilder(config: BrowserConfig): Builder;

  async createWebDriver(config: BrowserConfig): Promise<WebDriver> {
    const browserName = this.getBrowserName();
    
    try {
      logger.debug(`Creating ${browserName} driver with headless=${config.headless}`);

      const builder = this.createBuilder(config);
      return await builder.build();
    } catch (error) {
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

  protected createBuilder(config: BrowserConfig): Builder {
    const chromeOptions = new chrome.Options();

    // Apply headless mode
    if (config.headless) {
      chromeOptions.addArguments(CHROME_ARGS.HEADLESS);
    }

    // Apply Chrome-specific no-sandbox
    if (config.noSandbox) {
      chromeOptions.addArguments(CHROME_ARGS.NO_SANDBOX, CHROME_ARGS.DISABLE_DEV_SHM);
    }

    // Add additional arguments
    if (config.args && config.args.length > 0) {
      chromeOptions.addArguments(...config.args);
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

  protected createBuilder(config: BrowserConfig): Builder {
    const firefoxOptions = new firefox.Options();

    // Apply headless mode
    if (config.headless) {
      firefoxOptions.addArguments(FIREFOX_ARGS.HEADLESS);
    }

    // Add additional arguments
    if (config.args && config.args.length > 0) {
      firefoxOptions.addArguments(...config.args);
    }

    return new Builder().forBrowser(this.getBrowserName()).setFirefoxOptions(firefoxOptions);
  }
}
