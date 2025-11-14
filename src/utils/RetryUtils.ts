import { delay, getRemainingTimeout, handleSeleniumError, DEFAULT_RETRY_INTERVAL } from './SeleniumUtils';

export async function retryUntilTimeout<T>(
  operation: () => Promise<T | null>,
  startTime: number,
  timeout: number,
  errorMessage: string,
  retryInterval: number = DEFAULT_RETRY_INTERVAL
): Promise<T> {
  while (getRemainingTimeout(startTime, timeout) > 0) {
    try {
      const result = await operation();
      if (result !== null) return result;
    } catch (error: any) {
      handleSeleniumError(error, errorMessage);
    }
    await delay(retryInterval);
  }
  throw new Error(`${errorMessage} - timeout after ${timeout}ms`);
}

export async function waitUntilCondition(
  condition: () => Promise<boolean>,
  startTime: number,
  timeout: number,
  errorMessage: string,
  retryInterval: number = DEFAULT_RETRY_INTERVAL
): Promise<void> {
  while (getRemainingTimeout(startTime, timeout) > 0) {
    try {
      if (await condition()) return;
    } catch (error: any) {
      handleSeleniumError(error, errorMessage);
    }
    await delay(retryInterval);
  }
  throw new Error(`${errorMessage} - timeout after ${timeout}ms`);
}