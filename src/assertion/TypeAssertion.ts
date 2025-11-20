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

import { equal } from '@assertion/shared/AssertionUtils';

export class TypeAssertion<T> {
  constructor(private readonly actualValue: T) {}

  /**
   * Assert that the value strictly equals (===) the expected value
   * @example expect(count).toBe(5)
   */
  toBe(expected: T, message?: string): void {
    equal(this.actualValue, expected, message);
  }

  /**
   * Alias for toBe() - asserts strict equality
   * @example expect(name).toEqual('John')
   */
  toEqual(expected: T, message?: string): void {
    this.toBe(expected, message);
  }
}
