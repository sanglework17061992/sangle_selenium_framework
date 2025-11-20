/**
 * TypeAssertion - Immediate (non-retrying) value assertions
 * 
 * This class provides assertions for primitive values and objects.
 * Unlike element/page assertions, these execute immediately without auto-retry.
 * 
 * @example
 * // Assert primitive values
 * expect(count).toBe(5);
 * expect(name).toEqual('John');
 */

import * as assert from '@assertion/shared/AssertionUtils';

export class TypeAssertion<T> {
  constructor(private readonly actualValue: T) {}

  /**
   * Helper to wrap assertion logic with better error messages
   */
  private handleAssertion(assertFn: () => void, defaultMsg: string, message?: string): void {
    try {
      assertFn();
    } catch (err) {
      const error = new Error(message || defaultMsg);
      if (err instanceof Error) {
        error.message += `\n${err.message}`;
      }
      throw error;
    }
  }

  /**
   * Assert that the value strictly equals (===) the expected value
   * @example expect(count).toBe(5)
   */
  toBe(expected: T, message?: string): void {
    this.handleAssertion(
      () => assert.equal(this.actualValue, expected),
      `Expected ${this.actualValue} to equal ${expected}`,
      message
    );
  }

  /**
   * Alias for toBe() - asserts strict equality
   * @example expect(name).toEqual('John')
   */
  toEqual(expected: T, message?: string): void {
    this.toBe(expected, message);
  }
}
