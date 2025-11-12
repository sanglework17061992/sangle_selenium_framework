import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import { DelayedElementsPage } from '../../src/pages/test-webapp/DelayedElementsPage';
import { expect } from '../../src/assertion';
import { BaseTest as GenericBaseTest, MultiReporter } from '../../src/base/BaseTest';
import { createAllureReporter, createMochawesomeReporter } from '../../src/reporters';
import { ThenableWebDriver } from 'selenium-webdriver';
import { configLoader } from '../../src/config/ConfigLoader';

/**
 * DelayedElementsPage test class
 */
class DelayedElementsTest extends GenericBaseTest<DelayedElementsPage> {
  protected createPage(driver: ThenableWebDriver): DelayedElementsPage {
    return new DelayedElementsPage(driver);
  }

  async setupTest(): Promise<void> {
    await super.setupTest(configLoader.getBaseUrl() + 'delayed-elements');
  }
}

describe('Test Webapp - Delayed Elements', () => {
  const test = new DelayedElementsTest(
    new MultiReporter([
      createAllureReporter(),
      createMochawesomeReporter()
    ])
  );

  before(async () => {
    await test.setupDriver();
  });

  after(async () => {
    await test.teardownDriver();
  });

  beforeEach(async () => {
    await test.setupTest();
  });

  afterEach(async function() {
    await test.teardownTest(this);
  });

  describe('Delayed Button Appearance', () => {
    it('should wait for delayed button to appear and be clickable', async () => {
      await test.page.setDelay(1000);
      await test.page.triggerDelayedButton();
      
      await test.page.clickDelayedButton();
      
      const status = await test.page.getDelayedButtonStatus();
      expect(status).toInclude('Button clicked successfully!');
    });

    it('should handle multiple delay values', async () => {
      // Test with 2 second delay
      await test.page.setDelay(2000);
      await test.page.triggerDelayedButton();
      await test.page.clickDelayedButton();
      
      let status = await test.page.getDelayedButtonStatus();
      expect(status).toInclude('Button clicked successfully!');
      
      // Reload and test with 500ms delay
      await test.setupTest();
      await test.page.setDelay(500);
      await test.page.triggerDelayedButton();
      await test.page.clickDelayedButton();
      
      status = await test.page.getDelayedButtonStatus();
      expect(status).toInclude('Button clicked successfully!');
    });

    it('should wait for element with custom timeout', async () => {
      await test.page.setDelay(3000);
      await test.page.triggerDelayedButton();
      
      // ActionabilityChecker should wait up to 10 seconds by default
      await test.page.clickDelayedButton();
      
      const status = await test.page.getDelayedButtonStatus();
      expect(status).toInclude('Button clicked successfully!');
    });
  });
});
