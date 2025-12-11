import { SanError } from '@errors/SanError';
import { ErrorType } from '@enums';

/**
 * ActionabilityError - Thrown when an element is found but not actionable
 * 
 * @example
 * throw new ActionabilityError('Element not ready for interaction', {
 *   operation: 'click',
 *   locator: "css('button.disabled')",
 *   reason: 'Element is disabled'
 * });
 */
export class ActionabilityError extends SanError {
  readonly type = ErrorType.ActionabilityError;
  readonly operation: string;
  readonly locator?: string;
  readonly reason?: string;

  constructor(
    message: string,
    options: {
      operation: string;
      locator?: string;
      reason?: string;
      lastError?: Error;
      context?: Record<string, any>;
    }
  ) {
    super(message, { lastError: options.lastError, context: options.context });
    this.operation = options.operation;
    this.locator = options.locator;
    this.reason = options.reason;
    Object.setPrototypeOf(this, ActionabilityError.prototype);
  }

  getFormattedMessage(): string {
    const lines: string[] = [
      this.baseMessage,
      `  Error Type: ${this.type}`,
      `  Operation: ${this.operation}`
    ];

    if (this.locator) {
      lines.push(`  Locator: ${this.locator}`);
    }

    if (this.reason) {
      lines.push(`  Reason: ${this.reason}`);
    }

    lines.push(`  Timestamp: ${this.timestamp.toISOString()}`);

    return lines.join('\n');
  }
}
