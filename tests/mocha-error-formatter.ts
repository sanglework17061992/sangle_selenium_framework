/**
 * Custom Mocha reporter integration for SanError formatting
 * This file hooks into Mocha to provide better error output formatting
 */

import { SanError } from '@errors';

/**
 * Hook to be called after each test failure to format the error message
 * This helps ensure errors are displayed in the expected format
 */
export function setupErrorFormatting(): void {
  // Store original console.error to prevent duplicates
  const originalError = console.error;
  let lastErrorMessage: string | null = null;

  // Intercept console.error to prevent duplicate error formatting
  console.error = function(...args: any[]): void {
    const message = args[0]?.toString?.() || String(args[0]);
    
    // Skip if it's the same error being printed twice
    if (message === lastErrorMessage) {
      return;
    }
    
    lastErrorMessage = message;
    originalError.apply(console, args);
  };
}

/**
 * Custom formatter for test failure messages
 * Ensures SanError instances are displayed in the expected format
 */
export function formatTestError(error: Error | Record<string, unknown>): string {
  if (error instanceof SanError) {
    return error.getFormattedMessage();
  }
  
  if (error?.message) {
    const msg = error.message;
    return typeof msg === 'string' ? msg : JSON.stringify(msg);
  }
  
  return JSON.stringify(error);
}
