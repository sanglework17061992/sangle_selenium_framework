import { WebElement } from 'selenium-webdriver';
import { configLoader } from '../../config/ConfigLoader';
import { defaultDriverManager } from '../../driver/DriverManager';
import { actionabilityChecker } from './ActionabilityChecker';
import { elementFinder } from './ElementFinder';
import { ActionType } from '../../types/Enums';
import { TimeUtils } from '../../utils/TimeUtils';

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

  /**
   * Find and prepare element for interaction or reading
   */
  private async findElement(
    actionType: ActionType,
    options?: ActionOptions
  ): Promise<WebElement> {
    const timeout = options?.timeout ?? configLoader.getTimeoutConfig().element;

    // Use ElementFinder for the core finding logic
    const parentWebElement = this.parentElement ? await this.parentElement.findVisibleElement() : undefined;
    const element = await elementFinder.find(
      this.locator,
      this.driver,
      { timeout, parentElement: parentWebElement }
    );

    // Wait for actionability if not force mode
    if (!options?.force) {
      const startTime = Date.now();
      const remainingTimeout = TimeUtils.getRemainingTimeout(startTime, timeout);
      await actionabilityChecker.waitUntilReady(actionType, element, remainingTimeout);
    }

    return element;
  }

  /**
   * Find element and ensure it's clickable
   */
  private async findClickableElement(options?: ActionOptions): Promise<WebElement> {
    return this.findElement(ActionType.CLICK, options);
  }

  /**
   * Find element and ensure it's editable
   */
  private async findEditableElement(options?: ActionOptions): Promise<WebElement> {
    return this.findElement(ActionType.TYPE, options);
  }

  /**
   * Find element and ensure it's visible
   */
  private async findVisibleElement(options?: ActionOptions): Promise<WebElement> {
    return this.findElement(ActionType.READ, options);
  }

  // Public API methods - Core interactions

  /**
   * Click the element with auto-wait
   */
  async click(options?: ActionOptions): Promise<void> {
    const element = await this.findClickableElement(options);
    await element.click();
  }

  /**
   * Type text into the element with auto-wait
   */
  async type(text: string, options?: ActionOptions): Promise<void> {
    const element = await this.findEditableElement(options);
    await element.sendKeys(text);
  }

  /**
   * Get text content with auto-wait
   */
  async getText(options?: ReadOptions): Promise<string> {
    const element = await this.findVisibleElement({ timeout: options?.timeout });
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
  // - scrollIntoView(): Manually scroll element intoTimeout now only configured per-action via  view
}

export default SanElement;