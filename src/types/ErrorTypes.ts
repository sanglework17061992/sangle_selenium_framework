/**
 * Type definitions for error handling in SaniumTS framework
 */

/**
 * Context information for detailed error messages
 * Used to build rich error instances with full context across the framework
 * 
 * @example
 * // For assertions
 * const context: ErrorContext = {
 *   operation: 'toBeVisible',
 *   expected: 'visible',
 *   actual: 'hidden',
 *   locator: "css('button.submit')",
 *   timeout: 10000
 * };
 * 
 * // For element operations
 * const context: ErrorContext = {
 *   operation: 'findElement',
 *   locator: "css('input')",
 *   timeout: 5000,
 *   reason: 'Element not found in DOM'
 * };
 * 
 * // For configuration errors
 * const context: ErrorContext = {
 *   operation: 'getBaseUrl',
 *   configKey: 'BASE_URL',
 *   expected: 'non-empty string',
 *   actual: 'undefined'
 * };
 */
export interface ErrorContext {
  /** The operation being performed (e.g., 'findElement', 'click', 'toBeVisible') */
  operation?: string;
  /** The expected value or state */
  expected?: string | boolean;
  /** The actual value or state */
  actual?: string | boolean;
  /** The element locator (for element-related errors) */
  locator?: string;
  /** Timeout in milliseconds (for timeout-related errors) */
  timeout?: number;
  /** Reason for the error */
  reason?: string;
  /** Configuration key (for config-related errors) */
  configKey?: string;
  /** URL (for navigation-related errors) */
  url?: string;
  /** Additional metadata */
  metadata?: Record<string, any>;
}
