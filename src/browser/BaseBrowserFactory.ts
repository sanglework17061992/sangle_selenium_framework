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
export abstract class BaseBrowserFactory implements BrowserFactory {
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
