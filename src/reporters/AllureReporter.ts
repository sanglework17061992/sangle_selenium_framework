import { TestReporter } from '../base/BaseTest';
import { ThenableWebDriver } from 'selenium-webdriver';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { ConfigLoader } from '../config/ConfigLoader';
import { hasCliReporter, isParallelMode, captureScreenshot } from './ReporterUtils';

interface AllureRuntime {
  parameter(name: string, value: string): void;
  attachment(name: string, content: string | Buffer, type: string): void;
  step<T>(name: string, body: () => T | Promise<T>): T | Promise<T>;
}

/**
 * Allure Reporter Implementation
 */
export class AllureReporter implements TestReporter {
  private static readonly config = ConfigLoader.getInstance().getConfig();
  private static allure: AllureRuntime | null = null;
  private static allureLoaded = false;
  private driver: ThenableWebDriver | null = null;

  private static getAllure(): AllureRuntime | null {
    if (!hasCliReporter('allure-mocha')) {
      return null;
    }

    if (isParallelMode()) {
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
      await this.attachScreenshot('Test Completion Screenshot');
    }
  }

  async onTestFailure(testName: string, error: Error): Promise<void> {
    if (this.driver) {
      await this.attachScreenshot(`Failure Screenshot - ${testName}`);
    }
    
    const allure = AllureReporter.getAllure();
    if (allure) {
      allure.attachment('Error Stack', error.stack || error.message, 'text/plain');
    }
  }

  setDriver(driver: ThenableWebDriver): void {
    this.driver = driver;
  }

  private async attachScreenshot(name: string = 'Screenshot'): Promise<void> {
    const allure = AllureReporter.getAllure();
    if (!allure || !this.driver) return;

    const buffer = await captureScreenshot(this.driver);
    if (buffer) {
      allure.attachment(name, buffer, 'image/png');
    }
  }

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

  static step(name: string, body: () => void | Promise<void>): void | Promise<void> {
    const allure = this.getAllure();
    if (!allure) {
      return body();
    }
    return allure.step(name, body);
  }

  static parameter(name: string, value: string): void {
    const allure = this.getAllure();
    if (allure) {
      allure.parameter(name, value);
    }
  }

  static attachment(name: string, content: Buffer | string, type: string): void {
    const allure = this.getAllure();
    if (allure) {
      allure.attachment(name, content, type);
    }
  }
}

export function shouldUseAllureReporter(): boolean {
  return hasCliReporter('allure-mocha');
}

export function createAllureReporter(): TestReporter {
  return new AllureReporter();
}
