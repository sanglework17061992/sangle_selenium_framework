export { AllureReporter, createAllureReporter, shouldUseAllureReporter } from './AllureReporter';
export { MochawesomeReporter, createMochawesomeReporter, shouldUseMochawesomeReporter } from './MochawesomeReporter';
export type { TestReporter } from '../base/BaseTest';

import { createAllureReporter, shouldUseAllureReporter } from './AllureReporter';
import { createMochawesomeReporter, shouldUseMochawesomeReporter } from './MochawesomeReporter';
import { ConfigLoader, ReporterType } from '../config/ConfigLoader';
import { TestReporter } from '../base/BaseTest';

export function createReporter(): TestReporter | undefined {
  if (shouldUseAllureReporter()) {
    return createAllureReporter();
  }
  
  if (shouldUseMochawesomeReporter()) {
    return createMochawesomeReporter();
  }
  
  const config = ConfigLoader.getInstance().getConfig();
  const reporterTypes = config.reporting.reporterTypes;
  
  if (reporterTypes.length === 0) {
    return undefined;
  }

  if (reporterTypes.length === 1) {
    return createSingleReporter(reporterTypes[0]);
  }

  return createMultiReporter(reporterTypes);
}

function createSingleReporter(type: ReporterType): TestReporter | undefined {
  switch (type) {
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

function createMultiReporter(types: ReporterType[]): TestReporter {
  const reporters = types
    .map(createSingleReporter)
    .filter((r): r is TestReporter => r !== undefined);

  return new CompositeReporter(reporters);
}

class CompositeReporter implements TestReporter {
  constructor(private readonly reporters: TestReporter[]) {}

  async beforeAll(): Promise<void> {
    await Promise.all(this.reporters.map(async (r) => r.beforeAll?.()));
  }

  async afterAll(): Promise<void> {
    await Promise.all(this.reporters.map(async (r) => r.afterAll?.()));
  }

  async beforeEach(): Promise<void> {
    await Promise.all(this.reporters.map(async (r) => r.beforeEach?.()));
  }

  async afterEach(): Promise<void> {
    await Promise.all(this.reporters.map(async (r) => r.afterEach?.()));
  }

  async onTestFailure(testName: string, error: Error): Promise<void> {
    await Promise.all(this.reporters.map(async (r) => r.onTestFailure?.(testName, error)));
  }

  setDriver(driver: any): void {
    for (const reporter of this.reporters) {
      reporter.setDriver?.(driver);
    }
  }
}

