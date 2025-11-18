import { WebElement } from 'selenium-webdriver';
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

export class SanElement {
  private readonly locator: Locator;
  private readonly parentElement?: SanElement;

  constructor(locator: Locator, parentElement?: SanElement) {
    this.locator = locator;
    this.parentElement = parentElement;
  }

  // Factory methods for clean API
  static css(selector: string): SanElement {
    return new SanElement({ using: 'css', value: selector });
  }

  static xpath(xpathExpression: string): SanElement {
    return new SanElement({ using: 'xpath', value: xpathExpression });
  }

  static id(elementId: string): SanElement {
    return new SanElement({ using: 'id', value: elementId });
  }

  static className(className: string): SanElement {
    return new SanElement({ using: 'class', value: className });
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
    const timeout = options?.timeout ?? configLoader.getTimeoutConfig().element;

    // Use ElementFinder for the core finding logic
    const parentWebElement = this.parentElement ? await this.parentElement.findElement(ActionType.READ) : undefined;
    const element = await elementFinder.locateAndPrepareElement(
      elementFinder.toBy(this.locator),
      this.driver,
      timeout,
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

  // Public API methods - Core interactions

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
   * Get text content with auto-wait
   */
  async getText(options?: ReadOptions): Promise<string> {
    const element = await this.findElement(ActionType.READ, { timeout: options?.timeout });
    return element.getText();
  }

  // TODO: Additional methods for future enhancement
  // - sendKeys(keys): Send special keys
  // - getAttribute(name): Get attribute value
  // - isDisplayed(): Check if element is visible
  // - clear(): Clear input field
  // - check()/uncheck(): Toggle checkbox/radio
  // - isChecked(): Check if checkbox/radio is selected
  // - hover(): Hover over element
  // - scrollIntoView(): Manually scroll element into view
}

export default SanElement;