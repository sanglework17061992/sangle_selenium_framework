import { SanError } from '@errors/SanError';
import { ErrorType } from '@enums';

/**
 * UnexpectedError - Thrown for unexpected or unrecoverable errors
 * 
 * @example
 * throw new UnexpectedError('Unexpected error occurred', {
 *   operation: 'createDriver',
 *   reason: 'WebDriver initialization failed',
 *   context: { browser: 'chrome', workerId: '1' }
 * });
 */
export class UnexpectedError extends SanError {
  readonly type = ErrorType.UnexpectedError;
  readonly operation?: string;
  readonly reason?: string;

  constructor(
    message: string,
    options?: {
      operation?: string;
      reason?: string;
      lastError?: Error;
      context?: Record<string, any>;
    }
  ) {
    super(message, { lastError: options?.lastError, context: options?.context });
    this.operation = options?.operation;
    this.reason = options?.reason;
    Object.setPrototypeOf(this, UnexpectedError.prototype);
  }

  getFormattedMessage(): string {
    const lines: string[] = [
      this.baseMessage,
      `  Error Type: ${this.type}`
    ];

    if (this.operation) {
      lines.push(`  Operation: ${this.operation}`);
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
