import { WebDriver } from 'selenium-webdriver';
import { BrowserType } from '../types/Enums';
import { configLoader } from '../config/ConfigLoader';
import { logger } from '../utils/Logger';
import { BrowserFactory, DriverOptions, ChromeFactory, FirefoxFactory } from './BrowserFactory';

export type BrowserName = BrowserType | string;
export { DriverOptions, BrowserFactory } from './BrowserFactory';

// Central driver context - framework manages this
export class DriverContext {
  private static currentDriver: WebDriver | null = null;

  static setDriver(driver: WebDriver) {
    this.currentDriver = driver;
  }

  static getDriver(): WebDriver {
    if (!this.currentDriver) {
      throw new Error('Driver not initialized. Call DriverManager.getConfiguredDriver() first.');
    }
    return this.currentDriver;
  }

  static clearDriver() {
    this.currentDriver = null;
  }
}

export class DriverManager {
  private static readonly factories: Map<string, BrowserFactory> = new Map();

  static register(name: string, factory: BrowserFactory) {
    this.factories.set(name.toLowerCase(), factory);
  }

  /**
   * Create driver and store in context
   * Uses .env config if no browser name provided
   */
  static async createDriver(name?: BrowserName, options?: DriverOptions) {
    const config = configLoader.getBrowserConfig();
    const browserName = name || config.name;

    logger.info(`Initializing ${browserName} driver`);

    const factory = this.factories.get(browserName.toLowerCase());
    if (!factory) {
      const error = `No browser registered for: ${browserName}`;
      logger.error(error);
      throw new Error(error);
    }
    
    const driver = await factory.createWebDriver(options);
    DriverContext.setDriver(driver);
    logger.info(`${browserName} driver created successfully`);
    
    return driver;
  }

  /**
   * Quit driver and clear context
   */
  static async quitDriver() {
    const driver = DriverContext.getDriver();
    await driver.quit();
    DriverContext.clearDriver();
    logger.info('Driver quit and context cleared');
  }
}

// Register default browser factories
DriverManager.register(BrowserType.CHROME, new ChromeFactory());
DriverManager.register(BrowserType.FIREFOX, new FirefoxFactory());

export default DriverManager;
