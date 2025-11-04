import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import { configLoader } from '../config/ConfigLoader';

export type BrowserName = 'chrome' | 'firefox' | string;

export interface BrowserFactory {
  build(options?: any): Promise<WebDriver>;
}

class DefaultChromeFactory implements BrowserFactory {
  async build(options?: any) {
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
  async build(options?: any) {
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
  private static factories: Map<string, BrowserFactory> = new Map();

  static register(name: string, factory: BrowserFactory) {
    this.factories.set(name.toLowerCase(), factory);
  }

  static async getDriver(name?: BrowserName, options?: any) {
    const config = configLoader.getBrowserConfig();
    const browserName = name || config.name;

    const factory = this.factories.get(browserName.toLowerCase());
    if (!factory) throw new Error(`No browser registered for: ${browserName}`);
    return factory.build(options);
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