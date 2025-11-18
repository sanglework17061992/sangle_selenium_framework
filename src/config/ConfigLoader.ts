import { config } from 'dotenv';
import { BrowserType, LogLevel, ConfigType, ConfigKey } from '../types/Enums';
import { BrowserConfig, TimeoutConfig } from '../types/ConfigTypes';
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
   * Generic config parser - converts env values to specified type
   * Supports: STRING, NUMBER, BOOLEAN
   */
  private parseConfig(
    envKey: ConfigKey,
    type: ConfigType,
    defaultValue: any
  ): any {
    const envValue = process.env[envKey];

    if (envValue === undefined) {
      return defaultValue;
    }

    switch (type) {
      case ConfigType.STRING:
        return envValue;
      case ConfigType.NUMBER:
        return Number.parseInt(envValue, 10) || defaultValue;
      case ConfigType.BOOLEAN:
        return envValue.toLowerCase() === 'true';
      default:
        return defaultValue;
    }
  }

  /**
   * Get browser configuration
   */
  getBrowserConfig(): BrowserConfig {
    const browserName = this.parseConfig(ConfigKey.BROWSER, ConfigType.STRING, DEFAULT_CONFIG.BROWSER).toLowerCase();

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
      headless: this.parseConfig(ConfigKey.HEADLESS, ConfigType.BOOLEAN, DEFAULT_CONFIG.HEADLESS),
      noSandbox: this.parseConfig(ConfigKey.NO_SANDBOX, ConfigType.BOOLEAN, DEFAULT_CONFIG.NO_SANDBOX)
    };
  }  
  
  /**
   * Get base URL for application under test
   * @throws Error if BASE_URL is not set
   */
  getBaseUrl(): string {
    const baseUrl = this.parseConfig(ConfigKey.BASE_URL, ConfigType.STRING, '');
    
    if (!baseUrl || baseUrl.trim() === '') {
      throw new Error('BASE_URL is not configured in .env file');
    }

    return baseUrl;
  }

  /**
   * Get log level from configuration
   */
  getLogLevel(): LogLevel {
    const level = this.parseConfig(ConfigKey.LOG_LEVEL, ConfigType.STRING, DEFAULT_CONFIG.LOG_LEVEL).toLowerCase();
    
    if (Object.values(LogLevel).includes(level as LogLevel)) {
      return level as LogLevel;
    }
    
    return LogLevel.INFO;
  }

  /**
   * Get timeout configuration for element operations
   */
  getTimeoutConfig(): TimeoutConfig {
    const elementTimeout = this.parseConfig(ConfigKey.ELEMENT_TIMEOUT, ConfigType.NUMBER, DEFAULT_CONFIG.ELEMENT_TIMEOUT);

    return {
      element: elementTimeout
    };
  }
}

// Export singleton instance
export const configLoader = ConfigLoader.getInstance();
