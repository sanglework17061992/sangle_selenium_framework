import DriverManager from '../src/driver/DriverManager';
import { ExamplePage } from '../src/pages/ExamplePage';
import { expectElement } from '../src/assertion/FluentAssertions';
import { AllureReporter } from '../src/reporting';

import { describe, it, before, after } from 'mocha';

// Check if we're using Allure reporter
const isAllureReporter = process.argv.includes('--reporter') && 
                        process.argv.includes('allure-mocha');

let driver: any;
let page: ExamplePage;

describe('Example site - Allure Report Demo', function() {
  this.timeout(30000);

  before(async () => {
    if (isAllureReporter) {
      AllureReporter.setupEnvironment();
    }
    driver = await DriverManager.getConfiguredDriver();
    page = new ExamplePage(driver);
  });

  after(async () => {
    if (driver) await driver.quit();
  });

  it('should show example domain title with Allure reporting', async () => {
    if (isAllureReporter) {
      AllureReporter.description('Test that verifies the Example Domain page loads correctly with proper title and links');
      AllureReporter.severity('normal');
      AllureReporter.tag('smoke');
      AllureReporter.tag('ui');
      AllureReporter.owner('QA Team');
    }

    if (isAllureReporter) {
      await AllureReporter.step('Navigate to Example Domain page', async () => {
        await page.open();
      });
    } else {
      await page.open();
    }

    if (isAllureReporter) {
      await AllureReporter.step('Verify page title', async () => {
        await expectElement(page.title).toHaveText('Example Domain');
      });
    } else {
      await expectElement(page.title).toHaveText('Example Domain');
    }

    if (isAllureReporter) {
      await AllureReporter.step('Verify more information link is visible', async () => {
        await expectElement(page.moreInfo).toBeVisible();
      });
    } else {
      await expectElement(page.moreInfo).toBeVisible();
    }

    if (isAllureReporter) {
      await AllureReporter.step('Verify more information link has correct href', async () => {
        await expectElement(page.moreInfo).toHaveAttribute('href', 'https://iana.org/domains/example');
      });
    } else {
      await expectElement(page.moreInfo).toHaveAttribute('href', 'https://iana.org/domains/example');
    }

    // Attach a screenshot of the final state (only for Allure reporter)
    if (isAllureReporter) {
      await AllureReporter.attachScreenshot(driver, 'Example page final state');
    }

    // Attach some test data (only for Allure reporter)
    if (isAllureReporter) {
      AllureReporter.attachJSON('Test Data', {
        expectedTitle: 'Example Domain',
        expectedHref: 'https://iana.org/domains/example',
        timestamp: new Date().toISOString()
      });
    }
  });
});