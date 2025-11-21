import { ThenableWebDriver } from 'selenium-webdriver';
import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Capture screenshot from driver as PNG buffer
 * Returns null if capture fails
 */
export async function captureScreenshot(driver: ThenableWebDriver): Promise<Buffer | null> {
  try {
    const screenshot = await driver.takeScreenshot();
    return Buffer.from(screenshot, 'base64');
  } catch {
    return null;
  }
}

/**
 * Save screenshot buffer to file
 * Creates directory if it doesn't exist
 */
export function saveScreenshot(buffer: Buffer, filepath: string): void {
  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filepath, buffer);
}

