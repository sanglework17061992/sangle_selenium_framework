import { AllureReporter } from '../reporting/AllureReporter';
import { DriverManager } from '../driver/DriverManager';

/**
 * Test hooks for Allure reporting integration
 * Automatically sets up environment and handles screenshots
 */
export class AllureTestHooks {
  private static driver: any = null;

  /**
   * Set the driver instance for screenshot capture
   */
  static setDriver(driver: any): void {
    this.driver = driver;
  }

  /**
   * Setup hook to run before all tests
   */
  static async beforeAll(): Promise<void> {
    AllureReporter.setupEnvironment();
  }

  /**
   * Setup hook to run before each test
   */
  static async beforeEach(): Promise<void> {
    // Add test start timestamp
    AllureReporter.parameter('Test Start', new Date().toISOString());
  }

  /**
   * Teardown hook to run after each test
   */
  static async afterEach(): Promise<void> {
    try {
      if (this.driver) {
        // Attach screenshot after each test (optional, can be configured)
        await AllureReporter.attachScreenshot(this.driver, 'Test Completion Screenshot');
      }
    } catch (error) {
      console.warn('Failed to capture completion screenshot:', error);
    }
  }

  /**
   * Teardown hook to run after all tests
   */
  static async afterAll(): Promise<void> {
    try {
      if (this.driver) {
        await this.driver.quit();
      }
    } catch (error) {
      console.warn('Failed to quit driver in afterAll:', error);
    }
  }

  /**
   * Hook to handle test failures with screenshots
   */
  static async onTestFailure(test: any, error: any): Promise<void> {
    try {
      if (this.driver) {
        await AllureReporter.attachScreenshot(this.driver, `Failure Screenshot - ${test.title}`);
      }

      // Log the error details
      AllureReporter.attachText('Error Details', `Message: ${error.message}\nStack: ${error.stack}`);

      // Add failure information
      AllureReporter.parameter('Failure Time', new Date().toISOString());
      AllureReporter.parameter('Error Type', error.name || 'Unknown');
    } catch (screenshotError) {
      console.warn('Failed to capture failure screenshot:', screenshotError);
    }
  }
}