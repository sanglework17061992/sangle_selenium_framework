export { BaseReporter } from './BaseReporter';
export type { TestReporter } from './BaseReporter';
export { AllureReporter, shouldUseAllureReporter, createAllureReporter } from './reporters/AllureReporter';
export { MochawesomeReporter, shouldUseMochawesomeReporter, createMochawesomeReporter } from './reporters/MochawesomeReporter';

import { ThenableWebDriver } from 'selenium-webdriver';
import { logger } from '@utils/Logger';
import { BaseReporter } from '@reporting/BaseReporter';
import { shouldUseAllureReporter, createAllureReporter } from '@reporting/reporters/AllureReporter';
import { shouldUseMochawesomeReporter, createMochawesomeReporter } from '@reporting/reporters/MochawesomeReporter';

/**
 * Simple CompositeReporter - Coordinates multiple reporters
 * Each reporter runs independently, failures don't stop others
 */
class CompositeReporter extends BaseReporter {
  constructor(private readonly reporters: BaseReporter[]) {
    super();
  }

  async beforeAll(): Promise<void> {
    for (const reporter of this.reporters) {
      try {
        await reporter.beforeAll?.();
      } catch (err) {
        logger.warn(`Reporter beforeAll failed: ${err}`);
      }
    }
  }

  async afterAll(): Promise<void> {
    for (const reporter of this.reporters) {
      try {
        await reporter.afterAll?.();
      } catch (err) {
        logger.warn(`Reporter afterAll failed: ${err}`);
      }
    }
  }

  async beforeEach(): Promise<void> {
    for (const reporter of this.reporters) {
      try {
        await reporter.beforeEach?.();
      } catch (err) {
        logger.warn(`Reporter beforeEach failed: ${err}`);
      }
    }
  }

  async afterEach(): Promise<void> {
    for (const reporter of this.reporters) {
      try {
        await reporter.afterEach?.();
      } catch (err) {
        logger.warn(`Reporter afterEach failed: ${err}`);
      }
    }
  }

  async onTestFailure(testName: string, error: Error): Promise<void> {
    for (const reporter of this.reporters) {
      try {
        await reporter.onTestFailure?.(testName, error);
      } catch (err) {
        logger.warn(`Reporter onTestFailure failed: ${err}`);
      }
    }
  }

  setDriver(driver: ThenableWebDriver): void {
    for (const reporter of this.reporters) {
      try {
        reporter.setDriver?.(driver);
      } catch (err) {
        logger.warn(`Reporter setDriver failed: ${err}`);
      }
    }
  }
}

/**
 * Factory function to create active reporters
 * Supports: AllureReporter, MochawesomeReporter
 * Returns single reporter, composite, or undefined
 */
export function createReporter(): BaseReporter | undefined {
  const reporters: BaseReporter[] = [];

  // AllureReporter - if allure-mocha is available
  if (shouldUseAllureReporter()) {
    reporters.push(createAllureReporter());
  }

  // MochawesomeReporter - if mochawesome is available
  if (shouldUseMochawesomeReporter()) {
    reporters.push(createMochawesomeReporter());
  }

  if (reporters.length === 0) {
    return undefined;
  }

  if (reporters.length === 1) {
    return reporters[0];
  }

  // Multiple reporters - use CompositeReporter for coordination
  return new CompositeReporter(reporters);
}

