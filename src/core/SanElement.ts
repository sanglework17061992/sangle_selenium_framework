import { By, ThenableWebDriver, WebElement, until } from 'selenium-webdriver';
import { configLoader } from '../config/ConfigLoader';

export type Locator = { using: 'css' | 'xpath' | 'id' | 'name' | 'tag' | 'class'; value: string };

function toBy(locator: Locator) {
  switch (locator.using) {
    case 'css': return By.css(locator.value);
    case 'xpath': return By.xpath(locator.value);
    case 'id': return By.id(locator.value);
    case 'name': return By.name(locator.value);
    case 'tag': return By.tagName(locator.value);
    case 'class': return By.className(locator.value);
    default: throw new Error('Unsupported locator');
  }
}

export class SanElement {
  private driver: ThenableWebDriver;
  private locator: Locator;
  private defaultTimeout: number;

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

  async getText(timeout?: number) {
    const el = await this.findElement(timeout);
    return el.getText();
  }

  async getAttribute(name: string, timeout?: number) {
    const el = await this.findElement(timeout);
    return el.getAttribute(name);
  }

  async isDisplayed(timeout?: number) {
    try {
      const el = await this.findElement(timeout);
      return el.isDisplayed();
    } catch (err) {
      return false;
    }
  }

  // expose raw element for advanced operations
  async raw(timeout?: number) {
    return this.findElement(timeout);
  }
}

export default SanElement;