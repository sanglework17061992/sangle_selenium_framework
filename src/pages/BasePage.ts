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
}