import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Enums for type-safe configuration
export enum BrowserType {
  CHROME = 'chrome',
  FIREFOX = 'firefox'
}

export enum EnvironmentType {
  DEV = 'dev',
  QA = 'qa',
  STAGING = 'staging',
  PROD = 'prod'
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export enum ReporterType {
  ALLURE = 'allure',
  MOCHAWESOME = 'mochawesome',
  NONE = 'none'
}

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
    const browserName = this.getEnvBrowserType('BROWSER', BrowserType.CHROME);
    const headless = this.getEnvBoolean('HEADLESS', false);
    const noSandbox = this.getEnvBoolean('NO_SANDBOX', true);

    let args: string[] = [];
    if (browserName === BrowserType.CHROME) {
      const chromeArgs = this.getEnvString('CHROME_ARGS', '');
      args = chromeArgs ? chromeArgs.split(',') : [];
    } else if (browserName === BrowserType.FIREFOX) {
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
      retryCount: this.getEnvNumber('RETRY_COUNT', 3),
      retryInterval: this.getEnvNumber('RETRY_INTERVAL', 500),
      parallel: this.getEnvBoolean('PARALLEL', false),
      threadCount: this.getEnvNumber('THREAD_COUNT', 2)
    };
  }

  private loadLoggingConfig(): LoggingConfig {
    return {
      level: this.getEnvLogLevel('LOG_LEVEL', LogLevel.INFO),
      file: this.getEnvString('LOG_FILE', './logs/test.log')
    };
  }

  private loadReportingConfig(): ReportingConfig {
    return {
      screenshotOnFailure: this.getEnvBoolean('SCREENSHOT_ON_FAILURE', true),
      videoRecording: this.getEnvBoolean('VIDEO_RECORDING', false),
      reporterType: this.getEnvReporterType('REPORTER_TYPE', ReporterType.ALLURE)
    };
  }

  private loadAppConfig(): AppConfig {
    return {
      baseUrl: this.getEnvString('BASE_URL', 'https://example.com'),
      username: this.getEnvString('USERNAME', 'testuser'),
      password: this.getEnvString('PASSWORD', 'testpass123')
    };
  }

  /**
   * Generic method to get environment variable with type conversion
   */
  private getEnv<T>(key: string, defaultValue: T, converter?: (value: string) => T): T {
    const value = process.env[key];
    if (!value) return defaultValue;
    
    if (converter) {
      try {
        return converter(value);
      } catch {
        return defaultValue;
      }
    }
    
    return value as T;
  }

  /**
   * Generic method to get enum value from environment variable
   * @param key - Environment variable key
   * @param defaultValue - Default enum value
   * @param enumObject - The enum object to validate against
   * @param transform - Optional transformation function (e.g., toUpperCase, toLowerCase)
   */
  private getEnvEnum<T extends string>(
    key: string, 
    defaultValue: T, 
    enumObject: Record<string, T>,
    transform: 'uppercase' | 'lowercase' | 'none' = 'none'
  ): T {
    return this.getEnv(key, defaultValue, (value) => {
      let transformedValue = value;
      
      if (transform === 'uppercase') {
        transformedValue = value.toUpperCase();
      } else if (transform === 'lowercase') {
        transformedValue = value.toLowerCase();
      }
      
      if (Object.values(enumObject).includes(transformedValue as T)) {
        return transformedValue as T;
      }
      
      throw new Error(`Invalid enum value: ${value}`);
    });
  }

  private getEnvString(key: string, defaultValue: string): string {
    return this.getEnv(key, defaultValue);
  }

  private getEnvNumber(key: string, defaultValue: number): number {
    return this.getEnv(key, defaultValue, (value) => {
      const parsed = Number.parseInt(value, 10);
      if (Number.isNaN(parsed)) throw new Error('Invalid number');
      return parsed;
    });
  }

  private getEnvBoolean(key: string, defaultValue: boolean): boolean {
    return this.getEnv(key, defaultValue, (value) => value.toLowerCase() === 'true');
  }

  private getEnvBrowserType(key: string, defaultValue: BrowserType): BrowserType {
    return this.getEnvEnum(key, defaultValue, BrowserType, 'uppercase');
  }

  private getEnvEnvironmentType(key: string, defaultValue: EnvironmentType): EnvironmentType {
    return this.getEnvEnum(key, defaultValue, EnvironmentType, 'uppercase');
  }

  private getEnvLogLevel(key: string, defaultValue: LogLevel): LogLevel {
    return this.getEnvEnum(key, defaultValue, LogLevel, 'uppercase');
  }

  private getEnvReporterType(key: string, defaultValue: ReporterType): ReporterType {
    return this.getEnvEnum(key, defaultValue, ReporterType, 'lowercase');
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
   * Reload configuration
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