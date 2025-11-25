import driverManager from '@driver/DriverManager';
import { BasePage } from '@pages/BasePage';

/**
 * BaseTest - Base class for all test suites
 * Provides driver lifecycle management and page object initialization
 * WebDriver is hidden from users - just create page and use it
 */
export abstract class BaseTest<T extends BasePage> {
  public page!: T;

  /**
   * Setup driver before all tests
   */
  async setupDriver(): Promise<void> {
    await driverManager.createDriver();
    this.page = this.createPage();
  }

  /**
   * Teardown driver after all tests
   */
  async teardownDriver(): Promise<void> {
    await driverManager.quitDriver();
  }

  /**
   * Setup for each test - override in subclass if needed
   */
  async setupTest(): Promise<void> {
    // To be overridden by subclasses
  }

  /**
   * Teardown for each test - override in subclass if needed
   */
  async teardownTest(): Promise<void> {
    // To be overridden by subclasses
  }

  /**
   * Abstract method to create page object - must be implemented by subclass
   */
  protected abstract createPage(): T;
}
