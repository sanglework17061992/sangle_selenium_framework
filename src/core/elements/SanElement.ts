import { By, ThenableWebDriver, WebElement, until } from 'selenium-webdriver';
import { configLoader } from '../../config/ConfigLoader';

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
  private readonly driver: ThenableWebDriver;
  private readonly locator: Locator;
  private readonly defaultTimeout: number;

  constructor(driver: ThenableWebDriver, locator: Locator, defaultTimeout?: number) {
    this.driver = driver;
    this.locator = locator;
    this.defaultTimeout = defaultTimeout ?? configLoader.getTimeoutConfig().element;
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
    const el = await this.findElement(timeout);
    await this.driver.wait(until.elementIsEnabled(el), timeout ?? this.defaultTimeout);
    await el.click();
  }

  async type(text: string, timeout?: number) {
    const el = await this.findElement(timeout);
    await el.clear();
    await el.sendKeys(text);
  }

  async typeAndSendKeys(text: string, keys: string, timeout?: number) {
    const el = await this.findElement(timeout);
    await el.clear();
    await el.sendKeys(text + keys);
  }

  async sendKeys(keys: string, timeout?: number) {
    const el = await this.findElement(timeout);
    await el.sendKeys(keys);
  }

  async getText(timeout?: number) {
    const el = await this.findElement(timeout);
    return el.getText();
  }

  async getAttribute(name: string, timeout?: number) {
    const el = await this.findElement(timeout);
    return el.getAttribute(name);
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
    const el = await this.findElement(timeout);
    await el.clear();
  }

  async submit(timeout?: number) {
    const el = await this.findElement(timeout);
    await el.submit();
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

  async toggle(timeout?: number) {
    const el = await this.findElement(timeout);
    await el.click();
  }

  // Mouse actions
  async doubleClick(timeout?: number) {
    const el = await this.findElement(timeout);
    const actions = this.driver.actions({ bridge: true });
    await actions.doubleClick(el).perform();
  }

  async rightClick(timeout?: number) {
    const el = await this.findElement(timeout);
    const actions = this.driver.actions({ bridge: true });
    await actions.contextClick(el).perform();
  }

  async hover(timeout?: number) {
    const el = await this.findElement(timeout);
    const actions = this.driver.actions({ bridge: true });
    await actions.move({ origin: el }).perform();
  }

  async dragAndDrop(target: SanElement, timeout?: number) {
    const sourceEl = await this.findElement(timeout);
    const targetEl = await target.findElement(timeout);
    const actions = this.driver.actions({ bridge: true });
    await actions.dragAndDrop(sourceEl, targetEl).perform();
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
