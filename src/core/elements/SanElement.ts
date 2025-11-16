import { By, WebElement } from 'selenium-webdriver';
import { configLoader } from '../../config/ConfigLoader';
import { driverManager } from '../../driver/DriverManager';
import { actionabilityChecker } from './ActionabilityChecker';
import { elementFinder } from './ElementFinder';
import { ActionType } from '../../types/Enums';

export { ActionType } from '../../types/Enums';
export type Locator = { using: 'css' | 'xpath' | 'id' | 'name' | 'class'; value: string };

export interface ActionOptions {
  timeout?: number;
  force?: boolean;
  scroll?: boolean;
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

  private getRemainingTimeout(startTime: number, totalTimeout: number): number {
    const elapsed = Date.now() - startTime;
    return Math.max(0, totalTimeout - elapsed);
  }

  /**
   * Find and prepare element for interaction or reading
   */
  private async findElement(
    actionType: ActionType | null,
    options?: ActionOptions
  ): Promise<WebElement> {
    const timeout = options?.timeout ?? this.defaultTimeout;
    const shouldScroll = options?.scroll ?? false;

    // Use ElementFinder for the core finding logic
    const parentWebElement = this.parentElement ? await this.parentElement.raw() : undefined;
    const element = await elementFinder.findAndPrepareElement(
      toBy(this.locator),
      this.driver,
      timeout,
      shouldScroll,
      parentWebElement
    );

    // Wait for actionability if action type specified
    if (actionType && !options?.force) {
      const startTime = Date.now();
      const remainingTimeout = this.getRemainingTimeout(startTime, timeout);
      await actionabilityChecker.waitUntilReady(actionType, element, remainingTimeout);
    }

    return element;
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
      await element.sendKeys(keys);
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
   * Explicitly scroll element into view
   * Use this when you need manual control over scrolling behavior
   */
  async scrollIntoView(): Promise<void> {
    const element = await this.findElement(null);
    await elementFinder.scrollIntoView(element, this.driver);
  }
}

export default SanElement;