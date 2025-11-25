import { Builder, WebDriver } from 'selenium-webdriver';
import type { BrowserConfig } from '@configTypes';
import { logger } from '@utils/Logger';

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
 * 4. Implement getBrowserName() and configureDriverBuilder() methods
 * 5. Register factory in DriverManager.createDefaultRegistry()
 * 
 * Example:
 * export class EdgeFactory extends BaseBrowserFactory {
 *   protected override getBrowserName(): string { return BrowserType.EDGE; }
 *   protected override configureDriverBuilder(config: BrowserConfig): Builder { 
 *     // Configure Edge options and return Builder
 *   }
 * }
 */
export abstract class BaseBrowserFactory implements BrowserFactory {
  protected abstract getBrowserName(): string;
  protected abstract configureDriverBuilder(config: BrowserConfig): Builder;

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
