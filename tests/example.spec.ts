import DriverManager from '../src/driver/DriverManager';
import { ExamplePage } from '../src/pages/ExamplePage';
import { expectElement } from '../src/assertion/FluentAssertions';
import { configLoader } from '../src/config/ConfigLoader';

import { describe, it, before, after } from 'mocha';

let driver: any;
let page: ExamplePage;

describe('Example site', function() {
  this.timeout(20000);

  before(async () => {
    driver = await DriverManager.getConfiguredDriver();
    page = new ExamplePage(driver);
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('should show example domain title', async () => {
    await page.open();

    // Playwright-style fluent assertions
    await expectElement(page.title).toHaveText('Example Domain');
    await expectElement(page.moreInfo).toBeVisible();
    await expectElement(page.moreInfo).toHaveAttribute('href', 'https://iana.org/domains/example');
  });

  it('should demonstrate various assertion types', async () => {
    await page.open();

    // Text assertions
    await expectElement(page.title).toHaveText('Example Domain');
    await expectElement(page.title).toContainText('Domain');

    // Visibility assertions
    await expectElement(page.title).toBeVisible();
    await expectElement(page.moreInfo).toBeVisible();

    // Attribute assertions
    await expectElement(page.moreInfo).toHaveAttribute('href', 'https://iana.org/domains/example');
    await expectElement(page.moreInfo).toHaveAttributeContaining('href', 'iana.org');
  });
});