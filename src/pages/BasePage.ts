import { ThenableWebDriver } from 'selenium-webdriver';
import SanElement, { Locator } from '../core/SanElement';

export abstract class BasePage {
  protected driver: ThenableWebDriver;

  constructor(driver: ThenableWebDriver) {
    this.driver = driver;
  }

  protected $(locator: Locator) {
    return new SanElement(this.driver, locator);
  }

  // User-friendly locator helper methods
  protected byCss(selector: string) {
    return this.$({ using: 'css', value: selector });
  }

  protected byId(id: string) {
    return this.$({ using: 'id', value: id });
  }

  protected byXpath(xpath: string) {
    return this.$({ using: 'xpath', value: xpath });
  }

  protected byName(name: string) {
    return this.$({ using: 'name', value: name });
  }

  protected byTag(tagName: string) {
    return this.$({ using: 'tag', value: tagName });
  }

  protected byClass(className: string) {
    return this.$({ using: 'class', value: className });
  }

  // Shorthand aliases for common selectors
  protected css = this.byCss.bind(this);
  protected id = this.byId.bind(this);
  protected xpath = this.byXpath.bind(this);
  protected name = this.byName.bind(this);
  protected tag = this.byTag.bind(this);
  protected className = this.byClass.bind(this);
}