import { By, WebElement, WebDriver } from 'selenium-webdriver';
import { TIMING } from '../../config/Constants';
import { sleep, getRemainingTimeout } from '../../utils/TimeUtils';

/**
 * ElementFinder - Locates elements with retry logic and stale element recovery
 * Finds elements and waits for visibility with automatic re-finding on stale references
 */
export class ElementFinder {

  /**
   * Wait for element to be visible with stale element recovery
   */
  private async waitUntilVisible(
    by: By,
    driver: WebDriver,
    startTime: number,
    timeout: number,
    parentElement?: WebElement
  ): Promise<WebElement> {
    while (getRemainingTimeout(startTime, timeout) > 0) {
      try {
        // Find or re-find element (handles StaleElementReferenceError by locating fresh)
        const element = parentElement 
          ? await parentElement.findElement(by)
          : await driver.findElement(by);
        
        // Check if visible
        if (await element.isDisplayed()) {
          return element;
        }
      } catch (error: any) {
        // Ignore transient errors and retry
        if (error.name !== 'StaleElementReferenceError' && 
            error.name !== 'NoSuchElementError' &&
            !error.message?.includes('no such element')) {
          throw error;
        }
      }
      await sleep(TIMING.DEFAULT_RETRY_INTERVAL);
    }
    throw new Error(`Element not visible within ${timeout}ms`);
  }

  /**
   * Locate and prepare element for interaction with readiness checks
   */
  async locateAndPrepareElement(
    by: By,
    driver: WebDriver,
    timeout: number,
    parentElement?: WebElement
  ): Promise<WebElement> {
    const startTime = Date.now();

    // Locate element and wait for visibility (with stale element recovery)
    return this.waitUntilVisible(by, driver, startTime, timeout, parentElement);
  }
}

// Create a singleton instance for the framework
export const elementFinder = new ElementFinder();