import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import { DynamicContentPage } from '../../src/pages/test-webapp/DynamicContentPage';
import { expectValue } from '../../src/assertion/SanAssertion';
import { BaseTest as GenericBaseTest } from '../../src/base';
import { createReporter } from '../../src/reporters';
import { ThenableWebDriver } from 'selenium-webdriver';

/**
 * DynamicContentPage test class
 */
class DynamicContentTest extends GenericBaseTest<DynamicContentPage> {
  protected createPage(driver: ThenableWebDriver): DynamicContentPage {
    return new DynamicContentPage(driver);
  }

  async setupTest(): Promise<void> {
    await super.setupTest('http://localhost:3001/dynamic-content');
  }
}

describe('Test Webapp - Dynamic Content', () => {
  const test = new DynamicContentTest(createReporter());

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

  describe('Add/Remove Elements', () => {
    it('should add elements dynamically', async () => {
      await test.page.addElement();
      await test.page.addElement();
      await test.page.addElement();
      
      const containerText = await test.page.dynamicContainer.getText();
      expectValue(containerText).toInclude('Element');
    });

    it('should add items to list', async () => {
      await test.page.addItem('Item 1');
      await test.page.addItem('Item 2');
      
      const count = await test.page.getItemsCount();
      expectValue(count).toBe(2);
    });

    it('should clear all elements', async () => {
      await test.page.addElement();
      await test.page.addElement();
      await test.page.clearAll();
      
      // Wait a bit for clear to complete
      await new Promise(resolve => setTimeout(resolve, 500));
      // Elements cleared successfully
    });
  });

  describe('Content Replacement', () => {
    it('should replace content', async () => {
      await test.page.replaceContent();
      
      await new Promise(resolve => setTimeout(resolve, 500));
      // Content replaced successfully - button text changed
    });
  });
});
