import { By, ThenableWebDriver, WebElement, until } from 'selenium-webdriver';
import { configLoader } from '../../config/ConfigLoader';
import { Locator } from './SanElement';

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

export class SanElements {
  private readonly driver: ThenableWebDriver;
  private readonly locator: Locator;
  private readonly defaultTimeout: number;

  constructor(driver: ThenableWebDriver, locator: Locator, defaultTimeout?: number) {
    this.driver = driver;
    this.locator = locator;
    this.defaultTimeout = defaultTimeout ?? configLoader.getTimeoutConfig().element;
  }

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

export default SanElements;