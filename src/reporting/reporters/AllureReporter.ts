import { BaseReporter } from '@reporting/BaseReporter';
import { captureScreenshot } from '@reporting/shared/ReporterUtils';
import { logger } from '@utils/Logger';

/**
 * AllureReporter - Simple Allure reporter for test results
 * 
 * Captures screenshots on failure and attaches to Allure report
 */
export class AllureReporter extends BaseReporter {
  private static allure: any = null;
  private static allureLoaded = false;

  private static getAllure(): any {
    if (this.allureLoaded) {
      return this.allure;
    }

    try {
      const allureModule = require('allure-mocha/runtime');
      this.allure = allureModule.allure;
      this.allureLoaded = true;
    } catch {
      this.allure = null;
      this.allureLoaded = true;
    }

    return this.allure;
  }

  async onTestFailure(_testName: string, error: Error): Promise<void> {
    const allure = AllureReporter.getAllure();
    if (!allure) return;

    try {
      // Attach error to Allure
      allure.attachment('Error Stack', error.stack || error.message, 'text/plain');

      // Capture and attach screenshot
      if (this.driver) {
        const buffer = await captureScreenshot(this.driver);
        if (buffer) {
          allure.attachment('Failure Screenshot', buffer, 'image/png');
        }
      }
    } catch (err) {
      logger.warn(`Failed to attach to Allure: ${err}`);
    }
  }
}

export function shouldUseAllureReporter(): boolean {
  try {
    require.resolve('allure-mocha');
    return true;
  } catch {
    return false;
  }
}

export function createAllureReporter(): BaseReporter {
  return new AllureReporter();
}
