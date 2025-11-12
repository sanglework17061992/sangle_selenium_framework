/**
 * TypeAssertion - Immediate (non-retrying) value assertions
 * 
 * This class provides assertions for primitive values, objects, and arrays.
 * Unlike element/page assertions, these execute immediately without auto-retry.
 * 
 * Can be used anywhere in your tests for asserting:
 * - Numbers, strings, booleans
 * - Arrays and their contents
 * 
 * @example
 * // Assert primitive values
 * expect(count).toBe(5);
 * expect(name).toEqual('John');
 * expect(status).toBeTrue();
 * 
 * // Assert arrays
 * expect(items).toInclude('apple');
 */

import * as assert from './shared/AssertionUtils';

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

  /**
   * Assert that the value does not equal (!==) the expected value
   * @example expect(status).toNotBe('pending')
   */
  toNotBe(expected: T, message?: string): void {
    this.handleAssertion(
      () => assert.notEqual(this.actualValue, expected),
      `Expected ${this.actualValue} not to equal ${expected}`,
      message
    );
  }

  /**
   * Assert that a string/array includes the expected value
   * @example 
   * expect('hello world').toInclude('world')
   * expect([1, 2, 3]).toInclude(2)
   */
  toInclude(expected: any, message?: string): void {
    this.handleAssertion(
      () => assert.include(this.actualValue as any, expected),
      `Expected ${this.actualValue} to include ${expected}`,
      message
    );
  }

  /**
   * Assert that a string/array does not include the expected value
   * @example 
   * expect('hello').toNotInclude('world')
   * expect([1, 2, 3]).toNotInclude(4)
   */
  toNotInclude(expected: any, message?: string): void {
    this.handleAssertion(
      () => assert.notInclude(this.actualValue as any, expected),
      `Expected ${this.actualValue} not to include ${expected}`,
      message
    );
  }

  /**
   * Assert that the value is strictly true (=== true)
   * @example expect(isActive).toBeTrue()
   */
  toBeTrue(message?: string): void {
    this.handleAssertion(
      () => assert.isTrue(this.actualValue),
      `Expected ${this.actualValue} to be true`,
      message
    );
  }

  /**
   * Assert that the value is strictly false (=== false)
   * @example expect(isDisabled).toBeFalse()
   */
  toBeFalse(message?: string): void {
    this.handleAssertion(
      () => assert.isFalse(this.actualValue),
      `Expected ${this.actualValue} to be false`,
      message
    );
  }
}
