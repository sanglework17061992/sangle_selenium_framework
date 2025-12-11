import { SanError } from '@errors/SanError';
import { ErrorType } from '@enums';

/**
 * TimeoutError - Thrown when an operation exceeds its time limit
 * 
 * @example
 * throw new TimeoutError('Failed to find element within 10000ms', {
 *   operation: 'Element visibility check',
 *   timeout: 10000,
 *   locator: "xpath('//button')",
 *   reason: 'Element was not found'
 * });
 */
export class TimeoutError extends SanError {
  readonly type = ErrorType.TimeoutError;
  readonly operation: string;
  readonly timeout: number;
  readonly locator?: string;
  readonly reason?: string;

  constructor(
    message: string,
    options: {
      operation: string;
      timeout: number;
      locator?: string;
      reason?: string;
      lastError?: Error;
      context?: Record<string, any>;
    }
  ) {
    super(message, { lastError: options.lastError, context: options.context });
    this.operation = options.operation;
    this.timeout = options.timeout;
    this.locator = options.locator;
    this.reason = options.reason;
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }

  getFormattedMessage(): string {
    const lines: string[] = [
      `${this.type}: ${this.baseMessage}`,
      `  Error Type: ${this.type}`,
      `  Operation: ${this.operation}`,
      `  Timeout: ${this.timeout}ms`
    ];

    if (this.locator) {
      lines.push(`  Locator: ${this.locator}`);
    }

    if (this.reason) {
      lines.push(`  Reason: ${this.reason}`);
    }

    if (this.lastError) {
      lines.push(`  Last Error: ${this.lastError.message}`);
    }

    return lines.join('\n');
  }
}
