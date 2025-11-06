/**
 * Custom assertion utilities for SaniumTS framework
 * Provides lightweight, self-contained assertions without external dependencies
 */

export class AssertHelper {
  /**
   * Assert that two values are strictly equal (===)
   */
  static equal<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      throw new Error(message || `Expected ${this.formatValue(actual)} to equal ${this.formatValue(expected)}`);
    }
  }

  /**
   * Assert that two values are not strictly equal (!==)
   */
  static notEqual<T>(actual: T, expected: T, message?: string): void {
    if (actual === expected) {
      throw new Error(message || `Expected ${this.formatValue(actual)} not to equal ${this.formatValue(expected)}`);
    }
  }

  /**
   * Assert that a string contains a substring or array contains an element
   */
  static include(haystack: string | any[], needle: any, message?: string): void {
    if (typeof haystack === 'string') {
      if (!haystack.includes(needle)) {
        throw new Error(message || `Expected "${haystack}" to include "${needle}"`);
      }
    } else if (Array.isArray(haystack)) {
      if (!haystack.includes(needle)) {
        throw new Error(message || `Expected array ${this.formatValue(haystack)} to include ${this.formatValue(needle)}`);
      }
    } else {
      throw new TypeError('NotInclude assertion only works with strings or arrays');
    }
  }

  /**
   * Assert that a string does not contain a substring or array does not contain an element
   */
  static notInclude(haystack: string | any[], needle: any, message?: string): void {
    if (typeof haystack === 'string') {
      if (haystack.includes(needle)) {
        throw new Error(message || `Expected "${haystack}" not to include "${needle}"`);
      }
    } else if (Array.isArray(haystack)) {
      if (haystack.includes(needle)) {
        throw new Error(message || `Expected array ${this.formatValue(haystack)} not to include ${this.formatValue(needle)}`);
      }
    } else {
      throw new TypeError('NotInclude assertion only works with strings or arrays');
    }
  }

  /**
   * Assert that a value is true
   */
  static isTrue(value: any, message?: string): void {
    if (value !== true) {
      throw new Error(message || `Expected ${this.formatValue(value)} to be true`);
    }
  }

  /**
   * Assert that a value is false
   */
  static isFalse(value: any, message?: string): void {
    if (value !== false) {
      throw new Error(message || `Expected ${this.formatValue(value)} to be false`);
    }
  }

  /**
   * Assert that a value is truthy
   */
  static isTruthy(value: any, message?: string): void {
    if (!value) {
      throw new Error(message || `Expected ${this.formatValue(value)} to be truthy`);
    }
  }

  /**
   * Assert that a value is falsy
   */
  static isFalsy(value: any, message?: string): void {
    if (value) {
      throw new Error(message || `Expected ${this.formatValue(value)} to be falsy`);
    }
  }

  /**
   * Assert that a value is null
   */
  static isNull(value: any, message?: string): void {
    if (value !== null) {
      throw new Error(message || `Expected ${this.formatValue(value)} to be null`);
    }
  }

  /**
   * Assert that a value is not null
   */
  static isNotNull(value: any, message?: string): void {
    if (value === null) {
      throw new Error(message || `Expected ${this.formatValue(value)} not to be null`);
    }
  }

  /**
   * Assert that a value is undefined
   */
  static isUndefined(value: any, message?: string): void {
    if (value !== undefined) {
      throw new Error(message || `Expected ${this.formatValue(value)} to be undefined`);
    }
  }

  /**
   * Assert that a value is not undefined
   */
  static isDefined(value: any, message?: string): void {
    if (value === undefined) {
      throw new Error(message || `Expected value to be defined, but got undefined`);
    }
  }

  /**
   * Assert that a value is greater than another
   */
  static greaterThan(actual: number, expected: number, message?: string): void {
    if (actual <= expected) {
      throw new Error(message || `Expected ${actual} to be greater than ${expected}`);
    }
  }

  /**
   * Assert that a value is less than another
   */
  static lessThan(actual: number, expected: number, message?: string): void {
    if (actual >= expected) {
      throw new Error(message || `Expected ${actual} to be less than ${expected}`);
    }
  }

  /**
   * Assert that a value is greater than or equal to another
   */
  static greaterThanOrEqual(actual: number, expected: number, message?: string): void {
    if (actual < expected) {
      throw new Error(message || `Expected ${actual} to be greater than or equal to ${expected}`);
    }
  }

  /**
   * Assert that a value is less than or equal to another
   */
  static lessThanOrEqual(actual: number, expected: number, message?: string): void {
    if (actual > expected) {
      throw new Error(message || `Expected ${actual} to be less than or equal to ${expected}`);
    }
  }

  /**
   * Assert that an array has exactly the same members as expected
   */
  static hasMembers(actual: any[], expected: any[], message?: string): void {
    if (!Array.isArray(actual) || !Array.isArray(expected)) {
      throw new TypeError('hasMembers assertion requires both arguments to be arrays');
    }
    
    if (actual.length !== expected.length) {
      throw new Error(message || `Expected array to have ${expected.length} members but got ${actual.length}`);
    }
    
    for (const item of expected) {
      if (!actual.includes(item)) {
        throw new Error(message || `Expected array ${this.formatValue(actual)} to include ${this.formatValue(item)}`);
      }
    }
    
    for (const item of actual) {
      if (!expected.includes(item)) {
        throw new Error(message || `Expected array ${this.formatValue(actual)} not to include ${this.formatValue(item)}`);
      }
    }
  }

  /**
   * Helper method to format values for error messages
   */
  private static formatValue(value: any): string {
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
      return `[${value.map(v => this.formatValue(v)).join(', ')}]`;
    }
    return String(value);
  }
}