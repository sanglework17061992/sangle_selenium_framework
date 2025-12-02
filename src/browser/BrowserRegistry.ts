import { BrowserFactory } from '@browser/BaseBrowserFactory';
import { SanError, ErrorType } from '@errors';

/**
 * Registry for managing browser factories
 * Provides type-safe factory registration and lookup
 */
export class BrowserRegistry {
  private readonly factories = new Map<string, BrowserFactory>();

  /**
   * Register a browser factory
   */
  register(name: string, factory: BrowserFactory): void {
    if (!name?.trim()) {
      throw new SanError('Browser name cannot be empty', {
        type: ErrorType.ConfigurationError,
        configKey: 'BrowserName'
      });
    }
    if (!factory) {
      throw new SanError('Browser factory is required', {
        type: ErrorType.ConfigurationError,
        configKey: 'BrowserFactory'
      });
    }
    
    this.factories.set(name.toLowerCase().trim(), factory);
  }

  /**
   * Get a browser factory by name
   */
  get(name: string): BrowserFactory {
    if (!name?.trim()) {
      throw new SanError('Browser name cannot be empty', {
        type: ErrorType.ConfigurationError,
        configKey: 'BrowserName'
      });
    }
    
    const factory = this.factories.get(name.toLowerCase().trim());
    if (!factory) {
      const available = Array.from(this.factories.keys()).join(', ');
      throw new SanError(`No browser factory registered for: "${name}"`, {
        type: ErrorType.ConfigurationError,
        configKey: `BrowserFactory[${name}]`,
        context: { availableBrowsers: available }
      });
    }
    
    return factory;
  }

  /**
   * Get all registered browser names
   */
  getRegisteredBrowsers(): string[] {
    return Array.from(this.factories.keys());
  }
}