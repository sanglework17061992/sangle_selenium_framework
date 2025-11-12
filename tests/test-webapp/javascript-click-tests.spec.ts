import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import { JavaScriptClickTestsPage } from '../../src/pages/test-webapp/JavaScriptClickTestsPage';
import { expect } from '../../src/assertion';
import { BaseTest as GenericBaseTest, MultiReporter } from '../../src/base/BaseTest';
import { createAllureReporter, createMochawesomeReporter } from '../../src/reporters';
import { ThenableWebDriver } from 'selenium-webdriver';
import { configLoader } from '../../src/config/ConfigLoader';

/**
 * JavaScriptClickTestsPage test class
 */
class JavaScriptClickTest extends GenericBaseTest<JavaScriptClickTestsPage> {
  protected createPage(driver: ThenableWebDriver): JavaScriptClickTestsPage {
    return new JavaScriptClickTestsPage(driver);
  }

  async setupTest(): Promise<void> {
    await super.setupTest(configLoader.getBaseUrl() + 'javascript-click-tests');
  }
}

describe('Test Webapp - JavaScript Click Tests', () => {
  const test = new JavaScriptClickTest(
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

  describe('Hidden Elements Click Tests', () => {
    it('should click hidden element (display: none) using JavaScript', async () => {
      await test.page.clickHiddenButtonWithJS();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await test.page.getHiddenResult();
      expect(result).toInclude('Hidden button clicked');
    });

    it('should click invisible element (visibility: hidden) using JavaScript', async () => {
      await test.page.clickInvisibleButtonWithJS();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await test.page.getInvisibleResult();
      expect(result).toInclude('Invisible button clicked');
    });

    it('should click zero opacity element (opacity: 0) using JavaScript', async () => {
      await test.page.clickOpacityButtonWithJS();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await test.page.getOpacityResult();
      expect(result).toInclude('Zero opacity button clicked');
    });

    it('should click overlayed element using JavaScript', async () => {
      await test.page.clickOverlayedButtonWithJS();
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await test.page.getOverlayedResult();
      expect(result).toInclude('Overlayed button clicked');
    });
  });

  describe('Event Sequence Tests - Simple Click (fullSequence=false)', () => {
    it('should dispatch only click event when fullSequence=false', async () => {
      await test.page.clickSimpleClickElementWithJS(false);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await test.page.getSimpleClickResult();
      expect(result).toInclude('click');
      // Should NOT contain mousedown or mouseup
      expect(result).toNotInclude('mousedown');
      expect(result).toNotInclude('mouseup');
    });

    it('should work with counter using simple click', async () => {
      await test.page.clickCounterButtonWithJS(false);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let result = await test.page.getCounterResult();
      expect(result).toInclude('Count: 1');
      
      // Click again
      await test.page.clickCounterButtonWithJS(false);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      result = await test.page.getCounterResult();
      expect(result).toInclude('Count: 2');
    });
  });

  describe('Event Sequence Tests - Full Sequence (fullSequence=true)', () => {
    it('should dispatch mousedown, mouseup, and click events when fullSequence=true', async () => {
      await test.page.clickFullSequenceElementWithJS(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await test.page.getFullSequenceResult();
      expect(result).toInclude('mousedown');
      expect(result).toInclude('mouseup');
      expect(result).toInclude('click');
    });

    it('should trigger complex event handler requiring full sequence', async () => {
      await test.page.clickComplexEventElementWithJS(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await test.page.getComplexEventResult();
      expect(result).toInclude('Success');
      expect(result).toInclude('Full sequence detected');
    });

    it('should fail complex event handler when only click is dispatched', async () => {
      await test.page.clickComplexEventElementWithJS(false);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await test.page.getComplexEventResult();
      expect(result).toInclude('Failed');
      expect(result).toInclude('Only click event detected');
    });

    it('should work with counter using full sequence', async () => {
      await test.page.clickCounterButtonWithJS(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      let result = await test.page.getCounterResult();
      expect(result).toInclude('Count: 1');
      
      // Click again with full sequence
      await test.page.clickCounterButtonWithJS(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      result = await test.page.getCounterResult();
      expect(result).toInclude('Count: 2');
    });
  });

  describe('Multiple Clicks Tests', () => {
    it('should handle multiple clicks on hidden element', async () => {
      await test.page.clickHiddenButtonWithJS();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      let result = await test.page.getHiddenResult();
      expect(result).toInclude('Hidden button clicked');
      
      // Click again - result should remain the same (button only updates text once)
      await test.page.clickHiddenButtonWithJS();
      await new Promise(resolve => setTimeout(resolve, 200));
      
      result = await test.page.getHiddenResult();
      expect(result).toInclude('Hidden button clicked');
    });

    it('should increment counter with multiple JavaScript clicks', async () => {
      // Click 5 times
      for (let i = 1; i <= 5; i++) {
        await test.page.clickCounterButtonWithJS();
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const result = await test.page.getCounterResult();
        expect(result).toInclude(`Count: ${i}`);
      }
    });
  });

  describe('Mixed Scenarios', () => {
    it('should click hidden element with full sequence', async () => {
      await test.page.clickHiddenButtonWithJS(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await test.page.getHiddenResult();
      expect(result).toInclude('Hidden button clicked');
    });

    it('should click invisible element with full sequence', async () => {
      await test.page.clickInvisibleButtonWithJS(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await test.page.getInvisibleResult();
      expect(result).toInclude('Invisible button clicked');
    });

    it('should click overlayed element with full sequence', async () => {
      await test.page.clickOverlayedButtonWithJS(true);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const result = await test.page.getOverlayedResult();
      expect(result).toInclude('Overlayed button clicked');
    });
  });
});
