/**
 * Shared assertion utilities for SaniumTS framework
 * Provides retry mechanisms and assertion helpers
 */

import { TimeUtils } from '@utils/TimeUtils';
import { formatValue } from '@utils/ValueFormatter';
import { logger } from '@utils/Logger';
import { TIMING } from '@config/Constants';
import { AssertionError, TimeoutError } from '@errors';
import type { ErrorContext } from '@errorTypes';

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
 *     operation: 'toBeVisible',
 *     expected: 'visible',
 *     locator: 'button.submit'
 *   },
 *   10000
 * );
 */
export async function waitUntilVisible(
  condition: () => Promise<boolean>,
  context: ErrorContext | string,
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
      // Don't log here - we'll log the final formatted error if timeout is reached
    }
    
    // Wait before next retry
    await TimeUtils.sleep(TIMING.DEFAULT_RETRY_INTERVAL);
  }

  // Timeout reached - throw detailed error
  if (typeof context === 'string') {
    // Legacy string message support
    const finalError = lastError || new Error(context);
    const timeoutError = new TimeoutError(`${context}`, {
      operation: 'waitUntilVisible',
      timeout,
      lastError: finalError
    });
    logger.error(`waitUntilVisible: ${timeoutError.getFormattedMessage()}`);
    throw timeoutError;
  }

  // Throw AssertionError with full context
  const assertionError = new AssertionError(
    `${context.operation} assertion failed: expected ${JSON.stringify(context.expected)} but got ${JSON.stringify(context.actual ?? 'element not visible')}`,
    {
      expected: context.expected!,
      actual: context.actual ?? 'element not visible',
      locator: context.locator,
      timeout,
      lastError: lastError ?? undefined
    }
  );
  logger.error(`waitUntilVisible: ${assertionError.getFormattedMessage()}`);
  throw assertionError;
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
  context: ErrorContext | string,
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
    } catch {
      // Element not found in DOM - considered hidden (this is expected behavior)
      return;
    }
    
    // Wait before next retry
    await TimeUtils.sleep(TIMING.DEFAULT_RETRY_INTERVAL);
  }

  // Timeout reached - element still visible
  if (typeof context === 'string') {
    // Legacy string message support
    const timeoutError = new TimeoutError(`${context}`, {
      operation: 'waitUntilHidden',
      timeout,
      lastError: lastError ?? undefined
    });
    logger.error(`waitUntilHidden: ${timeoutError.getFormattedMessage()}`);
    throw timeoutError;
  }

  // Throw AssertionError with full context
  const assertionError = new AssertionError(
    `${context.operation} assertion failed: expected ${JSON.stringify(context.expected)} but got ${JSON.stringify(context.actual ?? 'element still visible')}`,
    {
      expected: context.expected!,
      actual: context.actual ?? 'element still visible',
      locator: context.locator,
      timeout,
      lastError: lastError ?? undefined
    }
  );
  logger.error(`waitUntilHidden: ${assertionError.getFormattedMessage()}`);
  throw assertionError;
}

/**
 * Assert that two values are strictly equal (===)
 */
export function equal<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new AssertionError(
      message || `Expected ${formatValue(actual)} to equal ${formatValue(expected)}`,
      {
        expected: String(expected),
        actual: String(actual)
      }
    );
  }
}

/**
 * Create standardized assertion error message
 * @example createErrorMessage('title', 'Expected', 'Got') -> 'Expected title "Expected" but got "Got"'
 */
export function createAssertionError(assertionType: string, expected: string, actual: string): string {
  return `Expected ${assertionType} "${expected}" but got "${actual}"`;
}
