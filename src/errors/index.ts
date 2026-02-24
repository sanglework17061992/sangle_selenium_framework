/**
 * Error handling exports for SaniumTS framework
 * 
 * Export all error classes for framework-wide usage.
 * Each error class is in its own file for better maintainability.
 * 
 * @example
 * import { AssertionError, TimeoutError, ElementError } from '@errors';
 * 
 * throw new AssertionError('toBeVisible failed', {
 *   expected: 'visible',
 *   actual: 'hidden'
 * });
 */

// Base error class
export { SanError } from '@errors/SanError';

// Specific error classes
export { AssertionError } from '@errors/AssertionError';
export { TimeoutError } from '@errors/TimeoutError';
export { ElementError } from '@errors/ElementError';
export { ActionabilityError } from '@errors/ActionabilityError';
export { ConfigurationError } from '@errors/ConfigurationError';
export { NavigationError } from '@errors/NavigationError';
export { UnexpectedError } from '@errors/UnexpectedError';

// Error-related types
export type { ErrorContext } from '@errorTypes';
