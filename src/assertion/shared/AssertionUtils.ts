/**
 * Shared assertion utilities for SaniumTS framework
 * Provides constants, retry mechanisms, and inline assertion logic
 * This replaces AssertHelper with cleaner, self-contained functions
 */

import { configLoader } from '../../config/ConfigLoader';

// ============================================================================
// SECTION: Constants
// ============================================================================

const testConfig = configLoader.getTestConfig();
export const DEFAULT_TIMEOUT = 5000; // 5 seconds like Playwright
export const POLL_INTERVAL = 100; // Poll every 100ms

// ============================================================================
// SECTION: Retry Mechanisms - Used by auto-retry assertions
// ============================================================================

/**
 * Helper method to safely execute assertion logic with try-catch
 * Returns true if assertion passes, false if it fails
 * Shared by both ElementAssertions and PageAssertions
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

  while (Date.now() - startTime < timeout) {
    try {
      const result = await condition();
      if (result) {
        return; // Condition passed
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
    }
    
    // Wait before next retry
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
  }

  // Timeout reached - throw error
  const timeoutMsg = `Timeout ${timeout}ms exceeded waiting for ${errorMessage}`;
  if (lastError) {
    throw new Error(`${timeoutMsg}\n${lastError.message}`);
  }
  throw new Error(timeoutMsg);
}

// ============================================================================
// SECTION: Inline Assertion Logic - Replaces AssertHelper
// ============================================================================

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

/**
 * Assert that two values are not strictly equal (!==)
 */
export function notEqual<T>(actual: T, expected: T, message?: string): void {
  if (actual === expected) {
    throw new Error(message || `Expected ${formatValue(actual)} not to equal ${formatValue(expected)}`);
  }
}

/**
 * Assert that a string contains a substring or array contains an element
 */
export function include(haystack: string | any[], needle: any, message?: string): void {
  if (typeof haystack === 'string') {
    if (!haystack.includes(needle)) {
      throw new Error(message || `Expected "${haystack}" to include "${needle}"`);
    }
  } else if (Array.isArray(haystack)) {
    if (!haystack.includes(needle)) {
      throw new Error(message || `Expected array ${formatValue(haystack)} to include ${formatValue(needle)}`);
    }
  } else {
    throw new TypeError('include assertion only works with strings or arrays');
  }
}

/**
 * Assert that a string does not contain a substring or array does not contain an element
 */
export function notInclude(haystack: string | any[], needle: any, message?: string): void {
  if (typeof haystack === 'string') {
    if (haystack.includes(needle)) {
      throw new Error(message || `Expected "${haystack}" not to include "${needle}"`);
    }
  } else if (Array.isArray(haystack)) {
    if (haystack.includes(needle)) {
      throw new Error(message || `Expected array ${formatValue(haystack)} not to include ${formatValue(needle)}`);
    }
  } else {
    throw new TypeError('notInclude assertion only works with strings or arrays');
  }
}

/**
 * Assert that a value is true
 */
export function isTrue(value: any, message?: string): void {
  if (value !== true) {
    throw new Error(message || `Expected ${formatValue(value)} to be true`);
  }
}

/**
 * Assert that a value is false
 */
export function isFalse(value: any, message?: string): void {
  if (value !== false) {
    throw new Error(message || `Expected ${formatValue(value)} to be false`);
  }
}

/**
 * Assert that a value is truthy
 */
export function isTruthy(value: any, message?: string): void {
  if (!value) {
    throw new Error(message || `Expected ${formatValue(value)} to be truthy`);
  }
}

/**
 * Assert that a value is falsy
 */
export function isFalsy(value: any, message?: string): void {
  if (value) {
    throw new Error(message || `Expected ${formatValue(value)} to be falsy`);
  }
}

/**
 * Assert that a value is null
 */
export function isNull(value: any, message?: string): void {
  if (value !== null) {
    throw new Error(message || `Expected ${formatValue(value)} to be null`);
  }
}

/**
 * Assert that a value is not null
 */
export function isNotNull(value: any, message?: string): void {
  if (value === null) {
    throw new Error(message || `Expected ${formatValue(value)} not to be null`);
  }
}

/**
 * Assert that a value is undefined
 */
export function isUndefined(value: any, message?: string): void {
  if (value !== undefined) {
    throw new Error(message || `Expected ${formatValue(value)} to be undefined`);
  }
}

/**
 * Assert that a value is not undefined
 */
export function isDefined(value: any, message?: string): void {
  if (value === undefined) {
    throw new Error(message || `Expected value to be defined, but got undefined`);
  }
}

/**
 * Assert that a value is greater than another
 */
export function greaterThan(actual: number, expected: number, message?: string): void {
  if (actual <= expected) {
    throw new Error(message || `Expected ${actual} to be greater than ${expected}`);
  }
}

/**
 * Assert that a value is less than another
 */
export function lessThan(actual: number, expected: number, message?: string): void {
  if (actual >= expected) {
    throw new Error(message || `Expected ${actual} to be less than ${expected}`);
  }
}

/**
 * Assert that a value is greater than or equal to another
 */
export function greaterThanOrEqual(actual: number, expected: number, message?: string): void {
  if (actual < expected) {
    throw new Error(message || `Expected ${actual} to be greater than or equal to ${expected}`);
  }
}

/**
 * Assert that a value is less than or equal to another
 */
export function lessThanOrEqual(actual: number, expected: number, message?: string): void {
  if (actual > expected) {
    throw new Error(message || `Expected ${actual} to be less than or equal to ${expected}`);
  }
}

/**
 * Assert that an array has exactly the same members as expected
 */
export function hasMembers(actual: any[], expected: any[], message?: string): void {
  if (!Array.isArray(actual) || !Array.isArray(expected)) {
    throw new TypeError('hasMembers assertion requires both arguments to be arrays');
  }
  
  if (actual.length !== expected.length) {
    throw new Error(message || `Expected array to have ${expected.length} members but got ${actual.length}`);
  }
  
  for (const item of expected) {
    if (!actual.includes(item)) {
      throw new Error(message || `Expected array ${formatValue(actual)} to include ${formatValue(item)}`);
    }
  }
  
  for (const item of actual) {
    if (!expected.includes(item)) {
      throw new Error(message || `Expected array ${formatValue(actual)} not to include ${formatValue(item)}`);
    }
  }
}
