import { BaseReporter } from '@reporting/BaseReporter';
import { captureScreenshot, saveScreenshot } from '@reporting/shared/ReporterUtils';
import { logger } from '@utils/Logger';
import * as path from 'node:path';

/**
 * MochawesomeReporter - Simple Mochawesome reporter for test results
 * 
 * Captures screenshots on failure and saves to mochawesome-report/screenshots
 * Screenshots are viewable in the screenshots directory
 */
export class MochawesomeReporter extends BaseReporter {
  private readonly screenshotsDir = path.join(process.cwd(), 'mochawesome-report', 'screenshots');

  async onTestFailure(testName: string, _error: Error): Promise<void> {
    if (!this.driver) return;

    try {
      const buffer = await captureScreenshot(this.driver);
      if (buffer) {
        const filename = `${testName.replaceAll(/\s+/g, '-')}-${Date.now()}.png`;
        const filepath = path.join(this.screenshotsDir, filename);
        saveScreenshot(buffer, filepath);
        logger.info(`Mochawesome screenshot: screenshots/${filename}`);
      }
    } catch (err) {
      logger.warn(`Failed to capture Mochawesome screenshot: ${err}`);
    }
  }
}

export function shouldUseMochawesomeReporter(): boolean {
  try {
    require.resolve('mochawesome');
    return true;
  } catch {
    return false;
  }
}

export function createMochawesomeReporter(): BaseReporter {
  return new MochawesomeReporter();
}
