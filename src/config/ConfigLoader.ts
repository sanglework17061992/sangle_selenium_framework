import { config } from 'dotenv';
import { BrowserType, LogLevel } from '../types/Enums';

// Re-export for convenience
export { BrowserType, LogLevel } from '../types/Enums';

// Load environment variables from .env file
config();

export interface BrowserConfig {
  name: BrowserType;
  headless: boolean;
  noSandbox: boolean;
}

export interface TimeoutConfig {
  default: number;
  element: number;
  pageLoad: number;
}

/**
 * ConfigLoader - Loads configuration from environment variables
 * Provides type-safe access to framework configuration
 */
class ConfigLoader {
  private static instance: ConfigLoader;

  private constructor() {}

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  /**
   * Get browser configuration
   */
  getBrowserConfig(): BrowserConfig {
    const browserName = (process.env.BROWSER || 'chrome').toLowerCase();
    
    return {
      name: browserName === 'firefox' ? BrowserType.FIREFOX : BrowserType.CHROME,
      headless: process.env.HEADLESS === 'true',
      noSandbox: process.env.NO_SANDBOX === 'true'
    };
  }

  /**
   * Get timeout configuration in milliseconds
   */
  getTimeoutConfig(): TimeoutConfig {
    return {
      default: parseInt(process.env.DEFAULT_TIMEOUT || '5000', 10),
      element: parseInt(process.env.ELEMENT_TIMEOUT || '10000', 10),
      pageLoad: parseInt(process.env.PAGE_LOAD_TIMEOUT || '30000', 10)
    };
  }

  /**
   * Get base URL for application under test
   * @throws Error if BASE_URL is not set or invalid
   */
  getBaseUrl(): string {
    const baseUrl = process.env.BASE_URL;
    
    if (!baseUrl || baseUrl.trim() === '') {
      throw new Error(
        'BASE_URL is not configured in .env file. Please set a valid URL.'
      );
    }

    // Validate URL format
    try {
      new URL(baseUrl);
      return baseUrl;
    } catch {
      throw new Error(
        `Invalid BASE_URL in .env file: "${baseUrl}". Please provide a valid URL (e.g., https://example.com)`
      );
    }
  }

  /**
   * Get log level from configuration
   */
  getLogLevel(): LogLevel {
    const level = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
    
    if (Object.values(LogLevel).includes(level as LogLevel)) {
      return level as LogLevel;
    }
    
    return LogLevel.INFO;
  }
}

// Export singleton instance
export const configLoader = ConfigLoader.getInstance();
