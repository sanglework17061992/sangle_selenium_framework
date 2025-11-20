export { AllureReporter, createAllureReporter, shouldUseAllureReporter } from './AllureReporter';
export { MochawesomeReporter, createMochawesomeReporter, shouldUseMochawesomeReporter } from './MochawesomeReporter';
export type { TestReporter } from '../base/BaseTest';

import { createAllureReporter, shouldUseAllureReporter } from './AllureReporter';
import { createMochawesomeReporter, shouldUseMochawesomeReporter } from './MochawesomeReporter';
import { TestReporter } from '../base/BaseTest';

export function createReporter(): TestReporter | undefined {
  if (shouldUseAllureReporter()) {
    return createAllureReporter();
  }
  
  if (shouldUseMochawesomeReporter()) {
    return createMochawesomeReporter();
  }

  return undefined;
}
