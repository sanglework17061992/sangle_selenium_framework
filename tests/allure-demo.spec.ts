import DriverManager from '../src/driver/DriverManager';
import { ExamplePage } from '../src/pages/ExamplePage';
import { expectElement } from '../src/assertion/FluentAssertions';
import { configLoader } from '../src/config/ConfigLoader';
import { AllureReporter } from '../src/reporting';

import { describe, it, before, after } from 'mocha';

let driver: any;
let page: ExamplePage;

describe('Example site - Allure Report Demo', function() {
  this.timeout(30000);

  before(async () => {
    AllureReporter.setupEnvironment();
    driver = await DriverManager.getConfiguredDriver();
    page = new ExamplePage(driver);
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('should show example domain title with Allure reporting', async () => {
    AllureReporter.description('Test that verifies the Example Domain page loads correctly with proper title and links');
    AllureReporter.severity('normal');
    AllureReporter.tag('smoke');
    AllureReporter.tag('ui');
    AllureReporter.owner('QA Team');

    await AllureReporter.step('Navigate to Example Domain page', async () => {
      await page.open();
    });

    await AllureReporter.step('Verify page title', async () => {
      await expectElement(page.title).toHaveText('Example Domain');
    });

    await AllureReporter.step('Verify more information link is visible', async () => {
      await expectElement(page.moreInfo).toBeVisible();
    });

    await AllureReporter.step('Verify more information link has correct href', async () => {
      await expectElement(page.moreInfo).toHaveAttribute('href', 'https://iana.org/domains/example');
    });

    // Attach a screenshot of the final state
    await AllureReporter.attachScreenshot(driver, 'Example page final state');

    // Attach some test data
    AllureReporter.attachJSON('Test Data', {
      expectedTitle: 'Example Domain',
      expectedHref: 'https://iana.org/domains/example',
      timestamp: new Date().toISOString()
    });
  });
});