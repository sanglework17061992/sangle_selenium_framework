import { TestReporter } from '../base/BaseTest';
import { ThenableWebDriver } from 'selenium-webdriver';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Mochawesome Reporter Implementation
 * Provides Mochawesome reporting capabilities with screenshots
 * 
 * @example
 * // Use with BaseTest:
 * const test = new TodoTest(createMochawesomeReporter());
 * 
 * // Mochawesome will automatically generate HTML reports with screenshots
 */
export class MochawesomeReporter implements TestReporter {
  private driver: ThenableWebDriver | null = null;
  private readonly screenshotsDir: string;

  constructor() {
    this.screenshotsDir = path.join(process.cwd(), 'mochawesome-report', 'screenshots');
  }

  async beforeAll(): Promise<void> {
    // Ensure screenshots directory exists
    if (!fs.existsSync(this.screenshotsDir)) {
      fs.mkdirSync(this.screenshotsDir, { recursive: true });
    }
  }

  async afterAll(): Promise<void> {
    // Cleanup handled by Mocha
  }

  async beforeEach(): Promise<void> {
    // No specific setup needed for mochawesome
  }

  async afterEach(): Promise<void> {
    if (this.driver) {
      await this.captureScreenshot('test-completion');
    }
  }

  async onTestFailure(testName: string, error: Error): Promise<void> {
    if (this.driver) {
      const screenshotPath = await this.captureScreenshot(`failure-${this.sanitizeFilename(testName)}`);
      
      // Add screenshot to mochawesome context
      if (screenshotPath && (globalThis as any).testContext) {
        (globalThis as any).testContext.addContext({
          title: 'Failure Screenshot',
          value: path.relative(process.cwd(), screenshotPath)
        });
      }
      
      // Add error details
      if ((globalThis as any).testContext) {
        (globalThis as any).testContext.addContext({
          title: 'Error Details',
          value: error.stack || error.message
        });
      }
    }
  }

  setDriver(driver: ThenableWebDriver): void {
    this.driver = driver;
  }

  /**
   * Capture screenshot and save to file
   */
  private async captureScreenshot(name: string): Promise<string | null> {
    if (!this.driver) return null;

    try {
      const screenshot = await this.driver.takeScreenshot();
      const timestamp = Date.now();
      const filename = `${name}-${timestamp}.png`;
      const filepath = path.join(this.screenshotsDir, filename);

      fs.writeFileSync(filepath, screenshot, 'base64');
      return filepath;
    } catch (error) {
      console.warn(`Failed to capture screenshot: ${error}`);
      return null;
    }
  }

  /**
   * Sanitize filename by removing invalid characters
   */
  private sanitizeFilename(name: string): string {
    return (
      name
        .toLowerCase()
        // eslint-disable-next-line unicorn/prefer-string-replace-all
        .replace(/[^a-z0-9]+/g, '-')
        .slice(0, 100)
    );
  }

  /**
   * Add context to Mochawesome report
   * @example
   * MochawesomeReporter.addContext('User ID', 'user123');
   */
  static addContext(title: string, value: string | object): void {
    if ((globalThis as any).testContext) {
      (globalThis as any).testContext.addContext({ title, value });
    }
  }
}

/**
 * Utility function to determine if Mochawesome reporter should be used
 */
export function shouldUseMochawesomeReporter(): boolean {
  return process.argv.includes('--reporter') && 
         (process.argv.includes('mochawesome') || process.argv.includes('mocha-multi-reporters'));
}

/**
 * Factory function to create Mochawesome reporter
 */
export function createMochawesomeReporter(): TestReporter {
  return new MochawesomeReporter();
}
