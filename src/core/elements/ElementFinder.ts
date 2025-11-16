import { By, WebElement, WebDriver } from 'selenium-webdriver';
import { delay, DEFAULT_RETRY_INTERVAL } from '../../utils/SeleniumUtils';
import { retryUntilTimeout } from '../../utils/RetryUtils';

/**
 * Core utility class for finding and preparing elements
 * Extracted from SanElement to separate concerns and improve maintainability
 */
export class ElementFinder {
  private readonly SCROLL_SETTLE_TIME = 50;

  /**
   * Locate element with retry logic
   */
  async locateElement(
    by: By,
    driver: WebDriver,
    startTime: number,
    timeout: number,
    parentElement?: WebElement
  ): Promise<WebElement> {
    return retryUntilTimeout(
      async () => {
        if (parentElement) {
          const elements = await parentElement.findElements(by);
          return elements.length > 0 ? elements[0] : null;
        } else {
          return driver.findElement(by);
        }
      },
      startTime,
      timeout,
      `Locate element`,
      DEFAULT_RETRY_INTERVAL
    );
  }

  /**
   * Wait for element to be visible
   */
  async waitForVisibility(
    element: WebElement,
    startTime: number,
    timeout: number
  ): Promise<WebElement> {
    return retryUntilTimeout(
      async () => {
        return (await element.isDisplayed()) ? element : null;
      },
      startTime,
      timeout,
      'Element visibility check',
      DEFAULT_RETRY_INTERVAL
    );
  }

  /**
   * Scroll element into view if needed
   */
  async scrollIntoView(element: WebElement, driver: WebDriver): Promise<void> {
    try {
      await driver.executeScript(
        'arguments[0].scrollIntoView({ behavior: "instant", block: "center", inline: "center" });',
        element
      );
      await delay(this.SCROLL_SETTLE_TIME);
    } catch (error: any) {
      if (error.name !== 'InvalidElementStateError' && 
          error.name !== 'ElementNotInteractableError') {
        console.warn(`Scroll failed: ${error.message}`);
      }
    }
  }

  /**
   * Complete element finding pipeline with all necessary steps
   */
  async findAndPrepareElement(
    by: By,
    driver: WebDriver,
    timeout: number,
    shouldScroll: boolean = false,
    parentElement?: WebElement
  ): Promise<WebElement> {
    const startTime = Date.now();

    // Step 1: Locate element
    const element = await this.locateElement(by, driver, startTime, timeout, parentElement);

    // Step 2: Wait for visibility
    await this.waitForVisibility(element, startTime, timeout);

    // Step 3: Scroll into view (only if explicitly requested)
    if (shouldScroll) {
      await this.scrollIntoView(element, driver);
    }

    return element;
  }
}

// Create a singleton instance for the framework
export const elementFinder = new ElementFinder();