import { BaseReporter } from '@reporters/BaseReporter';
import { captureScreenshot, saveScreenshot } from '@reporters/ReporterUtils';
import * as path from 'node:path';

/**
 * ScreenshotReporter - Captures screenshots on test failure
 * 
 * Saves PNG screenshots to `screenshots/` directory
 * Only captures on failure to avoid unnecessary disk space usage
 * 
 * @example
 * new ScreenshotReporter() - automatically saves screenshots on failure
 */
export class ScreenshotReporter extends BaseReporter {
  private readonly screenshotsDir = path.join(process.cwd(), 'screenshots');

  async onTestFailure(testName: string, error: Error): Promise<void> {
    if (!this.driver) return;

    try {
      const buffer = await captureScreenshot(this.driver);
      if (buffer) {
        const filename = `${testName.replaceAll(/\s+/g, '-')}-${Date.now()}.png`;
        const filepath = path.join(this.screenshotsDir, filename);
        saveScreenshot(buffer, filepath);
        console.log(`📸 Screenshot: ${filepath}`);
      }
    } catch (err) {
      console.warn(`Failed to capture screenshot: ${err}`);
    }
  }
}
