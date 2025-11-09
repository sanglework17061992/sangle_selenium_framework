import { By, ThenableWebDriver, WebElement, until } from 'selenium-webdriver';
import { Select } from 'selenium-webdriver/lib/select.js';
import { configLoader } from '../../config/ConfigLoader';
import { DriverContext } from '../../driver/DriverManager';
import { ActionabilityChecker, ActionabilityOptions } from './ActionabilityChecker';
import { getActionRequirements } from './ActionConfig';
import { ActionType } from './ActionType';

export { ActionType } from './ActionType';
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
   * Find element with basic wait (used for read operations that don't need actionability checks)
   * @param timeout Optional timeout
   * @returns WebElement
   */
  private async findElementForRead(timeout?: number): Promise<WebElement> {
    const by = toBy(this.locator);
    const t = timeout ?? this.defaultTimeout;
    // Wait until located and visible
    await this.driver.wait(until.elementLocated(by), t);
    const el = await this.driver.findElement(by);
    await this.driver.wait(until.elementIsVisible(el), t);
    return el;
  }

  /**
   * Find element and wait for actionability checks
   * @param actionType The type of action to perform
   * @param options Options including timeout and force flag
   * @returns WebElement that has passed all actionability checks
   */
  private async findElementWithActionability(
    actionType: ActionType,
    options?: ActionOptions
  ): Promise<WebElement> {
    const by = toBy(this.locator);
    const timeout = options?.timeout ?? this.defaultTimeout;
    const force = options?.force ?? false;
    
    // Step 1: Wait for element to be located
    await this.driver.wait(until.elementLocated(by), timeout);
    const element = await this.driver.findElement(by);
    
    // Step 2: Perform actionability checks (unless forced)
    if (!force) {
      const requirements: ActionabilityOptions = {
        ...getActionRequirements(actionType),
        timeout
      };
      
      await ActionabilityChecker.waitForActionability(
        element,
        this.driver,
        requirements
      );
    }
    
    return element;
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

  /**
   * Get Select wrapper for dropdown element
   * @param element WebElement to wrap
   * @returns Select instance
   */
  private getSelectElement(element: WebElement): Select {
    return new Select(element);
  }

  // Core interactions: click, type, getText, isDisplayed, getAttribute
  async click(options?: ActionOptions) {
    return this.executeAction(async () => {
      const el = await this.findElementWithActionability(ActionType.CLICK, options);
      await el.click();
    }, 'click');
  }

  async type(text?: string, keys?: string, options?: ActionOptions) {
    // Validate: at least one parameter must be provided
    if (!text && !keys) {
      throw new Error('type() requires either text or keys parameter');
    }

    // Build operation description for error messages
    let operation: string;
    if (text && keys) {
      const keyDesc = typeof keys === 'string' ? keys : 'special key';
      operation = `type text "${text}" and press ${keyDesc}`;
    } else if (text) {
      operation = `type text "${text}"`;
    } else {
      const keyDesc = typeof keys === 'string' ? keys : 'special key';
      operation = `send ${keyDesc}`;
    }

    return this.executeAction(async () => {
      const keysToSend = (text || '') + (keys || '');
      await this.typeKeys(keysToSend, options);
    }, operation);
  }

  async getText(timeout?: number) {
    return this.executeAction(async () => {
      const el = await this.findElementForRead(timeout);
      return await el.getText();
    }, 'get text from');
  }

  async getAttribute(name: string, timeout?: number) {
    return this.executeAction(async () => {
      const el = await this.findElementForRead(timeout);
      return await el.getAttribute(name);
    }, `get attribute "${name}" from`);
  }

  async isEnabled(timeout?: number): Promise<boolean> {
    return this.executeSafeRead(async () => {
      const el = await this.findElementForRead(timeout);
      return await el.isEnabled();
    }, false);
  }

  async isDisplayed(timeout?: number): Promise<boolean> {
    return this.executeSafeRead(async () => {
      const el = await this.findElementForRead(timeout);
      return await el.isDisplayed();
    }, false);
  }

  // expose raw element for advanced operations
  async raw(timeout?: number) {
    return this.findElementForRead(timeout);
  }

  async clear(options?: ActionOptions) {
    return this.executeAction(async () => {
      const el = await this.findElementWithActionability(ActionType.CLEAR, options);
      await el.clear();
    }, 'clear');
  }

  async submit(timeout?: number) {
    return this.executeAction(async () => {
      const el = await this.findElementForRead(timeout);
      await el.submit();
    }, 'submit');
  }

  // Checkbox methods
  async check(options?: ActionOptions) {
    const el = await this.findElementWithActionability(ActionType.CHECK, options);
    const isChecked = await el.isSelected();
    if (!isChecked) {
      await el.click();
    }
  }

  async uncheck(options?: ActionOptions) {
    const el = await this.findElementWithActionability(ActionType.UNCHECK, options);
    const isChecked = await el.isSelected();
    if (isChecked) {
      await el.click();
    }
  }

  async isChecked(timeout?: number): Promise<boolean> {
    return this.executeSafeRead(async () => {
      const el = await this.findElementForRead(timeout);
      return await el.isSelected();
    }, false);
  }

  // Mouse actions
  async doubleClick(options?: ActionOptions) {
    return this.executeAction(async () => {
      const el = await this.findElementWithActionability(ActionType.DOUBLE_CLICK, options);
      const actions = this.getActions();
      await actions.doubleClick(el).perform();
    }, 'double-click');
  }

  async rightClick(options?: ActionOptions) {
    return this.executeAction(async () => {
      const el = await this.findElementWithActionability(ActionType.RIGHT_CLICK, options);
      const actions = this.getActions();
      await actions.contextClick(el).perform();
    }, 'right-click');
  }

  async hover(options?: ActionOptions) {
    return this.executeAction(async () => {
      const el = await this.findElementWithActionability(ActionType.HOVER, options);
      const actions = this.getActions();
      await actions.move({ origin: el }).perform();
    }, 'hover over');
  }

  async dragAndDrop(target: SanElement, options?: ActionOptions) {
    return this.executeAction(async () => {
      const sourceEl = await this.findElementWithActionability(ActionType.DRAG, options);
      const targetEl = await target.findElementForRead(options?.timeout);
      const actions = this.getActions();
      await actions.dragAndDrop(sourceEl, targetEl).perform();
    }, `drag and drop to target ${JSON.stringify(target.locator)}`);
  }

  // Select dropdown methods
  async selectByValue(value: string, options?: ActionOptions) {
    const el = await this.findElementWithActionability(ActionType.SELECT, options);
    const selectElement = this.getSelectElement(el);
    await selectElement.selectByValue(value);
  }

  async selectByText(text: string, options?: ActionOptions) {
    const el = await this.findElementWithActionability(ActionType.SELECT, options);
    const selectElement = this.getSelectElement(el);
    await selectElement.selectByVisibleText(text);
  }

  async selectByIndex(index: number, options?: ActionOptions) {
    const el = await this.findElementWithActionability(ActionType.SELECT, options);
    const selectElement = this.getSelectElement(el);
    await selectElement.selectByIndex(index);
  }

  async getSelectedValue(timeout?: number): Promise<string | null> {
    const el = await this.findElementForRead(timeout);
    const selectElement = this.getSelectElement(el);
    const selectedOption = await selectElement.getFirstSelectedOption();
    if (!selectedOption) return null;
    return await selectedOption.getAttribute('value');
  }

  async getSelectedText(timeout?: number): Promise<string> {
    const el = await this.findElementForRead(timeout);
    const selectElement = this.getSelectElement(el);
    const selectedOption = await selectElement.getFirstSelectedOption();
    if (!selectedOption) return '';
    return await selectedOption.getText();
  }

  // Scrolling
  async scrollIntoView(timeout?: number) {
    const el = await this.findElementForRead(timeout);
    await this.driver.executeScript('arguments[0].scrollIntoView(true);', el);
  }

  // Advanced waiting methods
  async waitUntilVisible(timeout?: number) {
    const by = toBy(this.locator);
    const t = timeout ?? this.defaultTimeout;
    await this.driver.wait(until.elementIsVisible(await this.driver.findElement(by)), t);
  }

  async waitUntilClickable(timeout?: number) {
    const by = toBy(this.locator);
    const t = timeout ?? this.defaultTimeout;
    await this.driver.wait(until.elementIsEnabled(await this.driver.findElement(by)), t);
  }

  async waitUntilPresent(timeout?: number) {
    const by = toBy(this.locator);
    const t = timeout ?? this.defaultTimeout;
    await this.driver.wait(until.elementLocated(by), t);
  }
 
  async clickWithForcedVisibility(timeout?: number) {
    const el = await this.findElementForRead(timeout);
    // Use JavaScript to force the element to be visible and clickable
    await this.driver.executeScript(`
      arguments[0].style.display = 'block';
      arguments[0].style.visibility = 'visible';
      arguments[0].style.opacity = '1';
      arguments[0].click();
    `, el);
  }

  async clickWithJavaScript(timeout?: number) {
    const el = await this.findElementForRead(timeout);
    await this.driver.executeScript('arguments[0].click();', el);
  }

  async clickWithCustomJavaScript(javaScriptFn: (element: any) => void, timeout?: number) {
    const el = await this.findElementForRead(timeout);
    await this.driver.executeScript(javaScriptFn, el);
  }

  static async clickWithJavaScriptByCriteria(driver: ThenableWebDriver, findAndClickScript: string, ...args: any[]) {
    await driver.executeScript(findAndClickScript, ...args);
  }

  private async typeKeys(keys: string, options?: ActionOptions): Promise<void> {
    const el = await this.findElementWithActionability(ActionType.TYPE, options);
    await el.clear();
    await el.sendKeys(keys);
  }

  // Collection methods for handling multiple elements
  /**
   * Find multiple elements with basic wait (used for read operations)
   * @param timeout Optional timeout
   * @returns Array of WebElements
   */
  private async findElementsForRead(timeout?: number): Promise<WebElement[]> {
    const by = toBy(this.locator);
    const t = timeout ?? this.defaultTimeout;
    await this.driver.wait(until.elementsLocated(by), t);
    return this.driver.findElements(by);
  }

  async getElements(timeout?: number): Promise<WebElement[]> {
    return this.findElementsForRead(timeout);
  }

  async count(timeout?: number): Promise<number> {
    const elements = await this.findElementsForRead(timeout);
    return elements.length;
  }

  async getTexts(timeout?: number): Promise<string[]> {
    const elements = await this.findElementsForRead(timeout);
    const texts: string[] = [];
    for (const element of elements) {
      try {
        const text = await element.getText();
        texts.push(text);
      } catch {
        // Skip elements that can't get text
        continue;
      }
    }
    return texts;
  }

  async getAttributes(attributeName: string, timeout?: number): Promise<string[]> {
    const elements = await this.findElementsForRead(timeout);
    const attributes: string[] = [];
    for (const element of elements) {
      try {
        const attr = await element.getAttribute(attributeName);
        attributes.push(attr || '');
      } catch {
        attributes.push('');
      }
    }
    return attributes;
  }
}

export default SanElement;
