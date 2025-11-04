import * as fs from 'fs';
import * as path from 'path';
import { ConfigLoader } from '../config/ConfigLoader';

/**
 * Allure reporting utilities for SaniumTS framework
 * Provides enhanced test reporting with screenshots, steps, and attachments
 */
export class AllureReporter {
  private static config = ConfigLoader.getInstance().getConfig();
  private static allure: any = null;
  private static allureLoaded = false;

  /**
   * Get Allure instance (lazy loading to avoid parallel mode issues)
   */
  private static getAllure(): any {
    // Check for parallel mode indicators
    const isParallel = process.env.MOCHA_WORKER_ID !== undefined ||
                      process.env.MOCHA_PARALLEL !== undefined ||
                      process.argv.includes('--parallel');

    if (isParallel) {
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
  static step(name: string, action: () => Promise<void> | void): Promise<void> {
    const allure = this.getAllure();
    if (!allure) {
      console.log(`[STEP] ${name}`);
      return Promise.resolve(action());
    }
    return allure.step(name, action);
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
    const logMessage = `[${timestamp}] ${action}${details ? ` - ${JSON.stringify(details)}` : ''}`;
    console.log(logMessage);
    this.attachText('Test Log', logMessage);
  }
}