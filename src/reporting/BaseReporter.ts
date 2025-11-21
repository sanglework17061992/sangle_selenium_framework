import { ThenableWebDriver } from 'selenium-webdriver';

/**
 * TestReporter Interface - Define what reporters can do
 * All methods are optional, so reporters only need to implement what they need
 */
export interface TestReporter {
  beforeAll?(): Promise<void>;
  afterAll?(): Promise<void>;
  beforeEach?(): Promise<void>;
  afterEach?(): Promise<void>;
  onTestFailure?(testName: string, error: Error): Promise<void>;
  setDriver?(driver: ThenableWebDriver): void;
}

/**
 * BaseReporter - Simple base class for all reporters
 * 
 * Provides:
 * - Default no-op implementations (so you only override what you need)
 * - Protected driver access (for child classes)
 * 
 * @example
 * class MyReporter extends BaseReporter {
 *   async onTestFailure(testName, error) {
 *     // Your custom logic here
 *   }
 * }
 */
export abstract class BaseReporter implements TestReporter {
  protected driver: ThenableWebDriver | null = null;

  // Default implementations - override in child classes if needed
  async beforeAll(): Promise<void> {
    // No-op default
  }

  async afterAll(): Promise<void> {
    // No-op default
  }

  async beforeEach(): Promise<void> {
    // No-op default
  }

  async afterEach(): Promise<void> {
    // No-op default
  }

  async onTestFailure(testName: string, error: Error): Promise<void> {
    // No-op default
  }

  setDriver(driver: ThenableWebDriver): void {
    this.driver = driver;
  }
}
