import { SanError } from '@errors/SanError';
import { ErrorType } from '@enums';

/**
 * AssertionError - Thrown when an assertion fails
 * 
 * @example
 * throw new AssertionError('toBeVisible assertion failed: expected visible but got hidden', {
 *   expected: 'visible',
 *   actual: 'hidden',
 *   locator: "css('button.submit')",
 *   timeout: 10000
 * });
 */
export class AssertionError extends SanError {
  readonly type = ErrorType.AssertionError;
  readonly expected: string | boolean;
  readonly actual?: string | boolean;
  readonly locator?: string;
  readonly timeout?: number;

  constructor(
    message: string,
    options: {
      expected: string | boolean;
      actual?: string | boolean;
      locator?: string;
      timeout?: number;
      lastError?: Error;
      context?: Record<string, any>;
    }
  ) {
    super(message, { lastError: options.lastError, context: options.context });
    this.expected = options.expected;
    this.actual = options.actual;
    this.locator = options.locator;
    this.timeout = options.timeout;
    Object.setPrototypeOf(this, AssertionError.prototype);
  }

  getFormattedMessage(): string {
    const lines: string[] = [];

    // Extract assertion type from base message (format: "assertionName assertion failed: ...")
    const assertionMatch = /^(.+?)\s+assertion\s+failed/.exec(this.baseMessage);
    const assertionType = assertionMatch ? assertionMatch[1] : 'Unknown';

    lines.push(
      `AssertionError: ${assertionType} assertion failed`,
      '',
      `  Assertion Type: ${assertionType}`,
      `  Expected: ${JSON.stringify(this.expected)}`
    );

    if (this.actual !== undefined) {
      lines.push(`  Actual: ${JSON.stringify(this.actual)}`);
    }

    if (this.locator) {
      lines.push(`  Locator: ${this.locator}`);
    }

    if (this.timeout) {
      lines.push(`  Timeout: ${this.timeout}ms`);
    }

    return lines.join('\n');
  }
}
