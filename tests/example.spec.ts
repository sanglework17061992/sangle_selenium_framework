import { describe, it, before, after } from 'mocha';
import driverManager from '@driver/DriverManager';
import { configLoader } from '@config/ConfigLoader';
import SanElement from '@core/elements/SanElement';
import { expect as sanExpect } from '@assertion/index';

describe('SaniumTS Framework - Foundation', () => {
  before(async () => {
    // Initialize driver
    await driverManager.createDriver();
  });

  after(async () => {
    // Cleanup driver
    await driverManager.quitDriver();
  });

  it('should demonstrate all 3 assertion types: TypeAssertion, SanElementAssertion, and SanPageAssertion', async () => {
    const driver = driverManager.getDriver();
    const baseUrl = configLoader.getBaseUrl();

    await driver.get(baseUrl);

    // TypeAssertion - no auto-retry because it's not a locator/page
    const sum = 2 + 3;
    sanExpect(sum).toBe(5);

    // SanPageAssertion toHaveTitle - auto-retries until the title matches the expected value
    const expectedTitle = 'React • TodoMVC';
    await sanExpect(driver).toHaveTitle(expectedTitle);

    // SanElementAssertion toBeVisible - auto-retries until element is visible
    const heading = SanElement.css('h1');
    await sanExpect(heading).toBeVisible();

    // Note: In future, when BasePage is implemented, page objects can be passed directly:
    // await sanExpect(todoPage).toHaveTitle(expectedTitle);
  });
});
