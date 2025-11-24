import { WebDriver } from 'selenium-webdriver';
import SanElement from '@core/elements/SanElement';
import driverManager from '@driver/DriverManager';
import { SanPageAssertion } from '@assertion/SanPageAssertion';

/**
 * BasePage - Base class for all page objects
 * Provides helper methods for creating SanElement locators and page assertions
 */
export abstract class BasePage {
  private pageAssertion: SanPageAssertion | null = null;

  // Accessible for assertion framework (internal use)
  get driver(): WebDriver {
    return driverManager.getDriver();
  }

  private getPageAssertion(): SanPageAssertion {
    this.pageAssertion ??= new SanPageAssertion(this.driver);
    return this.pageAssertion;
  }

  // Locator helper methods - protected for use by page object subclasses
  protected css(selector: string): SanElement {
    return SanElement.css(selector);
  }

  protected id(elementId: string): SanElement {
    return SanElement.id(elementId);
  }

  protected xpath(expression: string): SanElement {
    return SanElement.xpath(expression);
  }

  protected className(name: string): SanElement {
    return SanElement.className(name);
  }

  // Page actions
  public async open(url: string): Promise<void> {
    await this.driver.get(url);
  }

  // Page assertions - delegated to SanPageAssertion for auto-retry logic
  protected async toHaveTitle(expectedTitle: string): Promise<void> {
    await this.getPageAssertion().toHaveTitle(expectedTitle);
  }

  protected async toHaveURL(expectedUrl: string): Promise<void> {
    await this.getPageAssertion().toHaveURL(expectedUrl);
  }
}
