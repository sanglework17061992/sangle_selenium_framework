import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import { ActionabilityTestsPage } from '../../src/pages/test-webapp/ActionabilityTestsPage';
import { expect } from '../../src/assertion/SanAssertion';
import { BaseTest as GenericBaseTest } from '../../src/base';
import { createReporter } from '../../src/reporters';
import { ThenableWebDriver } from 'selenium-webdriver';
import { configLoader } from '../../src/config/ConfigLoader';

/**
 * ActionabilityTestsPage test class
 */
class ActionabilityTestsTest extends GenericBaseTest<ActionabilityTestsPage> {
  protected createPage(driver: ThenableWebDriver): ActionabilityTestsPage {
    return new ActionabilityTestsPage(driver);
  }

  async setupTest(): Promise<void> {
    await super.setupTest(configLoader.getBaseUrl() + 'actionability-tests');
  }
}

describe('Test Webapp - Actionability Tests', () => {
  const test = new ActionabilityTestsTest(createReporter());

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

  describe('Visibility Tests', () => {
    it('should show hidden element and verify it becomes visible', async () => {
      await test.page.showHiddenElement();
      const isVisible = await test.page.isHiddenButtonVisible();
      expect(isVisible).toBe(true);
    });

    it('should make invisible element visible', async () => {
      await test.page.makeInvisibleVisible();
      const isVisible = await test.page.isInvisibleButtonVisible();
      expect(isVisible).toBe(true);
    });

    it('should make opacity button opaque and visible', async () => {
      await test.page.makeOpacityButtonOpaque();
      const isVisible = await test.page.isOpacityButtonVisible();
      expect(isVisible).toBe(true);
    });

    it('should restore zero size button', async () => {
      await test.page.restoreZeroSizeButton();
      const isVisible = await test.page.isZeroSizeButtonVisible();
      expect(isVisible).toBe(true);
    });
  });

  describe('Stability Tests', () => {
    it('should stop movement and click moving button', async () => {
      await test.page.stopMovement();
      await test.page.clickMovingButton();
      // Button clicked successfully without error
    });

    it('should click animate button and verify container text', async () => {
      await test.page.clickAnimateButton();
      // Wait for animation to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      const text = await test.page.getAnimatedContainerText();
      expect(text).toInclude('Stable');
    });
  });

  describe('Enabled Tests', () => {
    it('should enable disabled button', async () => {
      await test.page.enableDisabledButtonElement();
      const isEnabled = await test.page.isDisabledButtonEnabled();
      expect(isEnabled).toBe(true);
    });

    it('should enable disabled input', async () => {
      await test.page.enableDisabledInputElement();
      const isEnabled = await test.page.isDisabledInputEnabled();
      expect(isEnabled).toBe(true);
    });

    it('should toggle button state', async () => {
      const initialState = await test.page.isToggleButtonEnabled();
      await test.page.toggleButtonState();
      const newState = await test.page.isToggleButtonEnabled();
      expect(newState).toBe(!initialState);
    });
  });

  describe('Editable Tests', () => {
    it('should make readonly input editable', async () => {
      await test.page.makeReadonlyInputEditable();
      const isEditable = await test.page.isReadonlyInputEditable();
      expect(isEditable).toBe(true);
    });

    it('should enable textarea', async () => {
      await test.page.enableTextarea();
      const isEnabled = await test.page.isTextareaEnabled();
      expect(isEnabled).toBe(true);
    });

    it('should toggle readonly state', async () => {
      const initialState = await test.page.isToggleReadonlyInputEditable();
      await test.page.toggleReadonlyState();
      const newState = await test.page.isToggleReadonlyInputEditable();
      expect(newState).toBe(!initialState);
    });
  });

  describe('Pointer Events Tests', () => {
    it('should enable pointer events and click button', async () => {
      await test.page.enablePointerEvents();
      await test.page.clickNoPointerButton();
      // Button clicked successfully
    });

    it('should remove overlay and click obscured button', async () => {
      const overlayVisible = await test.page.isObscuringLayerVisible();
      expect(overlayVisible).toBe(true);
      
      await test.page.removeOverlay();
      await test.page.clickObscuredButton();
      // Button clicked successfully
    });
  });
});
