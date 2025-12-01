import { WebElement } from 'selenium-webdriver';
import { configLoader } from '@config/ConfigLoader';
import { defaultDriverManager } from '@driver/DriverManager';
import { actionabilityChecker } from '@core/elements/ActionabilityChecker';
import { elementFinder } from '@core/elements/ElementFinder';
import { ActionType } from '@enums';
import { TimeUtils } from '@utils/TimeUtils';
import { logger } from '@utils/Logger';
import { TIMING } from '@config/Constants';

export { ActionType } from '@enums';
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
   * Find element and ensure it's visible
   */
  private async findVisibleElement(options?: ActionOptions): Promise<WebElement> {
    return this.findElement(ActionType.READ, options);
  }

  // Public API methods - Core interactions

  /**
   * Execute action with automatic stale element recovery and multiple retries
   * Flow: Find element → Try action → Catch stale → Re-find and retry (up to MAX_STALE_RETRIES times)
   */
  private async executeWithRecovery<T>(
    actionType: ActionType,
    action: (element: WebElement) => Promise<T>,
    options?: ActionOptions
  ): Promise<T> {
    const { MAX_STALE_RETRIES, STALE_RETRY_DELAY } = TIMING;

    for (let retryCount = 0; retryCount <= MAX_STALE_RETRIES; retryCount++) {
      try {
        // Step 1: Find element with actionability checks
        const element = await this.findElement(actionType, options);

        // Step 2: Execute the action
        return await action(element);

      } catch (error: any) {
        // Step 3: If stale and haven't exceeded retries, retry
        if (error.name === 'StaleElementReferenceError' && retryCount < MAX_STALE_RETRIES) {
          // Wait before retry to let DOM settle
          await TimeUtils.sleep(STALE_RETRY_DELAY);
          continue; // Go to next loop iteration
        }

        // Step 4: Re-throw if not stale or retries exhausted
        throw error;
      }
    }

    // This should never be reached, but TypeScript requires it
    throw new Error('executeWithRecovery: Unexpected end of retry loop');
  }

  /**
   * Click the element with auto-wait and stale element recovery
   * Requirements: STABLE, ENABLED
   */
  async click(options?: ActionOptions): Promise<void> {
    logger.debug(`Clicking element with locator: ${this.locator.using}="${this.locator.value}"`);
    await this.executeWithRecovery(
      ActionType.CLICK,
      (element: WebElement) => element.click(),
      options
    );
    logger.debug(`Element clicked successfully: ${this.locator.using}="${this.locator.value}"`);
  }

  /**
   * Type text into the element with auto-wait and stale element recovery
   * Requirements: EDITABLE
   */
  async type(text: string, options?: ActionOptions): Promise<void> {
    await this.executeWithRecovery(
      ActionType.TYPE,
      (element: WebElement) => element.sendKeys(text),
      options
    );
  }

  /**
   * Get text content with auto-wait
   */
  async getText(options?: ReadOptions): Promise<string> {
    const element = await this.findVisibleElement({ timeout: options?.timeout });
    return element.getText();
  }

  /**
   * Check if element is displayed/visible
   */
  async isDisplayed(options?: ReadOptions): Promise<boolean> {
    const element = await this.findVisibleElement({ timeout: options?.timeout });
    return await element.isDisplayed();
  }

  /**
   * Check if element is currently displayed without waiting for visibility
   * This is useful for assertions that need to verify the current state
   * without auto-retrying for the element to become visible.
   * 
   * @returns true if element is displayed, false if hidden or not found
   */
  async isDisplayedNow(): Promise<boolean> {
    try {
      const element = await this.findElement(ActionType.READ);
      return await element.isDisplayed();
    } catch {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(options?: ReadOptions): Promise<boolean> {
    const element = await this.findVisibleElement({ timeout: options?.timeout });
    return await element.isEnabled();
  }

  /**
   * Find child element within this element
   * Creates a new SanElement with this element as parent for scoped searching
   */
  findChild(locator: Locator): SanElement {
    return new SanElement(locator, this);
  }

  // Additional methods for future enhancement:
  // - sendKeys(keys): Send special keys
  // - getAttribute(name): Get attribute value
  // - clear(): Clear input field
  // - check()/uncheck(): Toggle checkbox/radio
  // - isChecked(): Check if checkbox/radio is selected
  // - hover(): Hover over element
  // - scrollIntoView(): Manually scroll element into view
}

export default SanElement;