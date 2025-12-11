import { By, WebElement, WebDriver } from 'selenium-webdriver';
import { TIMING } from '@config/Constants';
import { TimeUtils } from '@utils/TimeUtils';
import { Locator } from '@core/elements/SanElement';
import { ConfigurationError, ElementError, TimeoutError } from '@errors';

/**
 * Options for finding elements
 */
export interface FindOptions {
  /** Maximum time to wait for element in milliseconds */
  timeout: number;
  /** Parent element to search within (optional) */
  parentElement?: WebElement;
}

/**
 * ElementFinder - Locates elements with retry logic and stale element recovery
 * Finds elements and waits for visibility with automatic re-finding on stale references
 */
export class ElementFinder {

  /**
   * Find an element by locator with automatic retry and visibility wait
   */
  async find(
    locator: Locator,
    driver: WebDriver,
    options?: FindOptions
  ): Promise<WebElement> {
    if (!options) {
      throw new ConfigurationError('FindOptions must be provided with at least timeout', {
        configKey: 'FindOptions'
      });
    }

    const by = this.toBy(locator);
    const startTime = Date.now();
    const { timeout, parentElement } = options;

    return this.waitUntilVisible(by, driver, startTime, timeout, parentElement);
  }

  /**
   * Convert Locator to Selenium By object
   * @private
   */
  private toBy(locator: Locator): By {
    switch (locator.using) {
      case 'css': return By.css(locator.value);
      case 'xpath': return By.xpath(locator.value);
      case 'id': return By.id(locator.value);
      case 'name': return By.name(locator.value);
      case 'class': return By.className(locator.value);
      default: throw new ConfigurationError(`Unsupported locator type: ${locator.using}`, {
        configKey: `locator.using=${locator.using}`
      });
    }
  }

  /**
   * Wait for element to be visible with stale element recovery
   * @private
   */
  private async waitUntilVisible(
    by: By,
    driver: WebDriver,
    startTime: number,
    timeout: number,
    parentElement?: WebElement
  ): Promise<WebElement> {
    while (TimeUtils.getRemainingTimeout(startTime, timeout) > 0) {
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
          // Non-transient error - wrap in ElementError
          throw new ElementError('Failed to find element', {
            locator: `${by.constructor.name}('${by.value}')`,
            timeout,
            reason: error instanceof Error ? error.message : String(error),
            context: {
              errorName: error.name,
              parentElement: parentElement ? 'present' : 'none'
            },
            lastError: error instanceof Error ? error : undefined
          });
        }
      }
      await TimeUtils.sleep(TIMING.DEFAULT_RETRY_INTERVAL);
    }
    throw new TimeoutError(`Failed to find element within ${timeout}ms`, {
      operation: 'Element visibility check',
      timeout,
      locator: `${by.constructor.name}('${by.value}')`,
      reason: 'Element was not found or did not become visible within the specified timeout'
    });
  }
}

// Create a singleton instance for the framework
export const elementFinder = new ElementFinder();