import { By, ThenableWebDriver, WebElement, until } from 'selenium-webdriver';
import { configLoader } from '../../config/ConfigLoader';
import { DriverContext } from '../../driver/DriverManager';
import { waitForActionability, ActionabilityOptions, delay } from './ActionabilityChecker';
import { getActionRequirements } from './ActionConfig';
import { ActionType } from '../../types/Enums';

export { ActionType } from '../../types/Enums';
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
  
  // Constants for retry logic
  private static readonly SCROLL_SETTLE_TIME = 50; // ms to wait after scroll
  private static readonly RETRY_INTERVAL = 100; // ms between retries

  constructor(locator: Locator, defaultTimeout?: number) {
    this.locator = locator;
    this.defaultTimeout = defaultTimeout ?? configLoader.getTimeoutConfig().element;
  }

  private get driver(): ThenableWebDriver {
    return DriverContext.getDriver();
  }

  private getActions() {
    return this.driver.actions({ bridge: true });
  }
  
  /**
   * Calculate remaining timeout, ensuring it's not negative
   */
  private getRemainingTimeout(startTime: number, totalTimeout: number): number {
    const elapsed = Date.now() - startTime;
    return Math.max(0, totalTimeout - elapsed);
  }

  /**
   * Find and prepare element for interaction or reading
   * 
   * For read operations (actionType = null):
   * - Wait for element located
   * - Wait for element visible
   * 
   * For action operations (actionType provided):
   * - Wait for element located
   * - Scroll into view
   * - Wait for element actionable (unless force = true)
   * 
   * @param actionType Type of action (null for read operations)
   * @param options Timeout and force options
   * @returns WebElement ready for use
   */
  // eslint-disable-next-line sonarjs/no-identical-functions
  private async findElement(
    actionType: ActionType | null = null,
    options?: ActionOptions
  ): Promise<WebElement> {
    const by = toBy(this.locator);
    const timeout = options?.timeout ?? this.defaultTimeout;
    const startTime = Date.now();
    
    while (this.getRemainingTimeout(startTime, timeout) > 0) {
      try {
        // Step 1: Wait for element to be located in DOM
        const remainingTime = this.getRemainingTimeout(startTime, timeout);
        await this.driver.wait(until.elementLocated(by), remainingTime);
        const element = await this.driver.findElement(by);
        
        // For read operations, just wait for visibility and return
        if (actionType === null) {
          const visibilityTimeout = this.getRemainingTimeout(startTime, timeout);
          await this.driver.wait(until.elementIsVisible(element), visibilityTimeout);
          return element;
        }
        
        // For action operations, prepare element for interaction
        const force = options?.force ?? false;
        
        // Step 2: Scroll into view (element is guaranteed to exist now)
        await this.driver.executeScript(
          'arguments[0].scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });',
          element
        );
        await delay(SanElement.SCROLL_SETTLE_TIME);
        
        // Step 3: Wait for element to be actionable (unless forced)
        if (!force) {
          const requirements: ActionabilityOptions = {
            ...getActionRequirements(actionType),
            timeout: this.getRemainingTimeout(startTime, timeout)
          };
          
          await waitForActionability(
            element,
            this.driver,
            requirements
          );
        }
        
        return element;
      } catch (error) {
        // If element becomes stale or any error occurs, retry until timeout
        if (this.getRemainingTimeout(startTime, timeout) <= 0) {
          throw error;
        }
        await delay(SanElement.RETRY_INTERVAL);
      }
    }
    
    // This should rarely be reached due to the while condition, but kept for safety
    throw new Error(`Timeout finding element with locator ${JSON.stringify(this.locator)} after ${timeout}ms`);
  }

  /**
   * Execute an action with standardized error handling
   * @param action The action to execute
   * @param operation Description of the operation for error messages
   * @returns Result of the action
   */
  private async executeAction<T>(
    action: () => Promise<T>,
    operation: string
  ): Promise<T> {
    try {
      return await action();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to ${operation} element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
  }

  /**
   * Execute a read operation that returns a default value on error
   * @param action The action to execute
   * @param defaultValue Value to return if action fails
   * @returns Result of the action or default value
   */
  private async executeSafeRead<T>(
    action: () => Promise<T>,
    defaultValue: T
  ): Promise<T> {
    try {
      return await action();
    } catch {
      return defaultValue;
    }
  }

  // Core interactions
  async click(options?: ActionOptions): Promise<void> {
    return this.executeAction(async () => {
      const element = await this.findElement(ActionType.CLICK, options);
      await element.click();
    }, 'click');
  }

  async type(text?: string, keys?: string, options?: ActionOptions): Promise<void> {
    if (!text && !keys) {
      throw new Error('type() requires either text or keys parameter');
    }

    const operation = this.buildTypeOperation(text, keys);
    
    return this.executeAction(async () => {
      const keysToSend = (text || '') + (keys || '');
      await this.typeKeys(keysToSend, options);
    }, operation);
  }
  
  /**
   * Build operation description for type command
   */
  private buildTypeOperation(text?: string, keys?: string): string {
    if (text && keys) {
      return `type text "${text}" and press ${keys}`;
    }
    if (text) {
      return `type text "${text}"`;
    }
    return `send ${keys}`;
  }

  async getText(timeout?: number): Promise<string> {
    return this.executeAction(async () => {
      const element = await this.findElement(null, { timeout });
      return await element.getText();
    }, 'get text from');
  }

  async getAttribute(name: string, timeout?: number): Promise<string | null> {
    return this.executeAction(async () => {
      const element = await this.findElement(null, { timeout });
      return await element.getAttribute(name);
    }, `get attribute "${name}" from`);
  }

  async isDisplayed(timeout?: number): Promise<boolean> {
    return this.executeSafeRead(async () => {
      const element = await this.findElement(null, { timeout });
      return await element.isDisplayed();
    }, false);
  }

  /**
   * Get raw WebElement for advanced operations (used internally by assertions)
   */
  async raw(timeout?: number): Promise<WebElement> {
    return this.findElement(null, { timeout });
  }

  async clear(options?: ActionOptions): Promise<void> {
    return this.executeAction(async () => {
      const element = await this.findElement(ActionType.CLEAR, options);
      await element.clear();
    }, 'clear');
  }

  // Checkbox actions
  /**
   * Toggle checkbox to desired state (check or uncheck)
   */
  private async toggleCheckbox(
    shouldBeChecked: boolean,
    options?: ActionOptions
  ): Promise<void> {
    const actionType = shouldBeChecked ? ActionType.CHECK : ActionType.UNCHECK;
    const element = await this.findElement(actionType, options);
    
    const isCurrentlyChecked = await element.isSelected();
    if (isCurrentlyChecked !== shouldBeChecked) {
      await element.click();
    }
  }

  /**
   * Check a checkbox element (makes it checked)
   */
  async check(options?: ActionOptions) {
    return this.executeAction(
      async () => this.toggleCheckbox(true, options),
      'check'
    );
  }

  /**
   * Uncheck a checkbox element (makes it unchecked)
   */
  async uncheck(options?: ActionOptions) {
    return this.executeAction(
      async () => this.toggleCheckbox(false, options),
      'uncheck'
    );
  }

  /**
   * Check if a checkbox element is checked
   */
  async isChecked(timeout?: number): Promise<boolean> {
    return this.executeSafeRead(async () => {
      const element = await this.findElement(null, { timeout });
      return await element.isSelected();
    }, false);
  }

  // Mouse actions
  async hover(options?: ActionOptions): Promise<void> {
    return this.executeAction(async () => {
      const element = await this.findElement(ActionType.HOVER, options);
      const actions = this.getActions();
      await actions.move({ origin: element }).perform();
    }, 'hover over');
  }

  private async typeKeys(keys: string, options?: ActionOptions): Promise<void> {
    const element = await this.findElement(ActionType.TYPE, options);
    await element.clear();
    await element.sendKeys(keys);
  }

  // Collection methods
  /**
   * Find multiple elements with basic wait
   */
  private async findElements(timeout?: number): Promise<WebElement[]> {
    const by = toBy(this.locator);
    const effectiveTimeout = timeout ?? this.defaultTimeout;
    await this.driver.wait(until.elementsLocated(by), effectiveTimeout);
    return this.driver.findElements(by);
  }

  /**
   * Count number of elements matching the locator
   */
  async count(timeout?: number): Promise<number> {
    const elements = await this.findElements(timeout);
    return elements.length;
  }
}

export default SanElement;
