/**
 * Shared assertion utilities for SaniumTS framework
 * Provides constants, retry mechanisms, and inline assertion logic
 */

import { TimeUtils } from '@utils/TimeUtils';
import { formatValue } from '@utils/ValueFormatter';
import { TIMING } from '@config/Constants';

/**
 * Helper method to safely execute assertion logic with try-catch
 * Returns true if assertion passes, false if it fails
 */
export async function safeAssert(assertionFn: () => Promise<void>): Promise<boolean> {
  try {
    await assertionFn();
    return true;
  } catch {
    return false;
  }
}

/**
 * Core retry mechanism - waits until condition passes or timeout
 * Shared by both ElementAssertions and PageAssertions
 */
export async function waitUntil(
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
    }
    
    // Wait before next retry
    await TimeUtils.sleep(TIMING.DEFAULT_RETRY_INTERVAL);
  }

  // Timeout reached
  const finalError = lastError || new Error(errorMessage);
  throw new Error(`${errorMessage}\nLast error: ${finalError.message}`);
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

/**
 * Generic retry assertion helper for common pattern: fetch value, compare, retry on failure
 * Used by Element and Page assertions to reduce duplication
 * @param fetchValue - Async function that retrieves the actual value
 * @param compareValue - Function that performs the assertion (throws on failure)
 * @param assertionType - Description for error messages (e.g., 'title', 'element text')
 * @param timeout - Max time to retry (ms)
 */
export async function retryAssertion<T>(
  fetchValue: () => Promise<T>,
  compareValue: (actual: T) => void,
  assertionType: string,
  timeout: number
): Promise<void> {
  let lastActualValue: T;
  await waitUntil(
    async () => {
      lastActualValue = await fetchValue();
      return safeAssert(async () => {
        compareValue(lastActualValue);
      });
    },
    `Expected ${assertionType} but assertion failed`,
    timeout
  );
}
