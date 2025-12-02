import { SanError } from '@errors';

/**
 * Mocha Hooks for error formatting and test lifecycle management
 * These hooks ensure SanError exceptions are properly formatted in test output
 */

// Hook that runs after each failed test to format error messages
export function setupMochaHooks(): void {
  // This would need to be called from mocha config but for now
  // we'll rely on the error formatting in SanError itself
}

/**
 * Format error for Mocha output
 * Ensures SanError messages are properly displayed
 */
export function formatErrorForOutput(error: Error): string {
  if (error instanceof SanError) {
    // SanError now handles its own formatting in getFormattedMessage()
    return error.getFormattedMessage();
  }
  return error.message;
}
