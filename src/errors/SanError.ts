/**
 * SanError - Base error class for all SaniumTS framework errors
 * 
 * This is the abstract base class that all specific error types extend from.
 * Do not throw SanError directly - use specific error types instead:
 * - AssertionError - for assertion failures
 * - TimeoutError - for timeout failures  
 * - ElementError - for element not found/actionable
 * - ConfigurationError - for configuration issues
 * - NavigationError - for navigation failures
 * - ActionabilityError - for actionability check failures
 * - UnexpectedError - for unexpected/unrecoverable errors
 * 
 * @example
 * // Use specific error types:
 * import { AssertionError, TimeoutError } from '@errors';
 * 
 * throw new AssertionError('expected visible but got hidden', {
 *   expected: 'visible',
 *   actual: 'hidden',
 *   locator: "button.submit"
 * });
 * 
 * throw new TimeoutError('Operation timed out', {
 *   operation: 'Element visibility check',
 *   timeout: 10000
 * });
 */
export abstract class SanError extends Error {
  readonly timestamp: Date;
  abstract readonly type: string;
  readonly context?: Record<string, any>;
  readonly lastError?: Error;

  protected readonly baseMessage: string;

  constructor(
    message: string,
    options?: {
      lastError?: Error;
      context?: Record<string, any>;
    }
  ) {
    super(message);
    this.baseMessage = message;
    this.name = this.constructor.name;
    this.timestamp = new Date();
    this.lastError = options?.lastError;
    this.context = options?.context;

    // Preserve stack trace for V8 engines (Node.js, Chrome)
    Error.captureStackTrace(this, this.constructor);
    
    // Set the message property to include full formatted message for all test runners
    this.message = this.getFormattedMessage();
  }

  /**
   * Get formatted error message with all relevant context
   * Subclasses override this to provide specific formatting
   */
  abstract getFormattedMessage(): string;

  /**
   * Override toString to return formatted message for better debugging
   * This is called when error is printed or logged
   */
  override toString(): string {
    return this.getFormattedMessage();
  }

  /**
   * Get loggable error message for framework logger
   * Used by Winston logger for writing to error.log and combined.log files
   * This is automatically called when the logger processes the error
   */
  getLoggableError(): string {
    return this.getFormattedMessage();
  }
}
