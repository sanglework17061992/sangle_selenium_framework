import { By, WebElement, WebDriver } from 'selenium-webdriver';

/**
 * Core utility class for finding and preparing elements
 * Extracted from SanElement to separate concerns and improve maintainability
 */
export class ElementFinder {
  private readonly SCROLL_SETTLE_TIME = 50;
  private readonly DEFAULT_RETRY_INTERVAL = 100;

  // Helper functions
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async retryUntilTimeout<T>(
    operation: () => Promise<T | null>,
    startTime: number,
    timeout: number,
    errorMessage: string
  ): Promise<T> {
    while (this.getRemainingTimeout(startTime, timeout) > 0) {
      try {
        const result = await operation();
        if (result !== null) return result;
      } catch (error: any) {
        // Continue retrying for common Selenium errors
        if (error.name !== 'StaleElementReferenceError' && 
            error.name !== 'NoSuchElementError' &&
            !error.message?.includes('no such element')) {
          throw error;
        }
      }
      await this.delay(this.DEFAULT_RETRY_INTERVAL);
    }
    throw new Error(`${errorMessage} - timeout after ${timeout}ms`);
  }

  private getRemainingTimeout(startTime: number, totalTimeout: number): number {
    const elapsed = Date.now() - startTime;
    return Math.max(0, totalTimeout - elapsed);
  }

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
    return this.retryUntilTimeout(
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
      `Locate element`
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
    return this.retryUntilTimeout(
      async () => {
        return (await element.isDisplayed()) ? element : null;
      },
      startTime,
      timeout,
      'Element visibility check'
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
      await this.delay(this.SCROLL_SETTLE_TIME);
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