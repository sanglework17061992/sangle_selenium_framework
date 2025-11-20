import { TestReporter } from '../base/BaseTest';
import { ThenableWebDriver } from 'selenium-webdriver';
import * as path from 'node:path';
import { 
  hasCliReporter, 
  captureScreenshot, 
  saveScreenshot, 
  sanitizeFilename,
  ensureDirectoryExists 
} from './ReporterUtils';

export class MochawesomeReporter implements TestReporter {
  private driver: ThenableWebDriver | null = null;
  private readonly screenshotsDir: string;

  constructor() {
    this.screenshotsDir = path.join(process.cwd(), 'mochawesome-report', 'screenshots');
  }

  async beforeAll(): Promise<void> {
    ensureDirectoryExists(this.screenshotsDir);
  }

  async afterAll(): Promise<void> {
    // Cleanup handled by Mocha
  }

  async beforeEach(): Promise<void> {
    // No specific setup needed
  }

  async afterEach(): Promise<void> {
    if (this.driver) {
      await this.saveScreenshotFile('test-completion');
    }
  }

  async onTestFailure(testName: string, error: Error): Promise<void> {
    if (!this.driver) return;

    const screenshotPath = await this.saveScreenshotFile(`failure-${sanitizeFilename(testName)}`);
    
    if (screenshotPath && (globalThis as any).testContext) {
      (globalThis as any).testContext.addContext({
        title: 'Failure Screenshot',
        value: path.relative(process.cwd(), screenshotPath)
      });
    }
    
    if ((globalThis as any).testContext) {
      (globalThis as any).testContext.addContext({
        title: 'Error Details',
        value: error.stack || error.message
      });
    }
  }

  setDriver(driver: ThenableWebDriver): void {
    this.driver = driver;
  }

  private async saveScreenshotFile(name: string): Promise<string | null> {
    if (!this.driver) return null;

    const buffer = await captureScreenshot(this.driver);
    if (!buffer) return null;

    const timestamp = Date.now();
    const filename = `${name}-${timestamp}.png`;
    const filepath = path.join(this.screenshotsDir, filename);

    saveScreenshot(buffer, filepath);
    return filepath;
  }

  static addContext(title: string, value: string | object): void {
    if ((globalThis as any).testContext) {
      (globalThis as any).testContext.addContext({ title, value });
    }
  }
}

export function shouldUseMochawesomeReporter(): boolean {
  return hasCliReporter('mochawesome') || hasCliReporter('mocha-multi-reporters');
}

export function createMochawesomeReporter(): TestReporter {
  return new MochawesomeReporter();
}
