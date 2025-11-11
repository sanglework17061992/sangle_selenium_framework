import { config } from 'dotenv';
import { BrowserType, LogLevel, ReporterType } from '../types/Enums';

// Re-export enums for backward compatibility with existing imports
export { BrowserType, EnvironmentType, LogLevel, ReporterType } from '../types/Enums';

// Load environment variables from .env file
config();

export interface BrowserConfig {
  name: BrowserType;
  headless: boolean;
  noSandbox: boolean;
  args: string[];
}

export interface TimeoutConfig {
  default: number;
  element: number;
  pageLoad: number;
}

export interface TestConfig {
  retryCount: number;
  retryInterval: number;
  parallel: boolean;
  threadCount: number;
}

export interface LoggingConfig {
  level: LogLevel;
  file: string;
}

export interface ReportingConfig {
  screenshotOnFailure: boolean;
  videoRecording: boolean;
  reporterType: ReporterType;
}

export interface AppConfig {
  baseUrl: string;
  username: string;
  password: string;
}

export interface FrameworkConfig {
  browser: BrowserConfig;
  timeouts: TimeoutConfig;
  test: TestConfig;
  logging: LoggingConfig;
  reporting: ReportingConfig;
  app: AppConfig;
}

/**
 * Generic helper to get environment variable with type conversion
 */
const getEnv = <T>(
  key: string,
  defaultValue: T,
  converter?: (value: string) => T
): T => {
  const value = process.env[key];
  if (!value) return defaultValue;
  
  try {
    return converter ? converter(value) : (value as unknown as T);
  } catch {
    return defaultValue;
  }
};

/**
 * Generic helper to parse enum values from environment variables
 */
const parseEnum = <T extends string>(
  key: string,
  defaultValue: T,
  enumObject: Record<string, T>,
  transform: 'uppercase' | 'lowercase' | 'none' = 'lowercase'
): T => {
  return getEnv(key, defaultValue, (value) => {
    let transformedValue = value;
    
    if (transform === 'uppercase') {
      transformedValue = value.toUpperCase();
    } else if (transform === 'lowercase') {
      transformedValue = value.toLowerCase();
    }
    
    if (Object.values(enumObject).includes(transformedValue as T)) {
      return transformedValue as T;
    }
    
    throw new Error(`Invalid ${key} enum value: ${value}`);
  });
};

/**
 * ConfigLoader - Singleton for managing framework configuration
 */
export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: FrameworkConfig;

  private constructor() {
    this.config = this.buildConfiguration();
  }

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  /**
   * Build complete configuration from environment variables
   */
  private buildConfiguration(): FrameworkConfig {
    const browserName = parseEnum('BROWSER', BrowserType.CHROME, BrowserType);
    
    // Get browser-specific arguments
    const argKey = browserName === BrowserType.CHROME ? 'CHROME_ARGS' : 'FIREFOX_ARGS';
    const argsString = getEnv<string>(argKey, '');
    const args: string[] = argsString ? argsString.split(',').filter(Boolean) : [];

    return {
      browser: {
        name: browserName,
        headless: getEnv('HEADLESS', false, (v) => v.toLowerCase() === 'true'),
        noSandbox: getEnv('NO_SANDBOX', true, (v) => v.toLowerCase() === 'true'),
        args
      },
      timeouts: {
        default: getEnv('DEFAULT_TIMEOUT', 5000, Number),
        element: getEnv('ELEMENT_TIMEOUT', 10000, Number),
        pageLoad: getEnv('PAGE_LOAD_TIMEOUT', 30000, Number)
      },
      test: {
        retryCount: getEnv('RETRY_COUNT', 3, Number),
        retryInterval: getEnv('RETRY_INTERVAL', 500, Number),
        parallel: getEnv('PARALLEL', false, (v) => v.toLowerCase() === 'true'),
        threadCount: getEnv('THREAD_COUNT', 2, Number)
      },
      logging: {
        level: parseEnum('LOG_LEVEL', LogLevel.INFO, LogLevel, 'uppercase'),
        file: getEnv('LOG_FILE', './logs/test.log')
      },
      reporting: {
        screenshotOnFailure: getEnv('SCREENSHOT_ON_FAILURE', true, (v) => v.toLowerCase() === 'true'),
        videoRecording: getEnv('VIDEO_RECORDING', false, (v) => v.toLowerCase() === 'true'),
        reporterType: parseEnum('REPORTER_TYPE', ReporterType.ALLURE, ReporterType)
      },
      app: {
        baseUrl: getEnv('BASE_URL', 'http://localhost:3001/'),
        username: getEnv('USERNAME', 'testuser'),
        password: getEnv('PASSWORD', 'testpass123')
      }
    };
  }

  /**
   * Get the complete configuration
   */
  getConfig(): FrameworkConfig {
    return this.config;
  }

  /**
   * Get browser configuration
   */
  getBrowserConfig(): BrowserConfig {
    return this.config.browser;
  }

  /**
   * Get timeout configuration
   */
  getTimeoutConfig(): TimeoutConfig {
    return this.config.timeouts;
  }

  /**
   * Get test configuration
   */
  getTestConfig(): TestConfig {
    return this.config.test;
  }

  /**
   * Get logging configuration
   */
  getLoggingConfig(): LoggingConfig {
    return this.config.logging;
  }

  /**
   * Get reporting configuration
   */
  getReportingConfig(): ReportingConfig {
    return this.config.reporting;
  }

  /**
   * Get application configuration
   */
  getAppConfig(): AppConfig {
    return this.config.app;
  }

  /**
   * Get base URL for application under test
   */
  getBaseUrl(): string {
    return this.config.app.baseUrl;
  }

  /**
   * Reload configuration from environment variables
   */
  reload(): void {
    this.config = this.buildConfiguration();
  }

  /**
   * Print current configuration to console (with masked password)
   */
  printConfig(): void {
    console.log('=== Framework Configuration ===');
    console.log(JSON.stringify({
      ...this.config,
      app: { ...this.config.app, password: '***' }
    }, null, 2));
    console.log('===============================');
  }
}

// Export singleton instance
export const configLoader = ConfigLoader.getInstance();
export default configLoader;