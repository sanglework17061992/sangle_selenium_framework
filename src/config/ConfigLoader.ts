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
   * Get browser configuration
   */
  getBrowserConfig(): BrowserConfig {
    const browserName = (process.env.BROWSER || DEFAULT_CONFIG.BROWSER).toLowerCase();
    
    // Validate browser name
    if (browserName.trim() === '') {
      throw new Error('BROWSER cannot be empty');
    }
    
    return {
      name: browserName === BrowserType.FIREFOX ? BrowserType.FIREFOX : BrowserType.CHROME,
      headless: process.env.HEADLESS === 'true',
      noSandbox: process.env.NO_SANDBOX === 'true'
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
    const level = (process.env.LOG_LEVEL || DEFAULT_CONFIG.LOG_LEVEL).toUpperCase();
    
    if (Object.values(LogLevel).includes(level as LogLevel)) {
      return level as LogLevel;
    }
    
    return LogLevel.INFO;
  }
}

// Export singleton instance
export const configLoader = ConfigLoader.getInstance();
