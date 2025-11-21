import { BaseReporter } from '@reporting/BaseReporter';
import { captureScreenshot, saveScreenshot } from '@reporting/shared/ReporterUtils';
import * as path from 'node:path';

/**
 * MochawesomeReporter - Simple Mochawesome reporter for test results
 * 
 * Captures screenshots on failure and saves to mochawesome-report/screenshots
 * Requires mochawesome to be installed
 */
export class MochawesomeReporter extends BaseReporter {
  private readonly screenshotsDir = path.join(process.cwd(), 'mochawesome-report', 'screenshots');

  async onTestFailure(testName: string, error: Error): Promise<void> {
    if (!this.driver) return;

    try {
      const buffer = await captureScreenshot(this.driver);
      if (buffer) {
        const filename = `${testName.replaceAll(/\s+/g, '-')}-${Date.now()}.png`;
        const filepath = path.join(this.screenshotsDir, filename);
        saveScreenshot(buffer, filepath);
        console.log(`📸 Mochawesome screenshot: ${filepath}`);
      }
    } catch (err) {
      console.warn(`Failed to capture Mochawesome screenshot: ${err}`);
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
