// Export all reporters
export { AllureReporter, createAllureReporter, shouldUseAllureReporter } from './AllureReporter';
export { MochawesomeReporter, createMochawesomeReporter, shouldUseMochawesomeReporter } from './MochawesomeReporter';

// Re-export TestReporter interface for convenience
export type { TestReporter } from '../base/BaseTest';

import { createAllureReporter, shouldUseAllureReporter } from './AllureReporter';
import { createMochawesomeReporter, shouldUseMochawesomeReporter } from './MochawesomeReporter';
import { ConfigLoader, ReporterType } from '../config/ConfigLoader';

/**
 * Auto-detect and create appropriate reporter based on:
 * 1. Configuration file (.env REPORTER_TYPE)
 * 2. Command line arguments (--reporter flag)
 * 
 * @returns Reporter instance or undefined (will use NoOpReporter)
 * 
 * @example
 * // Automatically select reporter based on config
 * const test = new TodoTest(createReporter());
 * 
 * // Or explicitly create specific reporter:
 * const test = new TodoTest(createAllureReporter());
 * const test = new TodoTest(createMochawesomeReporter());
 */
export function createReporter() {
  // First check CLI arguments (highest priority)
  if (shouldUseAllureReporter()) {
    return createAllureReporter();
  }
  
  if (shouldUseMochawesomeReporter()) {
    return createMochawesomeReporter();
  }
  
  // Then check config file
  const config = ConfigLoader.getInstance().getConfig();
  const reporterType = config.reporting.reporterType;
  
  switch (reporterType) {
    case ReporterType.ALLURE:
      return createAllureReporter();
    case ReporterType.MOCHAWESOME:
      return createMochawesomeReporter();
    case ReporterType.NONE:
      return undefined;
    default:
      return undefined;
  }
}

