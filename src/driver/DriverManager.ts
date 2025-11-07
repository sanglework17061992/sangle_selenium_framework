import { Builder, WebDriver, ThenableWebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import { configLoader, BrowserType } from '../config/ConfigLoader';

export type BrowserName = BrowserType | string;

export interface BrowserFactory {
  createWebDriver(options?: any): Promise<WebDriver>;
}

// Central driver context - framework manages this
export class DriverContext {
  private static currentDriver: ThenableWebDriver | null = null;

  static setDriver(driver: ThenableWebDriver) {
    this.currentDriver = driver;
  }

  static getDriver(): ThenableWebDriver {
    if (!this.currentDriver) {
      throw new Error('Driver not initialized. Call DriverContext.setDriver() first.');
    }
    return this.currentDriver;
  }

  static clearDriver() {
    this.currentDriver = null;
  }
}

class DefaultChromeFactory implements BrowserFactory {
  async createWebDriver(options?: any) {
    const config = configLoader.getBrowserConfig();
    const opts = new chrome.Options();

    if (config.headless || options?.headless) opts.addArguments('--headless=new');
    if (config.noSandbox || options?.noSandbox) opts.addArguments('--no-sandbox', '--disable-dev-shm-usage');

    // Add custom args from config
    if (config.args && config.args.length > 0) {
      opts.addArguments(...config.args);
    }

    // Add any additional args from options
    if (options?.args) {
      opts.addArguments(...options.args);
    }

    return new Builder().forBrowser('chrome').setChromeOptions(opts).build();
  }
}

class DefaultFirefoxFactory implements BrowserFactory {
  async createWebDriver(options?: any) {
    const config = configLoader.getBrowserConfig();
    const opts = new firefox.Options();

    if (config.headless || options?.headless) opts.addArguments('-headless');

    // Add custom args from config
    if (config.args && config.args.length > 0) {
      opts.addArguments(...config.args);
    }

    // Add any additional args from options
    if (options?.args) {
      opts.addArguments(...options.args);
    }

    return new Builder().forBrowser('firefox').setFirefoxOptions(opts).build();
  }
}

export class DriverManager {
  private static readonly factories: Map<string, BrowserFactory> = new Map();

  static register(name: string, factory: BrowserFactory) {
    this.factories.set(name.toLowerCase(), factory);
  }

  static async getDriver(name?: BrowserName, options?: any) {
    const config = configLoader.getBrowserConfig();
    const browserName = name || config.name;

    const factory = this.factories.get(browserName.toLowerCase());
    if (!factory) throw new Error(`No browser registered for: ${browserName}`);
    return factory.createWebDriver(options);
  }

  /**
   * Get driver using configuration from .env file
   */
  static async getConfiguredDriver() {
    const config = configLoader.getBrowserConfig();
    return this.getDriver(config.name);
  }
}

// register defaults
DriverManager.register('chrome', new DefaultChromeFactory());
DriverManager.register('firefox', new DefaultFirefoxFactory());

export default DriverManager;