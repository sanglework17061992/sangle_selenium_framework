import { WebDriver } from 'selenium-webdriver';
import { BrowserType, ExecutionMode } from '@enums';
import { configLoader, ConfigLoader } from '@config/ConfigLoader';
import { logger, Logger } from '@utils/Logger';
import { BrowserFactory, ChromeFactory, FirefoxFactory, BrowserRegistry } from '@browser';
import type { BrowserConfig } from '@configTypes';

/**
 * Instance-based driver manager with dependency injection
 * Handles driver lifecycle and provides controlled access
 * Auto-detects parallel vs sequential mode from MOCHA_WORKER_ID
 */
export class DriverManager {
  private currentDriver: WebDriver | null = null;
  private readonly registry: BrowserRegistry;
  private readonly isParallel: boolean;
  private readonly workerId: string;
  private readonly drivers: Map<string, WebDriver> = new Map();

  constructor(
    private readonly config: ConfigLoader,
    private readonly log: Logger,
    registry?: BrowserRegistry
  ) {
    this.registry = registry || this.createDefaultRegistry();
    
    // Auto-detect parallel mode from Mocha environment
    this.isParallel = !!process.env.MOCHA_WORKER_ID;
    this.workerId = process.env.MOCHA_WORKER_ID || 'main';
    
    this.log.info(`DriverManager initialized - Mode: ${this.getMode().toUpperCase()}, Worker: ${this.workerId}`);
  }

  /**
   * Get driver key for parallel/sequential mode
   * Ensures consistent key format across all operations
   */
  private getDriverKey(): string {
    return `driver-${this.workerId}`;
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
   * In parallel mode: creates/reuses per-worker driver
   * In sequential mode: creates single driver
   */
  async createDriver(name?: string, additionalConfig?: Partial<BrowserConfig>): Promise<WebDriver> {
    try {
      const browserConfig = this.config.getBrowserConfig();
      const browserName = name || browserConfig.name;
      const driverKey = this.getDriverKey();

      // In parallel mode, check if driver already exists for this worker
      if (this.isParallel && this.drivers.has(driverKey)) {
        this.log.info(`[Worker ${this.workerId}] Reusing existing ${browserName} driver`);
        this.currentDriver = this.drivers.get(driverKey)!;
        return this.currentDriver;
      }

      const modeLabel = this.isParallel ? `[Worker ${this.workerId}]` : '[Sequential]';
      this.log.info(`${modeLabel} Initializing ${browserName} driver`);

      const factory = this.registry.get(browserName);
      
      // Merge additional config if provided
      const finalConfig = additionalConfig 
        ? { ...browserConfig, ...additionalConfig }
        : browserConfig;
        
      const driver = await factory.createWebDriver(finalConfig);
      
      this.currentDriver = driver;
      
      // Store driver in parallel map if in parallel mode
      if (this.isParallel) {
        this.drivers.set(driverKey, driver);
        this.log.info(`${modeLabel} ${browserName} driver created successfully`);
      } else {
        this.log.info(`${browserName} driver created successfully`);
      }
      
      return driver;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.log.error(`Failed to create driver: ${errorMsg}`);
      throw error;
    }
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
   * Quit driver
   * In parallel mode: quits worker-specific driver
   * In sequential mode: quits single driver
   */
  async quitDriver(): Promise<void> {
    if (this.currentDriver) {
      try {
        await this.currentDriver.quit();
        const driverKey = this.getDriverKey();
        
        if (this.isParallel) {
          this.drivers.delete(driverKey);
          this.log.info(`[Worker ${this.workerId}] Driver quit successfully`);
        } else {
          this.log.info('Driver quit successfully');
        }
      } catch (error) {
        this.log.error(`Error quitting driver: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        this.currentDriver = null;
      }
    }
  }

  /**
   * Get execution mode
   */
  getMode(): ExecutionMode {
    return this.isParallel ? ExecutionMode.PARALLEL : ExecutionMode.SEQUENTIAL;
  }

  /**
   * Get worker ID
   */
  getWorkerId(): string {
    return this.workerId;
  }

  /**
   * Get active driver count (for monitoring)
   */
  getActiveDriverCount(): number {
    return this.drivers.size;
  }
}

// Export default instance
export const defaultDriverManager = new DriverManager(configLoader, logger);

export default defaultDriverManager;
