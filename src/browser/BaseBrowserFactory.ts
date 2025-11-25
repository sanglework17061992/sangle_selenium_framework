import { Builder, WebDriver } from 'selenium-webdriver';
import type { BrowserConfig } from '@configTypes';
import { BrowserType } from '@enums';
import { logger } from '@utils/Logger';

export interface BrowserFactory {
  createWebDriver(config: BrowserConfig): Promise<WebDriver>;
}

/**
 * Generic base factory with proper type safety and extensibility
 * 
 * Generic parameter T ensures type-safe browser name handling at compile time.
 * Each factory specifies its browser type, eliminating magic strings and enabling
 * better IDE support and compile-time checking.
 * 
 * To add a new browser:
 * 1. Add browser type to BrowserType enum (e.g., EDGE = 'edge')
 * 2. Add browser-specific arguments to Constants.ts (e.g., EDGE_ARGS)
 * 3. Create new factory class extending BaseBrowserFactory<BrowserType.EDGE>
 * 4. Implement only configureDriverBuilder() method (getBrowserName() is automatic)
 * 5. Register factory in DriverManager.createDefaultRegistry()
 * 
 * Example:
 * export class EdgeFactory extends BaseBrowserFactory<BrowserType.EDGE> {
 *   protected override configureDriverBuilder(config: BrowserConfig): Builder { 
 *     // Configure Edge options and return Builder
 *   }
 * }
 */
export abstract class BaseBrowserFactory<T extends BrowserType = BrowserType> implements BrowserFactory {
  protected abstract readonly browserName: T;
  protected abstract configureDriverBuilder(config: BrowserConfig): Builder;

  /**
   * Get the browser name for this factory
   * Type-safe and automatically provided by the generic type
   */
  protected getBrowserName(): T {
    return this.browserName;
  }

  /**
   * Check if running in CI environment
   * Supports multiple CI flag formats for flexibility:
   * - true, True, TRUE, yes, Yes, YES, 1, ok, OK (case-insensitive)
   * 
   * Used by browser factories to apply CI-specific stability flags
   * @protected
   */
  protected isCIEnvironment(): boolean {
    const ciValue = process.env.CI?.toLowerCase() ?? '';
    return ['true', 'yes', '1', 'ok'].includes(ciValue);
  }

  async createWebDriver(config: BrowserConfig): Promise<WebDriver> {
    const browserName = this.getBrowserName();
    
    try {
      logger.debug(`Creating ${browserName} driver with headless=${config.headless}`);

      const builder = this.configureDriverBuilder(config);
      return await builder.build();
    } catch (error) {
      logger.error(`Failed to create ${browserName} driver: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}
