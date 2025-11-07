import { By, ThenableWebDriver, WebElement, until } from 'selenium-webdriver';
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

  // Core interactions: click, type, getText, isDisplayed, getAttribute
  async click(options?: ActionOptions) {
    try {
      const el = await this.findElementWithActionability(ActionType.CLICK, options);
      await el.click();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to click element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
  }

  async type(text?: string, keys?: string, options?: ActionOptions) {
    try {
      const keysToSend = (text || '') + (keys || '');
      if (keysToSend) {
        await this.typeKeys(keysToSend, options);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      let operation: string;
      if (text && keys) {
        operation = `type text "${text}" and press keys "${keys}"`;
      } else if (text) {
        operation = `type text "${text}"`;
      } else {
        operation = `send keys "${keys}"`;
      }
      throw new Error(`Failed to ${operation} into element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
  }

  async getText(timeout?: number) {
    try {
      const el = await this.findElementForRead(timeout);
      return await el.getText();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get text from element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
  }

  async getAttribute(name: string, timeout?: number) {
    try {
      const el = await this.findElementForRead(timeout);
      return await el.getAttribute(name);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get attribute "${name}" from element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
  }

  async isEnabled(timeout?: number): Promise<boolean> {
    try {
      const el = await this.findElementForRead(timeout);
      return await el.isEnabled();
    } catch {
      return false;
    }
  }

  async isDisplayed(timeout?: number): Promise<boolean> {
    try {
      const el = await this.findElementForRead(timeout);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  // expose raw element for advanced operations
  async raw(timeout?: number) {
    return this.findElementForRead(timeout);
  }

  async clear(options?: ActionOptions) {
    try {
      const el = await this.findElementWithActionability(ActionType.CLEAR, options);
      await el.clear();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to clear element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
  }

  async submit(timeout?: number) {
    try {
      const el = await this.findElementForRead(timeout);
      await el.submit();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to submit element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
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
    try {
      const el = await this.findElementForRead(timeout);
      return await el.isSelected();
    } catch {
      return false;
    }
  }

  // Mouse actions
  async doubleClick(options?: ActionOptions) {
    try {
      const el = await this.findElementWithActionability(ActionType.DOUBLE_CLICK, options);
      const actions = this.getActions();
      await actions.doubleClick(el).perform();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to double-click element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
  }

  async rightClick(options?: ActionOptions) {
    try {
      const el = await this.findElementWithActionability(ActionType.RIGHT_CLICK, options);
      const actions = this.getActions();
      await actions.contextClick(el).perform();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to right-click element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
  }

  async hover(options?: ActionOptions) {
    try {
      const el = await this.findElementWithActionability(ActionType.HOVER, options);
      const actions = this.getActions();
      await actions.move({ origin: el }).perform();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to hover over element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
  }

  async dragAndDrop(target: SanElement, options?: ActionOptions) {
    try {
      const sourceEl = await this.findElementWithActionability(ActionType.DRAG, options);
      const targetEl = await target.findElementForRead(options?.timeout);
      const actions = this.getActions();
      await actions.dragAndDrop(sourceEl, targetEl).perform();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to drag and drop element with locator ${JSON.stringify(this.locator)} to target ${JSON.stringify(target.locator)}: ${errorMessage}`);
    }
  }

  // Select dropdown methods
  async selectByValue(value: string, options?: ActionOptions) {
    const el = await this.findElementWithActionability(ActionType.SELECT, options);
    const select = require('selenium-webdriver').Select;
    const selectElement = new select(el);
    await selectElement.selectByValue(value);
  }

  async selectByText(text: string, options?: ActionOptions) {
    const el = await this.findElementWithActionability(ActionType.SELECT, options);
    const select = require('selenium-webdriver').Select;
    const selectElement = new select(el);
    await selectElement.selectByVisibleText(text);
  }

  async selectByIndex(index: number, options?: ActionOptions) {
    const el = await this.findElementWithActionability(ActionType.SELECT, options);
    const select = require('selenium-webdriver').Select;
    const selectElement = new select(el);
    await selectElement.selectByIndex(index);
  }

  async getSelectedValue(timeout?: number): Promise<string | null> {
    const el = await this.findElementForRead(timeout);
    const select = require('selenium-webdriver').Select;
    const selectElement = new select(el);
    const selectedOption = await selectElement.getFirstSelectedOption();
    return await selectedOption.getAttribute('value');
  }

  async getSelectedText(timeout?: number): Promise<string> {
    const el = await this.findElementForRead(timeout);
    const select = require('selenium-webdriver').Select;
    const selectElement = new select(el);
    const selectedOption = await selectElement.getFirstSelectedOption();
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
