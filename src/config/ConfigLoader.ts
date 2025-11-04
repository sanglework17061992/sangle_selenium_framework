import * as fs from 'fs';
import * as path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

export interface BrowserConfig {
  name: string;
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
  environment: string;
  retryCount: number;
  retryInterval: number;
  parallel: boolean;
  threadCount: number;
}

export interface LoggingConfig {
  level: string;
  file: string;
}

export interface ReportingConfig {
  screenshotOnFailure: boolean;
  videoRecording: boolean;
}

export interface AppConfig {
  baseUrl: string;
  loginUrl: string;
  productsUrl: string;
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
 * Configuration loader for the SaniumTS framework
 * Loads configuration from environment variables (.env file)
 */
export class ConfigLoader {
  private static instance: ConfigLoader;
  private config: FrameworkConfig;

  private constructor() {
    this.config = this.loadConfiguration();
  }

  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  private loadConfiguration(): FrameworkConfig {
    return {
      browser: this.loadBrowserConfig(),
      timeouts: this.loadTimeoutConfig(),
      test: this.loadTestConfig(),
      logging: this.loadLoggingConfig(),
      reporting: this.loadReportingConfig(),
      app: this.loadAppConfig()
    };
  }

  private loadBrowserConfig(): BrowserConfig {
    const browserName = this.getEnvString('BROWSER', 'chrome');
    const headless = this.getEnvBoolean('HEADLESS', false);
    const noSandbox = this.getEnvBoolean('NO_SANDBOX', true);

    let args: string[] = [];
    if (browserName === 'chrome') {
      const chromeArgs = this.getEnvString('CHROME_ARGS', '');
      args = chromeArgs ? chromeArgs.split(',') : [];
    } else if (browserName === 'firefox') {
      const firefoxArgs = this.getEnvString('FIREFOX_ARGS', '');
      args = firefoxArgs ? firefoxArgs.split(',') : [];
    }

    return {
      name: browserName,
      headless,
      noSandbox,
      args
    };
  }

  private loadTimeoutConfig(): TimeoutConfig {
    return {
      default: this.getEnvNumber('DEFAULT_TIMEOUT', 5000),
      element: this.getEnvNumber('ELEMENT_TIMEOUT', 10000),
      pageLoad: this.getEnvNumber('PAGE_LOAD_TIMEOUT', 30000)
    };
  }

  private loadTestConfig(): TestConfig {
    return {
      environment: this.getEnvString('ENVIRONMENT', 'qa'),
      retryCount: this.getEnvNumber('RETRY_COUNT', 3),
      retryInterval: this.getEnvNumber('RETRY_INTERVAL', 500),
      parallel: this.getEnvBoolean('PARALLEL', false),
      threadCount: this.getEnvNumber('THREAD_COUNT', 2)
    };
  }

  private loadLoggingConfig(): LoggingConfig {
    return {
      level: this.getEnvString('LOG_LEVEL', 'INFO'),
      file: this.getEnvString('LOG_FILE', './logs/test.log')
    };
  }

  private loadReportingConfig(): ReportingConfig {
    return {
      screenshotOnFailure: this.getEnvBoolean('SCREENSHOT_ON_FAILURE', true),
      videoRecording: this.getEnvBoolean('VIDEO_RECORDING', false)
    };
  }

  private loadAppConfig(): AppConfig {
    return {
      baseUrl: this.getEnvString('BASE_URL', 'https://example.com'),
      loginUrl: this.getEnvString('LOGIN_URL', 'https://example.com/login'),
      productsUrl: this.getEnvString('PRODUCTS_URL', 'https://example.com/products'),
      username: this.getEnvString('USERNAME', 'testuser'),
      password: this.getEnvString('PASSWORD', 'testpass123')
    };
  }

  private getEnvString(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
  }

  private getEnvNumber(key: string, defaultValue: number): number {
    const value = process.env[key];
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  private getEnvBoolean(key: string, defaultValue: boolean): boolean {
    const value = process.env[key];
    if (!value) return defaultValue;
    return value.toLowerCase() === 'true';
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
   * Reload configuration (useful for dynamic config changes)
   */
  reload(): void {
    this.config = this.loadConfiguration();
  }

  /**
   * Print current configuration to console
   */
  printConfig(): void {
    console.log('=== Framework Configuration ===');
    console.log('Browser:', this.config.browser);
    console.log('Timeouts:', this.config.timeouts);
    console.log('Test:', this.config.test);
    console.log('Logging:', this.config.logging);
    console.log('Reporting:', this.config.reporting);
    console.log('App:', {
      ...this.config.app,
      password: '***' // Hide password in logs
    });
    console.log('===============================');
  }
}

// Export singleton instance
export const configLoader = ConfigLoader.getInstance();
export default configLoader;