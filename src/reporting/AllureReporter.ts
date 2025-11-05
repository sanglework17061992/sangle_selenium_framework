import * as fs from 'node:fs';
import * as path from 'node:path';
import { ConfigLoader } from '../config/ConfigLoader';

export class AllureReporter {
  private static readonly config = ConfigLoader.getInstance().getConfig();
  private static allure: any = null;
  private static allureLoaded = false;

    /**
   * Get Allure instance (lazy loading to avoid parallel mode issues)
   */
  private static getAllure(): any {
    // Check if allure-mocha reporter is being used
    const isAllureReporter = process.argv.includes('--reporter') &&
                            process.argv.includes('allure-mocha');
    
    if (!isAllureReporter) {
      return null; // Don't load Allure unless allure-mocha reporter is used
    }

    // Check for parallel mode indicators
    const isParallel = process.env.MOCHA_WORKER_ID !== undefined ||
                      process.env.MOCHA_PARALLEL !== undefined ||
                      process.argv.includes('--parallel') ||
                      process.argv.includes('--jobs') ||
                      process.env.NODE_ENV === 'parallel';

    if (isParallel) {
      console.warn('  Allure Reporter: Parallel mode detected. Allure Runtime API features disabled.');
      console.warn('  To use Allure reporting features, run tests in single-threaded mode:');
      console.warn('  mocha --no-parallel your-test.spec.ts');
      return null; // Don't load Allure in parallel mode
    }

    if (!this.allureLoaded) {
      try {
        // Dynamic import to avoid loading Allure unless needed
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

  /**
   * Add a test step to Allure report
   */
  static async step(name: string, action: () => Promise<void> | void): Promise<void> {
    const allure = this.getAllure();
    if (!allure) {
      console.log(`[STEP] ${name}`);
      try {
        const result = action();
        if (result instanceof Promise) {
          await result;
        }
        return;
      } catch (error) {
        console.error(`Action failed:`, error);
        throw error;
      }
    } else {
      // Allure is available - execute action and wrap in step
      try {
        await action();
        allure.step(name, () => {});
      } catch (error) {
        allure.step(name, () => { throw error; });
        throw error;
      }
    }
  }

  /**
   * Check if Allure reporting is enabled
   */
  static isEnabled(): boolean {
    // Check if allure-mocha reporter is being used
    const isAllureReporter = process.argv.includes('--reporter') &&
                            process.argv.includes('allure-mocha');
    return isAllureReporter && this.getAllure() !== null;
  }

  /**
   * Add test description
   */
  static description(description: string): void {
    const allure = this.getAllure();
    if (!allure) {
      console.log(`[DESCRIPTION] ${description}`);
      return;
    }
    allure.description(description);
  }

  /**
   * Add test severity level
   */
  static severity(severity: 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'): void {
    const allure = this.getAllure();
    if (!allure) {
      console.log(`[SEVERITY] ${severity}`);
      return;
    }
    allure.severity(severity);
  }

  /**
   * Add test tags
   */
  static tag(tag: string): void {
    const allure = this.getAllure();
    if (!allure) {
      console.log(`[TAG] ${tag}`);
      return;
    }
    allure.tag(tag);
  }

  /**
   * Add test owner
   */
  static owner(owner: string): void {
    const allure = this.getAllure();
    if (!allure) {
      console.log(`[OWNER] ${owner}`);
      return;
    }
    allure.owner(owner);
  }

  /**
   * Add test parameters
   */
  static parameter(name: string, value: any): void {
    const allure = this.getAllure();
    if (!allure) {
      console.log(`[PARAMETER] ${name}: ${value}`);
      return;
    }
    allure.parameter(name, value);
  }

  /**
   * Capture and attach screenshot to Allure report
   */
  static async attachScreenshot(driver: any, name: string = 'Screenshot'): Promise<void> {
    if (!this.config.reporting.screenshotOnFailure) {
      return;
    }

    try {
      const screenshot = await driver.takeScreenshot();
      const allure = this.getAllure();
      if (allure) {
        allure.attachment(name, Buffer.from(screenshot, 'base64'), 'image/png');
      } else {
        console.log(`[SCREENSHOT] ${name} captured (${screenshot.length} bytes)`);
      }
    } catch (error) {
      console.warn('Failed to capture screenshot for Allure:', error);
    }
  }

  /**
   * Attach text content to report
   */
  static attachText(name: string, content: string, type: string = 'text/plain'): void {
    const allure = this.getAllure();
    if (allure) {
      allure.attachment(name, content, type);
    } else {
      console.log(`[ATTACHMENT] ${name}: ${content.substring(0, 100)}${content.length > 100 ? '...' : ''}`);
    }
  }

  /**
   * Attach JSON data to report
   */
  static attachJSON(name: string, data: any): void {
    const jsonString = JSON.stringify(data, null, 2);
    const allure = this.getAllure();
    if (allure) {
      allure.attachment(name, jsonString, 'application/json');
    } else {
      console.log(`[JSON ATTACHMENT] ${name}: ${jsonString.substring(0, 100)}${jsonString.length > 100 ? '...' : ''}`);
    }
  }

  /**
   * Attach file to report
   */
  static attachFile(name: string, filePath: string): void {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath);
      const extension = path.extname(filePath).toLowerCase();
      let contentType = 'application/octet-stream';

      switch (extension) {
        case '.png':
        case '.jpg':
        case '.jpeg':
          contentType = `image/${extension.slice(1)}`;
          break;
        case '.txt':
          contentType = 'text/plain';
          break;
        case '.json':
          contentType = 'application/json';
          break;
        case '.html':
          contentType = 'text/html';
          break;
        case '.xml':
          contentType = 'application/xml';
          break;
      }

      const allure = this.getAllure();
      if (allure) {
        allure.attachment(name, content, contentType);
      } else {
        console.log(`[FILE ATTACHMENT] ${name}: ${filePath} (${content.length} bytes)`);
      }
    }
  }

  /**
   * Add test environment information as parameters
   */
  static addEnvironmentInfo(name: string, value: string): void {
    this.parameter(`Environment_${name}`, value);
  }

  /**
   * Set up test environment information
   */
  static setupEnvironment(): void {
    const allure = this.getAllure();
    if (!allure) {
      console.log('[ALLURE] Setting up environment info (parallel mode - limited functionality)');
    }

    const config = this.config;

    this.addEnvironmentInfo('Browser', config.browser.name);
    this.addEnvironmentInfo('Environment', config.test.environment);
    this.addEnvironmentInfo('Headless', config.browser.headless.toString());
    this.addEnvironmentInfo('Base URL', config.app.baseUrl);
  }

  /**
   * Create a test step with automatic screenshot on failure
   */
  static async stepWithScreenshot(
    name: string,
    action: () => Promise<void> | void,
    driver?: any
  ): Promise<void> {
    try {
      await this.step(name, action);
    } catch (error) {
      if (driver) {
        await this.attachScreenshot(driver, `Screenshot on ${name} failure`);
      }
      throw error;
    }
  }

  /**
   * Log test action with timestamp
   */
  static logAction(action: string, details?: any): void {
    const timestamp = new Date().toISOString();
    const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
    const logMessage = `[${timestamp}] ${action}${detailsStr}`;
    console.log(logMessage);
    this.attachText('Test Log', logMessage);
  }
}