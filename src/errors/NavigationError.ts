import { SanError } from '@errors/SanError';

/**
 * NavigationError - Thrown when navigation or URL change fails
 * 
 * @example
 * throw new NavigationError('Failed to navigate to page', {
 *   url: 'https://example.com/login',
 *   reason: 'Connection timeout'
 * });
 */
export class NavigationError extends SanError {
  readonly url?: string;
  readonly reason?: string;

  constructor(
    message: string,
    options?: {
      url?: string;
      reason?: string;
      lastError?: Error;
      context?: Record<string, any>;
    }
  ) {
    super(message, { lastError: options?.lastError, context: options?.context });
    this.url = options?.url;
    this.reason = options?.reason;
    Object.setPrototypeOf(this, NavigationError.prototype);
  }

  getFormattedMessage(): string {
    const lines: string[] = [
      this.baseMessage,
      `  Error Type: ${this.type}`
    ];

    if (this.url) {
      lines.push(`  URL: ${this.url}`);
    }

    if (this.reason) {
      lines.push(`  Reason: ${this.reason}`);
    }

    lines.push(`  Timestamp: ${this.timestamp.toISOString()}`);

    return lines.join('\n');
  }
}
