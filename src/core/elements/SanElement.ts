import { By, WebElement } from 'selenium-webdriver';
import { configLoader } from '../../config/ConfigLoader';
import { defaultDriverManager } from '../../driver/DriverManager';
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

export interface ReadOptions {
  timeout?: number;
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
    return defaultDriverManager.getDriver();
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
    actionType: ActionType,
    options?: ActionOptions
  ): Promise<WebElement> {
    const timeout = options?.timeout ?? this.defaultTimeout;
    const shouldScroll = options?.scroll ?? false;

    // Use ElementFinder for the core finding logic
    const parentWebElement = this.parentElement ? await this.parentElement.findElement(ActionType.READ) : undefined;
    const element = await elementFinder.findAndPrepareElement(
      toBy(this.locator),
      this.driver,
      timeout,
      shouldScroll,
      parentWebElement
    );

    // Wait for actionability if not force mode
    if (!options?.force) {
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
  async type(text: string, options?: ActionOptions): Promise<void> {
    if (!text) {
      throw new Error(`Cannot type empty text into element with locator: ${JSON.stringify(this.locator)}`);
    }

    const element = await this.findElement(ActionType.TYPE, options);
    await element.sendKeys(text);
  }

  /**
   * Send special keys to the element with auto-wait
   */
  async sendKeys(keys: string, options?: ActionOptions): Promise<void> {
    if (!keys) {
      throw new Error(`Cannot send empty keys to element with locator: ${JSON.stringify(this.locator)}`);
    }

    const element = await this.findElement(ActionType.TYPE, options);
    await element.sendKeys(keys);
  }

  /**
   * Get text content with auto-wait
   */
  async getText(options?: ReadOptions): Promise<string> {
    const element = await this.findElement(ActionType.READ, { timeout: options?.timeout });
    return element.getText();
  }

  /**
   * Get attribute value with auto-wait
   */
  async getAttribute(name: string, options?: ReadOptions): Promise<string | null> {
    const element = await this.findElement(ActionType.READ, { timeout: options?.timeout });
    return element.getAttribute(name);
  }

  /**
   * Check if element is displayed with auto-wait
   */
  async isDisplayed(options?: ReadOptions): Promise<boolean> {
    const element = await this.findElement(ActionType.READ, { timeout: options?.timeout });
    return element.isDisplayed();
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
    const element = await this.findElement(ActionType.CHECK, options);
    const isChecked = await element.isSelected();
    if (!isChecked) {
      await element.click();
    }
  }

  async uncheck(options?: ActionOptions): Promise<void> {
    const element = await this.findElement(ActionType.UNCHECK, options);
    const isChecked = await element.isSelected();
    if (isChecked) {
      await element.click();
    }
  }

  /**
   * Check if checkbox/radio is checked
   */
  async isChecked(options?: ReadOptions): Promise<boolean> {
    const element = await this.findElement(ActionType.READ, { timeout: options?.timeout });
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
    const element = await this.findElement(ActionType.READ);
    await elementFinder.scrollIntoView(element, this.driver);
  }
}

export default SanElement;