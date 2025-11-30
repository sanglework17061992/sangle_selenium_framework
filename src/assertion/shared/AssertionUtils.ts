/**
 * Shared assertion utilities for SaniumTS framework
 * Provides retry mechanisms and assertion helpers
 */

import { TimeUtils } from '@utils/TimeUtils';
import { formatValue } from '@utils/ValueFormatter';
import { logger } from '@utils/Logger';
import { TIMING } from '@config/Constants';

/**
 * Core retry mechanism - waits until element becomes visible or condition passes
 * Shared by Element and Page assertions for checking visible/present states
 * (text, button visibility, URL changes, etc.)
 */
export async function waitUntilVisible(
  condition: () => Promise<boolean>,
  errorMessage: string,
  timeout: number
): Promise<void> {
  const startTime = Date.now();
  let lastError: Error | null = null;

  while (TimeUtils.getRemainingTimeout(startTime, timeout) > 0) {
    try {
      const result = await condition();
      if (result) {
        return; // Condition passed
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.error(`waitUntilVisible: ${lastError.message}`);
    }
    
    // Wait before next retry
    await TimeUtils.sleep(TIMING.DEFAULT_RETRY_INTERVAL);
  }

  // Timeout reached
  const finalError = lastError || new Error(errorMessage);
  throw new Error(`${errorMessage}\nLast error: ${finalError.message}`);
}

/**
 * Wait until element is hidden or removed from DOM
 * Handles both: element with display:none and element removed from DOM
 */
export async function waitUntilHidden(
  condition: () => Promise<boolean>,
  errorMessage: string,
  timeout: number
): Promise<void> {
  const startTime = Date.now();

  while (TimeUtils.getRemainingTimeout(startTime, timeout) > 0) {
    try {
      const result = await condition();
      if (result) {
        return; // Element is hidden
      }
    } catch (error) {
      // Element not found in DOM - considered hidden
      if (error instanceof Error) {
        logger.error(`waitUntilHidden: ${error.message}`);
      }
      return;
    }
    
    // Wait before next retry
    await TimeUtils.sleep(TIMING.DEFAULT_RETRY_INTERVAL);
  }

  // Timeout reached - element still visible
  throw new Error(errorMessage);
}

/**
 * Assert that two values are strictly equal (===)
 */
export function equal<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(message || `Expected ${formatValue(actual)} to equal ${formatValue(expected)}`);
  }
}

/**
 * Create standardized assertion error message
 * @example createErrorMessage('title', 'Expected', 'Got') -> 'Expected title "Expected" but got "Got"'
 */
export function createAssertionError(assertionType: string, expected: string, actual: string): string {
  return `Expected ${assertionType} "${expected}" but got "${actual}"`;
}
