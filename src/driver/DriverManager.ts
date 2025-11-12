import { Builder, WebDriver, ThenableWebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import { configLoader, BrowserType } from '../config/ConfigLoader';

export type BrowserName = BrowserType | string;

export interface DriverOptions {
  headless?: boolean;
  noSandbox?: boolean;
  args?: string[];
}

export interface BrowserFactory {
  createWebDriver(options?: DriverOptions): Promise<WebDriver>;
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

type BrowserOptions = chrome.Options | firefox.Options;

// Base factory to eliminate duplication
abstract class BaseBrowserFactory implements BrowserFactory {
  protected abstract createOptions(): BrowserOptions;
  protected abstract getBrowserName(): string;
  protected abstract applyHeadlessMode(opts: BrowserOptions): void;
  protected abstract configureBuilder(builder: Builder, opts: BrowserOptions): Builder;

  async createWebDriver(options?: DriverOptions): Promise<WebDriver> {
    const config = configLoader.getBrowserConfig();
    const opts = this.createOptions();

    // Apply headless mode
    if (config.headless || options?.headless) {
      this.applyHeadlessMode(opts);
    }

    // Apply no-sandbox (Chrome-specific)
    if ((config.noSandbox || options?.noSandbox) && opts instanceof chrome.Options) {
      opts.addArguments('--no-sandbox', '--disable-dev-shm-usage');
    }

    // Add custom args from config
    if (config.args && config.args.length > 0) {
      opts.addArguments(...config.args);
    }

    // Add any additional args from options
    if (options?.args) {
      opts.addArguments(...options.args);
    }

    return this.configureBuilder(new Builder().forBrowser(this.getBrowserName()), opts).build();
  }
}

class DefaultChromeFactory extends BaseBrowserFactory {
  protected createOptions(): chrome.Options {
    return new chrome.Options();
  }

  protected getBrowserName(): string {
    return BrowserType.CHROME;
  }

  protected applyHeadlessMode(opts: BrowserOptions): void {
    (opts as chrome.Options).addArguments('--headless=new');
  }

  protected configureBuilder(builder: Builder, opts: BrowserOptions): Builder {
    return builder.setChromeOptions(opts as chrome.Options);
  }
}

class DefaultFirefoxFactory extends BaseBrowserFactory {
  protected createOptions(): firefox.Options {
    return new firefox.Options();
  }

  protected getBrowserName(): string {
    return BrowserType.FIREFOX;
  }

  protected applyHeadlessMode(opts: BrowserOptions): void {
    (opts as firefox.Options).addArguments('-headless');
  }

  protected configureBuilder(builder: Builder, opts: BrowserOptions): Builder {
    return builder.setFirefoxOptions(opts as firefox.Options);
  }
}

export class DriverManager {
  private static readonly factories: Map<string, BrowserFactory> = new Map();

  static register(name: string, factory: BrowserFactory) {
    this.factories.set(name.toLowerCase(), factory);
  }

  static async getDriver(name?: BrowserName, options?: DriverOptions) {
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
DriverManager.register(BrowserType.CHROME, new DefaultChromeFactory());
DriverManager.register(BrowserType.FIREFOX, new DefaultFirefoxFactory());

export default DriverManager;
