import { ThenableWebDriver } from 'selenium-webdriver';
import * as fs from 'node:fs';
import * as path from 'node:path';

export function hasCliReporter(reporterName: string): boolean {
  return process.argv.includes('--reporter') && process.argv.includes(reporterName);
}

export function isParallelMode(): boolean {
  return (
    process.env.MOCHA_WORKER_ID !== undefined ||
    process.env.MOCHA_PARALLEL !== undefined ||
    process.argv.includes('--parallel')
  );
}

export async function captureScreenshot(
  driver: ThenableWebDriver
): Promise<Buffer | null> {
  try {
    const screenshot = await driver.takeScreenshot();
    return Buffer.from(screenshot, 'base64');
  } catch (error) {
    console.warn(`Failed to capture screenshot: ${error}`);
    return null;
  }
}

export function ensureDirectoryExists(dirPath: string): void {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

export function saveScreenshot(buffer: Buffer, filepath: string): void {
  const dir = path.dirname(filepath);
  ensureDirectoryExists(dir);
  fs.writeFileSync(filepath, buffer);
}

export function sanitizeFilename(name: string): string {
  return name
    .toLowerCase()
    .replaceAll(/[^\da-z]+/g, '-')
    .slice(0, 100);
}
