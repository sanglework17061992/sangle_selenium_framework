/**
 * Selenium-specific error handling and retry utilities
 */

export const DEFAULT_RETRY_INTERVAL = 100;
export const DEFAULT_TIMEOUT = 30000;

export function isExpectedSeleniumError(error: any): boolean {
  return error.name === 'StaleElementReferenceError' || 
         error.name === 'NoSuchElementError' ||
         error.message?.includes('no such element');
}

export function handleSeleniumError(error: any, operation: string): void {
  if (!isExpectedSeleniumError(error)) {
    throw new Error(`${operation} failed: ${error.message}`);
  }
}

export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getRemainingTimeout(startTime: number, totalTimeout: number): number {
  const elapsed = Date.now() - startTime;
  return Math.max(0, totalTimeout - elapsed);
}