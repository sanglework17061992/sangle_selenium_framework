/**
 * TypeAssertion - Immediate (non-retrying) value assertions
 * 
 * This class provides assertions for primitive values, objects, and arrays.
 * Unlike element/page assertions, these execute immediately without auto-retry.
 * 
 * Can be used anywhere in your tests for asserting:
 * - Numbers, strings, booleans
 * - Arrays and their contents
 * - Objects and their properties
 * - Null/undefined checks
 * 
 * @example
 * // Assert primitive values
 * expect(count).toBe(5);
 * expect(name).toEqual('John');
 * expect(status).toBeTrue();
 * 
 * // Assert arrays
 * expect(items).toInclude('apple');
 * expect(tags).toHaveMembers(['test', 'demo']);
 * 
 * // Assert numbers
 * expect(score).toBeGreaterThan(50);
 * expect(age).toBeLessThan(100);
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
   * Assert that an array has exactly the same members (order doesn't matter)
   * @example expect(['a', 'b', 'c']).toHaveMembers(['c', 'a', 'b'])
   */
  toHaveMembers(expected: any[], message?: string): void {
    this.handleAssertion(
      () => assert.hasMembers(this.actualValue as any[], expected),
      `Expected ${this.actualValue} to have members ${expected}`,
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

  /**
   * Assert that the value is truthy (if/while would treat it as true)
   * @example expect('text').toBeTruthy()
   */
  toBeTruthy(message?: string): void {
    this.handleAssertion(
      () => assert.isTruthy(this.actualValue),
      `Expected ${this.actualValue} to be truthy`,
      message
    );
  }

  /**
   * Assert that the value is falsy (if/while would treat it as false)
   * @example expect(0).toBeFalsy()
   */
  toBeFalsy(message?: string): void {
    this.handleAssertion(
      () => assert.isFalsy(this.actualValue),
      `Expected ${this.actualValue} to be falsy`,
      message
    );
  }

  /**
   * Assert that a number is greater than the expected value
   * @example expect(score).toBeGreaterThan(50)
   */
  toBeGreaterThan(expected: number, message?: string): void {
    this.handleAssertion(
      () => assert.greaterThan(this.actualValue as any, expected),
      `Expected ${this.actualValue} to be greater than ${expected}`,
      message
    );
  }

  /**
   * Assert that a number is less than the expected value
   * @example expect(age).toBeLessThan(100)
   */
  toBeLessThan(expected: number, message?: string): void {
    this.handleAssertion(
      () => assert.lessThan(this.actualValue as any, expected),
      `Expected ${this.actualValue} to be less than ${expected}`,
      message
    );
  }

  /**
   * Assert that a number is greater than or equal to the expected value
   * @example expect(score).toBeGreaterThanOrEqual(50)
   */
  toBeGreaterThanOrEqual(expected: number, message?: string): void {
    this.handleAssertion(
      () => assert.greaterThanOrEqual(this.actualValue as any, expected),
      `Expected ${this.actualValue} to be greater than or equal to ${expected}`,
      message
    );
  }

  /**
   * Assert that a number is less than or equal to the expected value
   * @example expect(age).toBeLessThanOrEqual(100)
   */
  toBeLessThanOrEqual(expected: number, message?: string): void {
    this.handleAssertion(
      () => assert.lessThanOrEqual(this.actualValue as any, expected),
      `Expected ${this.actualValue} to be less than or equal to ${expected}`,
      message
    );
  }

  /**
   * Assert that the value is null
   * @example expect(result).toBeNull()
   */
  toBeNull(message?: string): void {
    this.handleAssertion(
      () => assert.isNull(this.actualValue),
      `Expected ${this.actualValue} to be null`,
      message
    );
  }

  /**
   * Assert that the value is not null
   * @example expect(result).toNotBeNull()
   */
  toNotBeNull(message?: string): void {
    this.handleAssertion(
      () => assert.isNotNull(this.actualValue),
      `Expected ${this.actualValue} not to be null`,
      message
    );
  }

  /**
   * Assert that the value is undefined
   * @example expect(result).toBeUndefined()
   */
  toBeUndefined(message?: string): void {
    this.handleAssertion(
      () => assert.isUndefined(this.actualValue),
      `Expected ${this.actualValue} to be undefined`,
      message
    );
  }

  /**
   * Assert that the value is defined (not undefined)
   * @example expect(result).toBeDefined()
   */
  toBeDefined(message?: string): void {
    this.handleAssertion(
      () => assert.isDefined(this.actualValue),
      `Expected value to be defined`,
      message
    );
  }
}
