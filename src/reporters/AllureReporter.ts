import { TestReporter } from '../base/BaseTest';
import { ThenableWebDriver } from 'selenium-webdriver';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ConfigLoader } from '../config/ConfigLoader';

interface AllureRuntime {
  parameter(name: string, value: string): void;
  attachment(name: string, content: string | Buffer, type: string): void;
  step<T>(name: string, body: () => T | Promise<T>): T | Promise<T>;
}

/**
 * Allure Reporter Implementation
 * Provides Allure reporting capabilities with screenshots, steps, and rich test metadata
 * 
 * @example
 * // Use with BaseTest:
 * const test = new TodoTest(createAllureReporter());
 * 
 * // Add custom steps in tests:
 * await AllureReporter.step('Login to application', async () => {
 *   await page.login('user', 'pass');
 * });
 */
export class AllureReporter implements TestReporter {
  private static readonly config = ConfigLoader.getInstance().getConfig();
  private static allure: AllureRuntime | null = null;
  private static allureLoaded = false;
  private driver: ThenableWebDriver | null = null;

  /**
   * Get Allure instance (lazy loading to avoid parallel mode issues)
   */
  private static getAllure(): AllureRuntime | null {
    // Check if allure-mocha reporter is being used
    const isAllureReporter = process.argv.includes('--reporter') &&
                            process.argv.includes('allure-mocha');
    
    if (!isAllureReporter) {
      return null;
    }

    // Check for parallel mode
    const isParallel = process.env.MOCHA_WORKER_ID !== undefined ||
                      process.env.MOCHA_PARALLEL !== undefined ||
                      process.argv.includes('--parallel');

    if (isParallel) {
      console.warn('Allure Reporter: Parallel mode detected. Runtime API disabled.');
      return null;
    }

    if (!this.allureLoaded) {
      try {
        const allureModule = require('allure-mocha/runtime');
        this.allure = allureModule.allure;
        this.allureLoaded = true;
      } catch (error) {
        console.warn('Allure not available:', error);
        return null;
      }
    }
    return this.allure;
  }

  async beforeAll(): Promise<void> {
    this.setupEnvironment();
  }

  async afterAll(): Promise<void> {
    // Cleanup handled by Mocha
  }

  async beforeEach(): Promise<void> {
    const allure = AllureReporter.getAllure();
    if (allure) {
      allure.parameter('Test Start', new Date().toISOString());
    }
  }

  async afterEach(): Promise<void> {
    if (this.driver) {
      await this.attachScreenshot(this.driver, 'Test Completion Screenshot');
    }
  }

  async onTestFailure(testName: string, error: Error): Promise<void> {
    if (this.driver) {
      await this.attachScreenshot(this.driver, `Failure Screenshot - ${testName}`);
    }
    
    const allure = AllureReporter.getAllure();
    if (allure) {
      allure.attachment('Error Stack', error.stack || error.message, 'text/plain');
    }
  }

  setDriver(driver: ThenableWebDriver): void {
    this.driver = driver;
  }

  /**
   * Attach screenshot to Allure report
   */
  private async attachScreenshot(driver: ThenableWebDriver, name: string = 'Screenshot'): Promise<void> {
    const allure = AllureReporter.getAllure();
    if (!allure) return;

    try {
      const screenshot = await driver.takeScreenshot();
      const buffer = Buffer.from(screenshot, 'base64');
      allure.attachment(name, buffer, 'image/png');
    } catch (error) {
      console.warn(`Failed to attach screenshot: ${error}`);
    }
  }

  /**
   * Setup Allure environment information
   */
  private setupEnvironment(): void {
    const allure = AllureReporter.getAllure();
    if (!allure) return;

    try {
      const config = AllureReporter.config;
      const resultsDir = path.join(process.cwd(), 'allure-results');

      if (!fs.existsSync(resultsDir)) {
        fs.mkdirSync(resultsDir, { recursive: true });
      }

      const envInfo = {
        'Browser': config.browser || 'chrome',
        'Test Environment': process.env.NODE_ENV || 'development',
        'Node Version': process.version,
        'Platform': process.platform,
        'Test Run': new Date().toISOString()
      };

      const envFilePath = path.join(resultsDir, 'environment.properties');
      const envContent = Object.entries(envInfo)
        .map(([key, value]) => `${key}=${value as string}`)
        .join('\n');

      fs.writeFileSync(envFilePath, envContent);
    } catch (error) {
      console.warn('Failed to setup Allure environment:', error);
    }
  }

  /**
   * Add step to Allure report
   * @example
   * await AllureReporter.step('Click login button', async () => {
   *   await loginPage.clickLogin();
   * });
   */
  static step(name: string, body: () => void | Promise<void>): void | Promise<void> {
    const allure = this.getAllure();
    if (!allure) {
      return body();
    }
    return allure.step(name, body);
  }

  /**
   * Add parameter to Allure report
   */
  static parameter(name: string, value: string): void {
    const allure = this.getAllure();
    if (allure) {
      allure.parameter(name, value);
    }
  }

  /**
   * Add attachment to Allure report
   */
  static attachment(name: string, content: Buffer | string, type: string): void {
    const allure = this.getAllure();
    if (allure) {
      allure.attachment(name, content, type);
    }
  }
}

/**
 * Utility function to determine if Allure reporter should be used
 */
export function shouldUseAllureReporter(): boolean {
  return process.argv.includes('--reporter') && process.argv.includes('allure-mocha');
}

/**
 * Factory function to create Allure reporter
 */
export function createAllureReporter(): TestReporter {
  return new AllureReporter();
}
