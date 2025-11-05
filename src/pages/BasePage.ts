import { ThenableWebDriver } from 'selenium-webdriver';
import SanElement, { Locator } from '../core/elements/SanElement';

export abstract class BasePage {
  protected driver: ThenableWebDriver;

  constructor(driver: ThenableWebDriver) {
    this.driver = driver;
  }

  protected $(locator: Locator) {
    return new SanElement(this.driver, locator);
  }

  protected $$(locator: Locator) {
    return new SanElement(this.driver, locator);
  }

  // User-friendly locator helper methods
  protected byCss(selector: string) {
    return this.$({ using: 'css', value: selector });
  }

  protected byId(id: string) {
    return this.$({ using: 'id', value: id });
  }

  protected byXpath(xpath: string, ...params: string[]) {
    const formattedXpath = params.length > 0 ? this.formatXpath(xpath, params) : xpath;
    return this.$({ using: 'xpath', value: formattedXpath });
  }

  private formatXpath(xpath: string, params: string[]): string {
    let result = xpath;
    for (const param of params) {
      // Replace %s placeholders with actual parameters
      result = result.replace('%s', param);
    }
    return result;
  }

  protected byName(name: string) {
    return this.$({ using: 'name', value: name });
  }

  protected byClass(className: string) {
    return this.$({ using: 'class', value: className });
  }

  // Multiple elements helpers
  protected byCssAll(selector: string) {
    return this.$$({ using: 'css', value: selector });
  }

  protected byXpathAll(xpath: string, ...params: string[]) {
    const formattedXpath = params.length > 0 ? this.formatXpath(xpath, params) : xpath;
    return this.$$({ using: 'xpath', value: formattedXpath });
  }

  // Shorthand aliases for common selectors
  protected css = this.byCss.bind(this);
  protected id = this.byId.bind(this);
  protected xpath = this.byXpath.bind(this);
  protected name = this.byName.bind(this);
  protected className = this.byClass.bind(this);
}