import { SanError } from '@errors/SanError';
import { ErrorType } from '@enums';

/**
 * ElementError - Thrown when an element is not found, not visible, or not actionable
 * 
 * @example
 * throw new ElementError('Failed to find element', {
 *   locator: "css('input.email')",
 *   timeout: 5000,
 *   reason: 'Element not found in DOM'
 * });
 */
export class ElementError extends SanError {
  readonly type = ErrorType.ElementError;
  readonly locator: string;
  readonly timeout?: number;
  readonly reason?: string;

  constructor(
    message: string,
    options: {
      locator: string;
      timeout?: number;
      reason?: string;
      lastError?: Error;
      context?: Record<string, any>;
    }
  ) {
    super(message, { lastError: options.lastError, context: options.context });
    this.locator = options.locator;
    this.timeout = options.timeout;
    this.reason = options.reason;
    Object.setPrototypeOf(this, ElementError.prototype);
  }

  getFormattedMessage(): string {
    const lines: string[] = [
      this.baseMessage,
      `  Error Type: ${this.type}`,
      `  Locator: ${this.locator}`
    ];

    if (this.timeout) {
      lines.push(`  Timeout: ${this.timeout}ms`);
    }

    if (this.reason) {
      lines.push(`  Reason: ${this.reason}`);
    }

    if (this.context && Object.keys(this.context).length > 0) {
      lines.push('  Context:');
      for (const [key, value] of Object.entries(this.context)) {
        lines.push(`    ${key}: ${JSON.stringify(value)}`);
      }
    }

    lines.push(`  Timestamp: ${this.timestamp.toISOString()}`);

    return lines.join('\n');
  }
}
