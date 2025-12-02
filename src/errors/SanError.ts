/**
 * SanError - Universal error class for all SaniumTS framework errors
 * 
 * Supports all error scenarios with a flexible options-based approach:
 * - Element operation failures (with locator, actionType, timeout)
 * - Assertion failures (with expected/actual values)
 * - Navigation failures (with URL)
 * - Configuration errors (with configKey)
 * - Timeout errors (with operation)
 * - And more...
 * 
 * @example
 * // Element not found
 * throw new SanError('Element not found', {
 *   type: 'ElementError',
 *   locator: "button.submit",
 *   timeout: 10000
 * });
 * 
 * // Assertion failed
 * throw new SanError('Assertion failed: expected visible but got hidden', {
 *   type: 'AssertionError',
 *   expected: 'visible',
 *   actual: 'hidden',
 *   locator: "input.email"
 * });
 * 
 * // Navigation error
 * throw new SanError('Failed to navigate to login page', {
 *   type: 'NavigationError',
 *   url: 'https://example.com/login'
 * });
 */
export class SanError extends Error {
  readonly timestamp: Date;
  readonly type: string;
  readonly context?: Record<string, any>;

  // Common properties for different error scenarios
  readonly locator?: string;
  readonly timeout?: number;
  readonly expected?: string | boolean;
  readonly actual?: string | boolean;
  readonly url?: string;
  readonly operation?: string;
  readonly reason?: string;
  readonly configKey?: string;
  readonly lastError?: Error;

  private readonly baseMessage: string;

  constructor(
    message: string,
    options?: {
      type?: string;
      locator?: string;
      timeout?: number;
      expected?: string | boolean;
      actual?: string | boolean;
      url?: string;
      operation?: string;
      reason?: string;
      configKey?: string;
      lastError?: Error;
      context?: Record<string, any>;
    }
  ) {
    super(message);
    this.baseMessage = message;
    this.name = 'SanError';
    this.timestamp = new Date();
    this.type = options?.type || 'SanError';
    this.locator = options?.locator;
    this.timeout = options?.timeout;
    this.expected = options?.expected;
    this.actual = options?.actual;
    this.url = options?.url;
    this.operation = options?.operation;
    this.reason = options?.reason;
    this.configKey = options?.configKey;
    this.lastError = options?.lastError;
    this.context = options?.context;

    // Preserve stack trace for V8 engines (Node.js, Chrome)
    Error.captureStackTrace(this, this.constructor);
    
    // Set the message property to include full formatted message for all test runners
    this.message = this.getFormattedMessage();
  }

  /**
   * Get formatted error message with all relevant context
   */
  getFormattedMessage(): string {
    const lines = [this.baseMessage, `  Error Type: ${this.type}`];

    // Add type-specific details
    if (this.expected !== undefined) {
      lines.push(`  Expected: ${JSON.stringify(this.expected)}`);
    }

    if (this.actual !== undefined) {
      lines.push(`  Actual: ${JSON.stringify(this.actual)}`);
    }

    if (this.locator) {
      lines.push(`  Locator: ${this.locator}`);
    }

    if (this.operation) {
      lines.push(`  Operation: ${this.operation}`);
    }

    if (this.reason) {
      lines.push(`  Reason: ${this.reason}`);
    }

    if (this.url) {
      lines.push(`  URL: ${this.url}`);
    }

    if (this.configKey) {
      lines.push(`  Config Key: ${this.configKey}`);
    }

    if (this.timeout) {
      lines.push(`  Timeout: ${this.timeout}ms`);
    }

    if (this.lastError) {
      lines.push(`  Last Error: ${this.lastError.message}`);
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

  /**
   * Override toString to return formatted message for better debugging
   * This is called when error is printed or logged
   */
  override toString(): string {
    return this.getFormattedMessage();
  }

  /**
   * Print formatted error to console for better visibility
   * Useful when test runner doesn't capture full message
   */
  printToConsole(): void {
    const formatted = this.getFormattedMessage();
    console.error('\n\n' + '[ERROR] ' + '='.repeat(75));
    console.error(formatted);
    console.error('='.repeat(82) + '\n');
  }
}

