import { BrowserFactory } from '@driver/BrowserFactory';

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
      throw new Error('Browser name cannot be empty');
    }
    if (!factory) {
      throw new Error('Browser factory is required');
    }
    
    this.factories.set(name.toLowerCase().trim(), factory);
  }

  /**
   * Get a browser factory by name
   */
  get(name: string): BrowserFactory {
    if (!name?.trim()) {
      throw new Error('Browser name cannot be empty');
    }
    
    const factory = this.factories.get(name.toLowerCase().trim());
    if (!factory) {
      const available = Array.from(this.factories.keys()).join(', ');
      throw new Error(`No browser factory registered for: "${name}". Available: ${available}`);
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