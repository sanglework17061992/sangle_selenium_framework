import { WebDriver } from 'selenium-webdriver';
import { BrowserType } from '../types/Enums';
import { configLoader, ConfigLoader } from '../config/ConfigLoader';
import { logger, Logger } from '../utils/Logger';
import { BrowserFactory, DriverOptions, ChromeFactory, FirefoxFactory } from './BrowserFactory';
import { BrowserRegistry } from './BrowserRegistry';
import { DriverConfig } from './DriverConfig';

/**
 * Instance-based driver manager with dependency injection
 * Handles driver lifecycle and provides controlled access
 */
export class DriverManager {
  private currentDriver: WebDriver | null = null;
  private readonly registry: BrowserRegistry;

  constructor(
    private readonly config: ConfigLoader,
    private readonly log: Logger,
    registry?: BrowserRegistry
  ) {
    this.registry = registry || this.createDefaultRegistry();
  }

  /**
   * Create default registry with Chrome and Firefox
   */
  private createDefaultRegistry(): BrowserRegistry {
    const registry = new BrowserRegistry();
    registry.register(BrowserType.CHROME, new ChromeFactory());
    registry.register(BrowserType.FIREFOX, new FirefoxFactory());
    return registry;
  }

  /**
   * Register a browser factory
   */
  register(name: string, factory: BrowserFactory): void {
    this.registry.register(name, factory);
  }

  /**
   * Create driver with configuration
   */
  async createDriver(name?: string, options?: DriverOptions): Promise<WebDriver> {
    try {
      const browserConfig = this.config.getBrowserConfig();
      const browserName = name || browserConfig.name;

      this.log.info(`Initializing ${browserName} driver`);

      const factory = this.registry.get(browserName);
      const driver = await factory.createWebDriver(browserConfig, options);
      
      this.currentDriver = driver;
      this.log.info(`${browserName} driver created successfully`);
      
      return driver;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.log.error(`Failed to create driver: ${errorMsg}`);
      throw error;
    }
  }

  /**
   * Create driver with fluent configuration
   */
  async createDriverWithConfig(configBuilder: (builder: DriverConfig) => DriverConfig): Promise<WebDriver> {
    const baseConfig = this.config.getBrowserConfig();
    const { config, options } = configBuilder(new DriverConfig(baseConfig)).build();
    
    return this.createDriver(config.name, options);
  }

  /**
   * Get current driver
   */
  getDriver(): WebDriver {
    if (!this.currentDriver) {
      throw new Error('Driver not initialized. Call createDriver() first.');
    }
    return this.currentDriver;
  }

  /**
   * Check if driver is initialized
   */
  hasDriver(): boolean {
    return this.currentDriver !== null;
  }

  /**
   * Quit driver and clear context
   */
  async quitDriver(): Promise<void> {
    if (this.currentDriver) {
      try {
        await this.currentDriver.quit();
        this.log.info('Driver quit successfully');
      } catch (error) {
        this.log.error(`Error quitting driver: ${error instanceof Error ? error.message : 'Unknown error'}`);
        throw error;
      } finally {
        this.currentDriver = null;
      }
    }
  }

  /**
   * Get available browser names
   */
  getAvailableBrowsers(): string[] {
    return this.registry.getRegisteredBrowsers();
  }
}

// Export default instance for convenience (backwards compatibility)
export const defaultDriverManager = new DriverManager(configLoader, logger);

export default defaultDriverManager;
