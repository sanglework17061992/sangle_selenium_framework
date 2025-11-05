import { By, ThenableWebDriver, until, WebElement } from 'selenium-webdriver';
import { configLoader } from '../config/ConfigLoader';

export class WaitHelper {
  private readonly driver: ThenableWebDriver;
  private readonly defaultTimeout: number;

  constructor(driver: ThenableWebDriver, defaultTimeout?: number) {
    this.driver = driver;
    this.defaultTimeout = defaultTimeout ?? configLoader.getTimeoutConfig().element;
  }

  /**
   * Wait for an element to be invisible/not present
   */
  async waitForElementToDisappear(locator: By, timeout?: number): Promise<void> {
    const t = timeout ?? this.defaultTimeout;
    try {
      await this.driver.wait(
        until.elementIsNotVisible(
          await this.driver.findElement(locator)
        ),
        t
      );
    } catch {
      // Element might not exist at all, which is the desired state for "disappear"
    }
  }

  /**
   * Wait for an element to be visible
   */
  async waitForElementVisible(locator: By, timeout?: number): Promise<WebElement> {
    const t = timeout ?? this.defaultTimeout;
    await this.driver.wait(until.elementLocated(locator), t);
    const element = await this.driver.findElement(locator);
    await this.driver.wait(until.elementIsVisible(element), t);
    return element;
  }

  /**
   * Wait for an element to be clickable (visible and enabled)
   */
  async waitForElementClickable(locator: By, timeout?: number): Promise<WebElement> {
    const t = timeout ?? this.defaultTimeout;
    await this.driver.wait(until.elementLocated(locator), t);
    const element = await this.driver.findElement(locator);
    await this.driver.wait(until.elementIsVisible(element), t);
    await this.driver.wait(until.elementIsEnabled(element), t);
    return element;
  }

  /**
   * Wait for text to be present in element
   */
  async waitForTextInElement(locator: By, text: string, timeout?: number): Promise<WebElement> {
    const t = timeout ?? this.defaultTimeout;
    await this.driver.wait(until.elementLocated(locator), t);
    const element = await this.driver.findElement(locator);
    await this.driver.wait(
      async () => {
        const elementText = await element.getText();
        return elementText.includes(text);
      },
      t
    );
    return element;
  }

  /**
   * Wait for page to be fully loaded
   */
  async waitForPageLoad(timeout?: number): Promise<void> {
    const t = timeout ?? this.defaultTimeout;
    await this.driver.wait(
      async () => {
        const readyState = await this.driver.executeScript('return document.readyState');
        return readyState === 'complete';
      },
      t
    );
  }

  /**
   * Wait for all AJAX requests to complete
   */
  async waitForAjaxComplete(timeout?: number): Promise<void> {
    const t = timeout ?? this.defaultTimeout;
    await this.driver.wait(
      async () => {
        const activeRequests = await this.driver.executeScript(`
          return (window.jQuery && window.jQuery.active) ||
                 (window.angular && window.angular.element(document).injector().get('$http').pendingRequests.length === 0) ||
                 true; // Fallback if no AJAX library detected
        `);
        return activeRequests === 0 || activeRequests === true;
      },
      t
    );
  }

  /**
   * Generic wait for custom condition
   */
  async waitForCondition(condition: () => Promise<boolean>, timeout?: number, message?: string): Promise<void> {
    const t = timeout ?? this.defaultTimeout;
    await this.driver.wait(condition, t, message);
  }

  /**
   * Wait for loading spinner to disappear (common pattern)
   */
  async waitForLoadingSpinner(spinnerSelector: string = '.loading, .spinner, [class*="loading"]', timeout?: number): Promise<void> {
    const t = timeout ?? this.defaultTimeout;
    const spinnerLocator = By.css(spinnerSelector);

    try {
      // First check if spinner exists
      const spinnerExists = await this.driver.findElements(spinnerLocator);
      if (spinnerExists.length > 0) {
        // Wait for it to disappear
        await this.waitForElementToDisappear(spinnerLocator, t);
      }
    } catch {
      // Spinner not found, which is the desired state
    }
  }

  /**
   * Wait for URL to contain specific text
   */
  async waitForUrlToContain(text: string, timeout?: number): Promise<void> {
    const t = timeout ?? this.defaultTimeout;
    await this.driver.wait(
      async () => {
        const currentUrl = await this.driver.getCurrentUrl();
        return currentUrl.includes(text);
      },
      t
    );
  }

  /**
   * Wait for a specific amount of time (use sparingly)
   */
  async waitForTimeout(ms: number): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default WaitHelper;