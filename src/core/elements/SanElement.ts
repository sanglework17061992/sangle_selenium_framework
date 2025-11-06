import { By, ThenableWebDriver, WebElement, until } from 'selenium-webdriver';
import { configLoader } from '../../config/ConfigLoader';
import { DriverContext } from '../../driver/DriverManager';

export type Locator = { using: 'css' | 'xpath' | 'id' | 'name' | 'class'; value: string };

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

  private async findElement(timeout?: number): Promise<WebElement> {
    const by = toBy(this.locator);
    const t = timeout ?? this.defaultTimeout;
    // Wait until located and visible
    await this.driver.wait(until.elementLocated(by), t);
    const el = await this.driver.findElement(by);
    await this.driver.wait(until.elementIsVisible(el), t);
    return el;
  }

  // Core interactions: click, type, getText, isDisplayed, getAttribute
  async click(timeout?: number) {
    try {
      const el = await this.findElement(timeout);
      await el.click();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to click element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
  }

  async type(text?: string, keys?: string, timeout?: number) {
    try {
      const keysToSend = (text || '') + (keys || '');
      if (keysToSend) {
        await this.typeKeys(keysToSend, timeout);
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
      const el = await this.findElement(timeout);
      return await el.getText();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get text from element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
  }

  async getAttribute(name: string, timeout?: number) {
    try {
      const el = await this.findElement(timeout);
      return await el.getAttribute(name);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to get attribute "${name}" from element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
  }

  async isEnabled(timeout?: number): Promise<boolean> {
    try {
      const el = await this.findElement(timeout);
      return await el.isEnabled();
    } catch {
      return false;
    }
  }

  async isDisplayed(timeout?: number): Promise<boolean> {
    try {
      const el = await this.findElement(timeout);
      return await el.isDisplayed();
    } catch {
      return false;
    }
  }

  // expose raw element for advanced operations
  async raw(timeout?: number) {
    return this.findElement(timeout);
  }

  async clear(timeout?: number) {
    try {
      const el = await this.findElement(timeout);
      await el.clear();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to clear element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
  }

  async submit(timeout?: number) {
    try {
      const el = await this.findElement(timeout);
      await el.submit();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to submit element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
  }

  // Checkbox methods
  async check(timeout?: number) {
    const el = await this.findElement(timeout);
    const isChecked = await el.isSelected();
    if (!isChecked) {
      await el.click();
    }
  }

  async uncheck(timeout?: number) {
    const el = await this.findElement(timeout);
    const isChecked = await el.isSelected();
    if (isChecked) {
      await el.click();
    }
  }

  async isChecked(timeout?: number): Promise<boolean> {
    try {
      const el = await this.findElement(timeout);
      return await el.isSelected();
    } catch {
      return false;
    }
  }

  // Mouse actions
  async doubleClick(timeout?: number) {
    try {
      const el = await this.findElement(timeout);
      const actions = this.getActions();
      await actions.doubleClick(el).perform();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to double-click element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
  }

  async rightClick(timeout?: number) {
    try {
      const el = await this.findElement(timeout);
      const actions = this.getActions();
      await actions.contextClick(el).perform();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to right-click element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
  }

  async hover(timeout?: number) {
    try {
      const el = await this.findElement(timeout);
      const actions = this.getActions();
      await actions.move({ origin: el }).perform();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to hover over element with locator ${JSON.stringify(this.locator)}: ${errorMessage}`);
    }
  }

  async dragAndDrop(target: SanElement, timeout?: number) {
    try {
      const sourceEl = await this.findElement(timeout);
      const targetEl = await target.findElement(timeout);
      const actions = this.getActions();
      await actions.dragAndDrop(sourceEl, targetEl).perform();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to drag and drop element with locator ${JSON.stringify(this.locator)} to target ${JSON.stringify(target.locator)}: ${errorMessage}`);
    }
  }

  // Select dropdown methods
  async selectByValue(value: string, timeout?: number) {
    const el = await this.findElement(timeout);
    const select = require('selenium-webdriver').Select;
    const selectElement = new select(el);
    await selectElement.selectByValue(value);
  }

  async selectByText(text: string, timeout?: number) {
    const el = await this.findElement(timeout);
    const select = require('selenium-webdriver').Select;
    const selectElement = new select(el);
    await selectElement.selectByVisibleText(text);
  }

  async selectByIndex(index: number, timeout?: number) {
    const el = await this.findElement(timeout);
    const select = require('selenium-webdriver').Select;
    const selectElement = new select(el);
    await selectElement.selectByIndex(index);
  }

  async getSelectedValue(timeout?: number): Promise<string | null> {
    const el = await this.findElement(timeout);
    const select = require('selenium-webdriver').Select;
    const selectElement = new select(el);
    const selectedOption = await selectElement.getFirstSelectedOption();
    return await selectedOption.getAttribute('value');
  }

  async getSelectedText(timeout?: number): Promise<string> {
    const el = await this.findElement(timeout);
    const select = require('selenium-webdriver').Select;
    const selectElement = new select(el);
    const selectedOption = await selectElement.getFirstSelectedOption();
    return await selectedOption.getText();
  }

  // Scrolling
  async scrollIntoView(timeout?: number) {
    const el = await this.findElement(timeout);
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
    const el = await this.findElement(timeout);
    // Use JavaScript to force the element to be visible and clickable
    await this.driver.executeScript(`
      arguments[0].style.display = 'block';
      arguments[0].style.visibility = 'visible';
      arguments[0].style.opacity = '1';
      arguments[0].click();
    `, el);
  }

  async clickWithJavaScript(timeout?: number) {
    const el = await this.findElement(timeout);
    await this.driver.executeScript('arguments[0].click();', el);
  }

  async clickWithCustomJavaScript(javaScriptFn: (element: any) => void, timeout?: number) {
    const el = await this.findElement(timeout);
    await this.driver.executeScript(javaScriptFn, el);
  }

  static async clickWithJavaScriptByCriteria(driver: ThenableWebDriver, findAndClickScript: string, ...args: any[]) {
    await driver.executeScript(findAndClickScript, ...args);
  }

  private async typeKeys(keys: string, timeout?: number): Promise<void> {
    const el = await this.findElement(timeout);
    await el.clear();
    await el.sendKeys(keys);
  }

  // Collection methods for handling multiple elements
  private async findElements(timeout?: number): Promise<WebElement[]> {
    const by = toBy(this.locator);
    const t = timeout ?? this.defaultTimeout;
    await this.driver.wait(until.elementsLocated(by), t);
    return this.driver.findElements(by);
  }

  async getElements(timeout?: number): Promise<WebElement[]> {
    return this.findElements(timeout);
  }

  async count(timeout?: number): Promise<number> {
    const elements = await this.findElements(timeout);
    return elements.length;
  }

  async getTexts(timeout?: number): Promise<string[]> {
    const elements = await this.findElements(timeout);
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
    const elements = await this.findElements(timeout);
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
