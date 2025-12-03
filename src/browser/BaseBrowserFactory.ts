import { Builder, WebDriver } from 'selenium-webdriver';
import type { BrowserConfig } from '@configTypes';
import { BrowserType } from '@enums';
import { logger } from '@utils/Logger';
import { SanError, ErrorType } from '@errors';

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
 * 4. Implement only getOptionsObject() and configureOptions() methods
 * 5. Register factory in DriverManager.createDefaultRegistry()
 * 
 * Example:
 * export class EdgeFactory extends BaseBrowserFactory<BrowserType.EDGE> {
 *   protected getOptionsObject(config): EdgeOptions { return new edge.Options(); }
 *   protected configureOptions(options, config): void { 
 *     // Configure Edge-specific options
 *   }
 * }
 */
export abstract class BaseBrowserFactory<T extends BrowserType = BrowserType> implements BrowserFactory {
  protected abstract readonly browserName: T;
  
  /**
   * Get browser options object (Chrome, Firefox, etc.)
   * Subclasses must return the appropriate browser options instance
   */
  protected abstract getOptionsObject(config: BrowserConfig): any;
  
  /**
   * Configure browser-specific options
   * Subclasses implement browser-specific configuration here
   * 
   * Default implementation does nothing - override only if needed
   * @protected
   */
  protected configureOptions(options: any, config: BrowserConfig): void {
    // Default: no browser-specific configuration
    // Subclasses can override if needed (e.g., Chrome adds no-sandbox)
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

  /**
   * Apply common configuration options to browser options object
   * Handles headless mode and custom arguments
   * @protected
   */
  protected applyCommonOptions(options: any, config: BrowserConfig): void {
    // Apply headless mode
    if (config.headless) {
      options.addArguments(this.getHeadlessArg());
    }

    // Add additional arguments
    if (config.args && config.args.length > 0) {
      options.addArguments(...config.args);
    }
  }

  /**
   * Get headless argument for this browser
   * Subclasses can override if needed
   * @protected
   */
  protected getHeadlessArg(): string {
    // Default headless arg - subclasses may override
    return '--headless';
  }

  /**
   * Configure and return builder with browser options
   * This template method handles the boilerplate, reducing duplication
   * @protected
   */
  protected configureDriverBuilder(config: BrowserConfig): Builder {
    const options = this.getOptionsObject(config);
    
    // Apply browser-specific configuration
    this.configureOptions(options, config);
    
    // Apply common configuration (headless, custom args)
    this.applyCommonOptions(options, config);
    
    return this.createBuilderWithOptions(options);
  }

  /**
   * Create builder with configured options
   * Subclasses can override for browser-specific builder setup
   * @protected
   */
  protected abstract createBuilderWithOptions(options: any): Builder;

  async createWebDriver(config: BrowserConfig): Promise<WebDriver> {
    try {
      logger.debug(`Creating ${this.browserName} driver with headless=${config.headless}`);

      const builder = this.configureDriverBuilder(config);
      return await builder.build();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new SanError(`Failed to create ${this.browserName} driver`, {
        type: ErrorType.ActionabilityError,
        operation: 'createWebDriver',
        reason: errorMessage,
        context: {
          browserName: this.browserName,
          headless: config.headless,
          noSandbox: config.noSandbox
        },
        lastError: error instanceof Error ? error : undefined
      });
    }
  }
}
