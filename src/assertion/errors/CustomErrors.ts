/**
 * Custom Error Classes for SaniumTS Assertion Framework
 * Provides detailed, context-rich error messages for better debugging
 */

type AssertionValue = string | boolean | undefined;

/**
 * AssertionError - Thrown when an assertion fails after exhausting retries
 * Includes detailed context about what was expected, what was found, and the locator
 */
export class AssertionError extends Error {
  readonly assertionType: string;
  readonly expected: string | boolean;
  readonly actual: AssertionValue;
  readonly locator: string | undefined;
  readonly timeout: number | undefined;
  readonly lastError: Error | undefined;

  constructor(
    assertionType: string,
    expected: string | boolean,
    actual: AssertionValue,
    locator?: string,
    timeout?: number,
    lastError?: Error
  ) {
    const message = AssertionError.formatMessage(
      assertionType,
      expected,
      actual,
      locator,
      timeout,
      lastError
    );

    super(message);
    this.name = 'AssertionError';
    this.assertionType = assertionType;
    this.expected = expected;
    this.actual = actual;
    this.locator = locator;
    this.timeout = timeout;
    this.lastError = lastError;

    // Preserve stack trace for V8 engines (Node.js, Chrome)
    Error.captureStackTrace(this, AssertionError);
  }

  /**
   * Format detailed error message with all context information
   */
  private static formatMessage(
    assertionType: string,
    expected: string | boolean,
    actual: AssertionValue,
    locator?: string,
    timeout?: number,
    lastError?: Error
  ): string {
    const lines: string[] = [
      `AssertionError: ${assertionType} assertion failed`,
      '',
      `  Assertion Type: ${assertionType}`,
      `  Expected: ${JSON.stringify(expected)}`,
      `  Actual: ${JSON.stringify(actual ?? 'unknown')}`,
    ];

    if (locator) {
      lines.push(`  Locator: ${locator}`);
    }

    if (timeout) {
      lines.push(`  Timeout: ${timeout}ms`);
    }

    if (lastError) {
      lines.push(`  Last Error: ${lastError.message}`);
    }

    return lines.join('\n');
  }
}

/**
 * TimeoutError - Thrown when an operation exceeds the timeout threshold
 * Used when retry mechanism exhausts all attempts without success
 */
export class TimeoutError extends Error {
  readonly operation: string;
  readonly timeout: number;
  readonly lastError: Error | undefined;

  constructor(operation: string, timeout: number, lastError?: Error) {
    const message = TimeoutError.formatMessage(operation, timeout, lastError);

    super(message);
    this.name = 'TimeoutError';
    this.operation = operation;
    this.timeout = timeout;
    this.lastError = lastError;

    Error.captureStackTrace(this, TimeoutError);
  }

  private static formatMessage(
    operation: string,
    timeout: number,
    lastError?: Error
  ): string {
    const lines: string[] = [
      `TimeoutError: ${operation} timed out after ${timeout}ms`,
    ];

    if (lastError) {
      lines.push(`Last error: ${lastError.message}`);
    }

    return lines.join('\n');
  }
}

/**
 * ActionabilityError - Thrown when an element is not ready for the requested action
 * Includes information about the action type and reason for failure
 */
export class ActionabilityError extends Error {
  readonly locator: string | undefined;
  readonly actionType: string;
  readonly reason: string;
  readonly timeout: number | undefined;

  constructor(
    actionType: string,
    reason: string,
    locator?: string,
    timeout?: number
  ) {
    const message = ActionabilityError.formatMessage(
      actionType,
      reason,
      locator,
      timeout
    );

    super(message);
    this.name = 'ActionabilityError';
    this.actionType = actionType;
    this.reason = reason;
    this.locator = locator;
    this.timeout = timeout;

    Error.captureStackTrace(this, ActionabilityError);
  }

  private static formatMessage(
    actionType: string,
    reason: string,
    locator?: string,
    timeout?: number
  ): string {
    const lines: string[] = [
      `ActionabilityError: Element not ready for ${actionType}`,
      '',
      `  Action Type: ${actionType}`,
      `  Reason: ${reason}`,
    ];

    if (locator) {
      lines.push(`  Locator: ${locator}`);
    }

    if (timeout) {
      lines.push(`  Timeout: ${timeout}ms`);
    }

    return lines.join('\n');
  }
}
