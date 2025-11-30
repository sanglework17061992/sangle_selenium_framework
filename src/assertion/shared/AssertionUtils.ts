/**
 * Shared assertion utilities for SaniumTS framework
 * Provides retry mechanisms and assertion helpers
 */

import { TimeUtils } from '@utils/TimeUtils';
import { formatValue } from '@utils/ValueFormatter';
import { logger } from '@utils/Logger';
import { TIMING } from '@config/Constants';
import { AssertionError } from '@assertion/errors';

/**
 * Context information for detailed error messages
 */
export interface AssertionContext {
  assertionType: string;
  expected: string | boolean;
  actual?: string | boolean;
  locator?: string;
}

/**
 * Core retry mechanism - waits until element becomes visible or condition passes
 * Shared by Element and Page assertions for checking visible/present states
 * (text, button visibility, URL changes, etc.)
 * 
 * @param condition - Function that returns true when assertion passes
 * @param context - Context information for error message or simple error message string
 * @param timeout - Timeout in milliseconds
 * 
 * @example
 * await waitUntilVisible(
 *   () => element.isDisplayed(),
 *   { 
 *     assertionType: 'toBeVisible',
 *     expected: 'visible',
 *     locator: 'button.submit'
 *   },
 *   10000
 * );
 */
export async function waitUntilVisible(
  condition: () => Promise<boolean>,
  context: AssertionContext | string,
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

  // Timeout reached - throw detailed error
  if (typeof context === 'string') {
    // Legacy string message support
    const finalError = lastError || new Error(context);
    throw new Error(`${context}\nLast error: ${finalError.message}`);
  }

  // Throw custom AssertionError with context
  throw new AssertionError(
    context.assertionType,
    context.expected,
    context.actual,
    context.locator,
    timeout,
    lastError ?? undefined
  );
}

/**
 * Wait until element is hidden or removed from DOM
 * Handles both: element with display:none and element removed from DOM
 * 
 * @param condition - Function that returns true when element is hidden
 * @param context - Context information for error message or simple error message string
 * @param timeout - Timeout in milliseconds
 */
export async function waitUntilHidden(
  condition: () => Promise<boolean>,
  context: AssertionContext | string,
  timeout: number
): Promise<void> {
  const startTime = Date.now();
  let lastError: Error | null = null;

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
  if (typeof context === 'string') {
    // Legacy string message support
    throw new TypeError(context);
  }

  // Throw custom AssertionError with context
  throw new AssertionError(
    context.assertionType,
    context.expected,
    context.actual,
    context.locator,
    timeout,
    lastError ?? undefined
  );
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
