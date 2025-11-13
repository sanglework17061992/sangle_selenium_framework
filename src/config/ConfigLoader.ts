import { config } from 'dotenv';
import { BrowserType, LogLevel } from '../types/Enums';
import { BrowserConfig, TimeoutConfig } from '../types/ConfigTypes';
import { DEFAULT_CONFIG, VALIDATION } from './Constants';

// Load environment variables from .env file
config();

/**
 * ConfigLoader - Loads configuration from environment variables
 * Provides type-safe access to framework configuration
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
   * Validate and parse timeout value
   */
  private validateTimeout(value: string, name: string): number {
    const timeout = Number.parseInt(value, 10);
    
    if (Number.isNaN(timeout)) {
      throw new TypeError(`${name} must be a valid number`);
    }
    
    if (timeout < VALIDATION.MIN_TIMEOUT || timeout > VALIDATION.MAX_TIMEOUT) {
      throw new Error(
        `${name} must be between ${VALIDATION.MIN_TIMEOUT} and ${VALIDATION.MAX_TIMEOUT}ms`
      );
    }
    
    return timeout;
  }

  /**
   * Get timeout configuration in milliseconds
   */
  getTimeoutConfig(): TimeoutConfig {
    return {
      default: this.validateTimeout(
        process.env.DEFAULT_TIMEOUT || String(DEFAULT_CONFIG.TIMEOUT),
        'DEFAULT_TIMEOUT'
      ),
      element: this.validateTimeout(
        process.env.ELEMENT_TIMEOUT || String(DEFAULT_CONFIG.ELEMENT_TIMEOUT),
        'ELEMENT_TIMEOUT'
      ),
      pageLoad: this.validateTimeout(
        process.env.PAGE_LOAD_TIMEOUT || String(DEFAULT_CONFIG.PAGE_LOAD_TIMEOUT),
        'PAGE_LOAD_TIMEOUT'
      )
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
