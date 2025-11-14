import { By, WebElement } from 'selenium-webdriver';
import { configLoader } from '../../config/ConfigLoader';
import { driverManager } from '../../driver/DriverManager';
import { waitForActionability } from './ActionabilityChecker';
import { getActionRequirements } from './ActionConfig';
import { ActionType, LocatorType } from '../../types/Enums';
import { delay, getRemainingTimeout, DEFAULT_RETRY_INTERVAL } from '../../utils/SeleniumUtils';
import { retryUntilTimeout } from '../../utils/RetryUtils';

export { ActionType, LocatorType } from '../../types/Enums';
export type Locator = { using: 'css' | 'xpath' | 'id' | 'name' | 'class'; value: string };

export interface ActionOptions {
  timeout?: number;
  force?: boolean;
}

function toBy(locator: Locator) {
  switch (locator.using) {
    case 'css': return By.css(locator.value);
    case 'xpath': return By.xpath(locator.value);
    case 'id': return By.id(locator.value);
    case 'name': return By.name(locator.value);
    case 'class': return By.className(locator.value);
    default: throw new Error('Unsupported locator');
  }
}

export class SanElement {
  private readonly locator: Locator;
  private readonly defaultTimeout: number;
  private readonly parentElement?: SanElement;
  
  private static readonly SCROLL_SETTLE_TIME = 50;
  private static readonly BASIC_WAIT_TIME = 1000;

  constructor(locator: Locator, defaultTimeout?: number, parentElement?: SanElement) {
    this.locator = locator;
    this.defaultTimeout = defaultTimeout ?? configLoader.getTimeoutConfig().element;
    this.parentElement = parentElement;
  }

  private get driver() {
    return driverManager.getDriver();
  }

  private getActions() {
    return this.driver.actions({ bridge: true });
  }

  /**
   * Find and prepare element for interaction or reading
   */
  private async findElement(
    actionType: ActionType | null,
    options?: ActionOptions
  ): Promise<WebElement> {
    const timeout = options?.timeout ?? this.defaultTimeout;
    const startTime = Date.now();

    // Step 1: Locate element
    const element = await this.locateElement(toBy(this.locator), startTime, timeout);

    // Step 2: Wait for visibility
    await this.waitForVisibility(element, startTime, timeout);

    // Step 3: Scroll into view
    await this.scrollIntoView(element);

    // Step 4: Wait for actionability if action type specified
    if (actionType && !options?.force) {
      const actionRequirements = getActionRequirements(actionType);
      const remainingTimeout = getRemainingTimeout(startTime, timeout);
      
      await waitForActionability(element, {
        ...actionRequirements,
        timeout: remainingTimeout
      });
    }

    return element;
  }

  /**
   * Locate element with retry logic
   */
  private async locateElement(by: By, startTime: number, timeout: number): Promise<WebElement> {
    return retryUntilTimeout(
      async () => {
        if (this.parentElement) {
          const parentWebElement = await this.parentElement.raw();
          const elements = await parentWebElement.findElements(by);
          return elements.length > 0 ? elements[0] : null;
        } else {
          return this.driver.findElement(by);
        }
      },
      startTime,
      timeout,
      `Locate element ${JSON.stringify(this.locator)}`,
      DEFAULT_RETRY_INTERVAL
    );
  }

