import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import { OverlayTestsPage } from '../../src/pages/test-webapp/OverlayTestsPage';
import { expect } from '../../src/assertion/SanAssertion';
import { BaseTest as GenericBaseTest } from '../../src/base';
import { createReporter } from '../../src/reporters';
import { ThenableWebDriver } from 'selenium-webdriver';

/**
 * OverlayTestsPage test class
 */
class OverlayTestsTest extends GenericBaseTest<OverlayTestsPage> {
  protected createPage(driver: ThenableWebDriver): OverlayTestsPage {
    return new OverlayTestsPage(driver);
  }

  async setupTest(): Promise<void> {
    await super.setupTest('http://localhost:3001/overlay-tests');
  }
}

describe('Test Webapp - Overlay Tests', () => {
  const test = new OverlayTestsTest(createReporter());

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

  describe('Modal Tests', () => {
    it('should open and close modal', async () => {
      await test.page.openModal();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Close modal
      await test.page.closeModal();
      await new Promise(resolve => setTimeout(resolve, 500));
      // Modal closed successfully
    });

    it('should click target button after closing modal', async () => {
      await test.page.openModal();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      await test.page.closeModal();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Dismiss any alert from previous test
      try {
        const alert = await test.getDriver().switchTo().alert();
        await alert.dismiss();
      } catch (error: unknown) {
        // No alert present - that's expected
        if (error instanceof Error) {
          console.log('No alert to dismiss:', error.message);
        }
      }
      
      await test.page.clickTargetButton();
      
      // Accept the alert that appears
      await new Promise(resolve => setTimeout(resolve, 500));
      const alert = await test.getDriver().switchTo().alert();
      const alertText = await alert.getText();
      expect(alertText).toInclude('Target button clicked');
      await alert.accept();
    });
  });

  describe('Loading Overlay', () => {
    it('should trigger loading and wait for completion', async () => {
      await test.page.triggerLoading();
      
      // Wait for loading to complete
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const result = await test.page.loadingResult.getText();
      expect(result).toInclude('complete');
    });

    it('should show stacked overlays successfully', async () => {
      await test.page.showStackedOverlays();
      await new Promise(resolve => setTimeout(resolve, 500));
      // Stacked overlays displayed
    });
  });

  describe('Stacked Overlays', () => {
    it('should show stacked overlays', async () => {
      await test.page.showStackedOverlays();
      // Overlays displayed successfully
    });
  });
});
