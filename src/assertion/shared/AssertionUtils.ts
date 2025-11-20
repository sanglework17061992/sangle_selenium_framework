/**
 * Shared assertion utilities for SaniumTS framework
 * Provides constants, retry mechanisms, and inline assertion logic
 */

import { TimeUtils } from '@utils/TimeUtils';
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
 * Helper method to format values for error messages
 */
function formatValue(value: any): string {
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }
  if (typeof value === 'function') {
    return '[Function]';
  }
  if (Array.isArray(value)) {
    return `[${value.map(v => formatValue(v)).join(', ')}]`;
  }
  return String(value);
}

/**
 * Assert that two values are strictly equal (===)
 */
export function equal<T>(actual: T, expected: T, message?: string): void {
  if (actual !== expected) {
    throw new Error(message || `Expected ${formatValue(actual)} to equal ${formatValue(expected)}`);
  }
}
