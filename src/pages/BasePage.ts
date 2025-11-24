import { WebDriver } from 'selenium-webdriver';
import SanElement from '@core/elements/SanElement';
import driverManager from '@driver/DriverManager';

/**
 * BasePage - Base class for all page objects
 * Provides helper methods for creating SanElement locators
 */
export abstract class BasePage {
  protected get driver(): WebDriver {
    return driverManager.getDriver();
  }

  // Locator helper methods - simple wrappers around SanElement
  public css(selector: string): SanElement {
    return SanElement.css(selector);
  }

  public id(elementId: string): SanElement {
    return SanElement.id(elementId);
  }

  public xpath(expression: string): SanElement {
    return SanElement.xpath(expression);
  }

  public className(name: string): SanElement {
    return SanElement.className(name);
  }

  // Page actions
  public async open(url: string): Promise<void> {
    await this.driver.get(url);
  }
}
