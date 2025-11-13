import { WebDriver } from 'selenium-webdriver';
import { BrowserType } from '../types/Enums';
import { configLoader } from '../config/ConfigLoader';
import { logger } from '../utils/Logger';
import { BrowserFactory, DriverOptions, ChromeFactory, FirefoxFactory } from './BrowserFactory';

/**
 * Central driver manager with context
 * Handles driver lifecycle and provides global access
 */
export class DriverManager {
  private static currentDriver: WebDriver | null = null;
  private static readonly factories: Map<string, BrowserFactory> = new Map();

  /**
   * Register a browser factory
   */
  static register(name: string, factory: BrowserFactory) {
    this.factories.set(name.toLowerCase(), factory);
  }

  /**
   * Create driver and store for global access
   */
  static async createDriver(name?: string, options?: DriverOptions) {
    const config = configLoader.getBrowserConfig();
    const browserName = (name || config.name).toLowerCase();

    logger.info(`Initializing ${browserName} driver`);

    const factory = this.factories.get(browserName);
    if (!factory) {
      throw new Error(`No browser registered for: ${browserName}`);
    }
    
    const driver = await factory.createWebDriver(config, options);
    this.currentDriver = driver;
    logger.info(`${browserName} driver created successfully`);
    
    return driver;
  }

  /**
   * Get current driver
   */
  static getDriver(): WebDriver {
    if (!this.currentDriver) {
      throw new Error('Driver not initialized. Call DriverManager.createDriver() first.');
    }
    return this.currentDriver;
  }

  /**
   * Quit driver and clear context
   */
  static async quitDriver() {
    if (this.currentDriver) {
      await this.currentDriver.quit();
      this.currentDriver = null;
      logger.info('Driver quit successfully');
    }
  }
}

// Register default browser factories
DriverManager.register(BrowserType.CHROME, new ChromeFactory());
DriverManager.register(BrowserType.FIREFOX, new FirefoxFactory());

export default DriverManager;
