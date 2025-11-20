export { AllureReporter, createAllureReporter, shouldUseAllureReporter } from './AllureReporter';
export { MochawesomeReporter, createMochawesomeReporter, shouldUseMochawesomeReporter } from './MochawesomeReporter';
export type { TestReporter } from '../base/BaseTest';

import { createAllureReporter, shouldUseAllureReporter } from './AllureReporter';
import { createMochawesomeReporter, shouldUseMochawesomeReporter } from './MochawesomeReporter';
import { TestReporter } from '../base/BaseTest';
import { ThenableWebDriver } from 'selenium-webdriver';

/**
 * CompositeReporter - Coordinates multiple reporters simultaneously
 * Ensures one reporter's failure doesn't affect others
 */
class CompositeReporter implements TestReporter {
  constructor(private readonly reporters: TestReporter[]) {}

  async beforeAll(): Promise<void> {
    for (const reporter of this.reporters) {
      try {
        await reporter.beforeAll?.();
      } catch (error) {
        console.warn(`Reporter beforeAll failed: ${error}`);
      }
    }
  }

  async afterAll(): Promise<void> {
    for (const reporter of this.reporters) {
      try {
        await reporter.afterAll?.();
      } catch (error) {
        console.warn(`Reporter afterAll failed: ${error}`);
      }
    }
  }

  async beforeEach(): Promise<void> {
    for (const reporter of this.reporters) {
      try {
        await reporter.beforeEach?.();
      } catch (error) {
        console.warn(`Reporter beforeEach failed: ${error}`);
      }
    }
  }

  async afterEach(): Promise<void> {
    for (const reporter of this.reporters) {
      try {
        await reporter.afterEach?.();
      } catch (error) {
        console.warn(`Reporter afterEach failed: ${error}`);
      }
    }
  }

  async onTestFailure(testName: string, error: Error): Promise<void> {
    for (const reporter of this.reporters) {
      try {
        await reporter.onTestFailure?.(testName, error);
      } catch (err) {
        console.warn(`Reporter onTestFailure failed: ${err}`);
      }
    }
  }

  setDriver(driver: ThenableWebDriver): void {
    for (const reporter of this.reporters) {
      try {
        reporter.setDriver?.(driver);
      } catch (error) {
        console.warn(`Reporter setDriver failed: ${error}`);
      }
    }
  }
}

export function createReporter(): TestReporter | undefined {
  const allureReporter = shouldUseAllureReporter() ? createAllureReporter() : null;
  const mochawesomeReporter = shouldUseMochawesomeReporter() ? createMochawesomeReporter() : null;

  const activeReporters = [allureReporter, mochawesomeReporter].filter(
    (r): r is TestReporter => r !== null
  );

  if (activeReporters.length === 0) {
    return undefined;
  }

  if (activeReporters.length === 1) {
    return activeReporters[0];
  }

  // Multiple reporters - use CompositeReporter for coordination
  return new CompositeReporter(activeReporters);
}
