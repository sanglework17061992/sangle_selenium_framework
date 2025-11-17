import { config } from 'dotenv';
import { BrowserType, LogLevel } from '../types/Enums';
import { BrowserConfig } from '../types/ConfigTypes';
import { DEFAULT_CONFIG } from './Constants';

// Load environment variables from .env file
config();

/**
 * ConfigLoader - Loads configuration from environment variables
 */
export class ConfigLoader {
  private static instance: ConfigLoader;

  private constructor() {}

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  /**
   * Parse environment variable as boolean with fallback default
   */
  private parseBooleanConfig(envValue: string | undefined, defaultValue: boolean): boolean {
    if (envValue === undefined) {
      return defaultValue;
    }
    return envValue.toLowerCase() === 'true';
  }

  /**
   * Get browser configuration
   */
  getBrowserConfig(): BrowserConfig {
    const browserName = (process.env.BROWSER || DEFAULT_CONFIG.BROWSER).toLowerCase();

    // Validate browser name
    if (browserName.trim() === '') {
      throw new Error('BROWSER cannot be empty');
    }

    // Validate against supported browser types
    const supportedBrowser = Object.values(BrowserType).find(
      type => type.toLowerCase() === browserName
    );

    return {
      name: supportedBrowser || BrowserType.CHROME, // Default to Chrome if unsupported
      headless: this.parseBooleanConfig(process.env.HEADLESS, DEFAULT_CONFIG.HEADLESS),
      noSandbox: this.parseBooleanConfig(process.env.NO_SANDBOX, DEFAULT_CONFIG.NO_SANDBOX)
    };
  }  
  
  /**
   * Get base URL for application under test
   * @throws Error if BASE_URL is not set
   */
  getBaseUrl(): string {
    const baseUrl = process.env.BASE_URL;
    
    if (!baseUrl || baseUrl.trim() === '') {
      throw new Error('BASE_URL is not configured in .env file');
    }

    return baseUrl;
  }

  /**
   * Get log level from configuration
   */
  getLogLevel(): LogLevel {
    const level = (process.env.LOG_LEVEL || DEFAULT_CONFIG.LOG_LEVEL).toLowerCase();
    
    if (Object.values(LogLevel).includes(level as LogLevel)) {
      return level as LogLevel;
    }
    
    return LogLevel.INFO;
  }
}

// Export singleton instance
export const configLoader = ConfigLoader.getInstance();