  /**
   * Wait for element to be visible
   */
  private async waitForVisibility(element: WebElement, startTime: number, timeout: number): Promise<WebElement> {
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
  private async scrollIntoView(element: WebElement): Promise<void> {
    try {
      await this.driver.executeScript(
        'arguments[0].scrollIntoView({ behavior: "instant", block: "center", inline: "center" });',
        element
      );
      await delay(SanElement.SCROLL_SETTLE_TIME);
    } catch (error: any) {
      if (error.name !== 'InvalidElementStateError' && 
          error.name !== 'ElementNotInteractableError') {
        console.warn(`Scroll failed: ${error.message}`);
      }
    }
  }

  // Public API methods

  /**
   * Click the element with auto-wait
   */
  async click(options?: ActionOptions): Promise<void> {
    const element = await this.findElement(ActionType.CLICK, options);
    await element.click();
  }

  /**
   * Type text into the element with auto-wait
   */
  async type(text?: string, keys?: string, options?: ActionOptions): Promise<void> {
    if (!text && !keys) {
      throw new Error('Either text or keys must be provided');
    }

    const element = await this.findElement(ActionType.TYPE, options);
    
    if (text) {
      await element.sendKeys(text);
    }
    
    if (keys) {
      await this.typeKeys(keys, options);
    }
  }

  /**
   * Get text content with auto-wait
   */
  async getText(timeout?: number): Promise<string> {
    const element = await this.findElement(null, { timeout });
    return element.getText();
  }

  /**
   * Get attribute value with auto-wait
   */
  async getAttribute(name: string, timeout?: number): Promise<string | null> {
    const element = await this.findElement(null, { timeout });
    return element.getAttribute(name);
  }

  /**
   * Check if element is displayed with auto-wait
   */
  async isDisplayed(timeout?: number): Promise<boolean> {
    const element = await this.findElement(null, { timeout });
    return element.isDisplayed();
  }

  /**
   * Get raw WebElement for advanced operations
   */
  async raw(timeout?: number): Promise<WebElement> {
    return this.findElement(null, { timeout });
  }

  /**
   * Clear the element with auto-wait
   */
  async clear(options?: ActionOptions): Promise<void> {
    const element = await this.findElement(ActionType.CLEAR, options);
    await element.clear();
  }

  /**
   * Check/uncheck checkbox or radio button
   */
  async check(options?: ActionOptions): Promise<void> {
    const isChecked = await this.isChecked(options?.timeout);
    if (!isChecked) {
      await this.click(options);
    }
  }

  async uncheck(options?: ActionOptions): Promise<void> {
    const isChecked = await this.isChecked(options?.timeout);
    if (isChecked) {
      await this.click(options);
    }
  }

  /**
   * Check if checkbox/radio is checked
   */
  async isChecked(timeout?: number): Promise<boolean> {
    const element = await this.findElement(null, { timeout });
    return element.isSelected();
  }

  /**
   * Hover over the element with auto-wait
   */
  async hover(options?: ActionOptions): Promise<void> {
    const element = await this.findElement(ActionType.HOVER, options);
    await this.getActions().move({ origin: element }).perform();
  }

  /**
   * Type special keys
   */
  private async typeKeys(keys: string, options?: ActionOptions): Promise<void> {
    const element = await this.findElement(ActionType.TYPE, options);
    await element.sendKeys(keys);
  }

  /**
   * Find multiple elements with basic wait
   */
  private async findElements(timeout?: number): Promise<WebElement[]> {
    const by = toBy(this.locator);
    await delay(timeout || SanElement.BASIC_WAIT_TIME);
    return this.driver.findElements(by);
  }

  /**
   * Get count of matching elements
   */
  async count(timeout?: number): Promise<number> {
    const elements = await this.findElements(timeout);
    return elements.length;
  }

  // Chaining methods - find child elements
  
  /**
   * Find a child element with specified locator type
   * @example parentElement.findChild(LocatorType.CSS, '.child-class')
   * @example parentElement.findChild(LocatorType.XPATH, './/div')
   * @example parentElement.findChild(LocatorType.ID, 'child-id')
   */
  findChild(type: LocatorType, value: string): SanElement {
    return new SanElement({ using: type, value }, this.defaultTimeout, this);
  }

  /**
   * Get the nth element from a list (0-based index)
   * @example todoList.nth(0) // First item
   */
  nth(index: number): SanElement {
    if (this.locator.using !== 'css') {
      throw new Error(`nth() only supports CSS selectors, got: ${this.locator.using}`);
    }
    
    const selector = `${this.locator.value}:nth-of-type(${index + 1})`;
    return new SanElement({ using: this.locator.using, value: selector }, this.defaultTimeout, this.parentElement);
  }
}

export default SanElement;