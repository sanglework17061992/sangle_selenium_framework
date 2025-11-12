/**
 * SanElementAssertion - Auto-retrying assertions for SanElement
 * 
 * These assertions automatically retry until the condition is met or timeout is reached.
 * This makes tests more reliable by handling dynamic content and timing issues.
 * 
 * Similar to Playwright's expect(locator) API with auto-waiting built-in.
 * 
 * @example
 * // Wait for element to become visible (auto-retry until timeout)
 * await expect(element).toBeVisible();
 * 
 * // Wait for element to have specific text
 * await expect(element).toHaveText('Welcome');
 * 
 * // Wait for element to have CSS class
 * await expect(element).toHaveClass('active');
 * 
 * // Custom timeout
 * await expect(element, 10000).toBeVisible();
 */

import { SanElement } from '../core/elements/SanElement';
import { safeAssert, waitUntil, DEFAULT_TIMEOUT } from './shared/AssertionUtils';
import * as assert from './shared/AssertionUtils';

export class SanElementAssertion {
  private readonly element: SanElement;
  private readonly timeout: number;

  constructor(element: SanElement, timeout?: number) {
    this.element = element;
    this.timeout = timeout ?? DEFAULT_TIMEOUT;
  }

  /**
   * Assert that the element has the exact text
   * @example await expect(element).toHaveText('Welcome')
   */
  async toHaveText(expectedText: string): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const actualText = await this.element.getText();
        assert.equal(actualText.trim(), expectedText);
      }),
      `element to have text "${expectedText}"`,
      this.timeout
    );
  }

  /**
   * Assert that the element contains the specified text
   * @example await expect(element).toContainText('Welcome')
   */
  async toContainText(expectedSubstring: string): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const actualText = await this.element.getText();
        assert.include(actualText.trim(), expectedSubstring);
      }),
      `element to contain text "${expectedSubstring}"`,
      this.timeout
    );
  }

  /**
   * Assert that the element has the specified attribute with the expected value
   * @example await expect(element).toHaveAttribute('href', '/home')
   */
  async toHaveAttribute(attributeName: string, expectedValue: string): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const actualValue = await this.element.getAttribute(attributeName);
        assert.equal(actualValue, expectedValue);
      }),
      `element to have attribute "${attributeName}" with value "${expectedValue}"`,
      this.timeout
    );
  }

  /**
   * Assert that the element is visible
   * @example await expect(element).toBeVisible()
   */
  async toBeVisible(): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const isVisible = await this.element.isDisplayed();
        if (!isVisible) throw new Error('Element is not visible');
      }),
      'element to be visible',
      this.timeout
    );
  }

  /**
   * Assert that the element is hidden (not visible)
   * @example await expect(element).toBeHidden()
   */
  async toBeHidden(): Promise<void> {
    await waitUntil(
      async () => {
        try {
          const isVisible = await this.element.isDisplayed();
          return !isVisible;
        } catch {
          // Element not found = hidden
          return true;
        }
      },
      'element to be hidden',
      this.timeout
    );
  }

  /**
   * Assert that the element is enabled
   * @example await expect(button).toBeEnabled()
   */
  async toBeEnabled(): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const element = await this.element.raw();
        const isEnabled = await element.isEnabled();
        if (!isEnabled) throw new Error('Element is not enabled');
      }),
      'element to be enabled',
      this.timeout
    );
  }

  /**
   * Assert that the element is disabled
   * @example await expect(button).toBeDisabled()
   */
  async toBeDisabled(): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const element = await this.element.raw();
        const isEnabled = await element.isEnabled();
        if (isEnabled) throw new Error('Element is not disabled');
      }),
      'element to be disabled',
      this.timeout
    );
  }

  /**
   * Assert that the element is editable (enabled and not readonly)
   * @example await expect(input).toBeEditable()
   */
  async toBeEditable(): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const element = await this.element.raw();
        const isEnabled = await element.isEnabled();
        const readonlyAttr = await element.getAttribute('readonly');
        if (!isEnabled || readonlyAttr) {
          throw new Error('Element is not editable');
        }
      }),
      'element to be editable',
      this.timeout
    );
  }

  /**
   * Assert that the element is checked (for checkboxes/radio buttons)
   * @example await expect(checkbox).toBeChecked()
   */
  async toBeChecked(): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const element = await this.element.raw();
        const isChecked = await element.isSelected();
        if (!isChecked) throw new Error('Element is not checked');
      }),
      'element to be checked',
      this.timeout
    );
  }

  /**
   * Assert that the element is unchecked
   * @example await expect(checkbox).toBeUnchecked()
   */
  async toBeUnchecked(): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const element = await this.element.raw();
        const isChecked = await element.isSelected();
        if (isChecked) throw new Error('Element is checked');
      }),
      'element to be unchecked',
      this.timeout
    );
  }

  /**
   * Assert that the element is attached to the DOM
   * @example await expect(element).toBeAttached()
   */
  async toBeAttached(): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        await this.element.raw();
      }),
      'element to be attached',
      this.timeout
    );
  }

  /**
   * Assert that the element has the specified CSS class
   * @example await expect(element).toHaveClass('active')
   */
  async toHaveClass(className: string): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const classAttribute = await this.element.getAttribute('class');
        const classes = classAttribute ? classAttribute.split(/\s+/) : [];
        assert.include(classes, className);
      }),
      `element to have CSS class "${className}"`,
      this.timeout
    );
  }

  /**
   * Assert that the element's value attribute equals the expected value
   * @example await expect(input).toHaveValue('John')
   */
  async toHaveValue(expectedValue: string): Promise<void> {
    await this.toHaveAttribute('value', expectedValue);
  }

  /**
   * Assert that the element has the specified ID
   * @example await expect(element).toHaveId('username')
   */
  async toHaveId(expectedId: string): Promise<void> {
    await this.toHaveAttribute('id', expectedId);
  }

  /**
   * Assert that the element has the specified CSS property with expected value
   * @example await expect(element).toHaveCSS('color', 'rgb(255, 0, 0)')
   */
  async toHaveCSS(propertyName: string, expectedValue: string): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const element = await this.element.raw();
        const actualValue = await element.getCssValue(propertyName);
        assert.equal(actualValue, expectedValue);
      }),
      `element to have CSS property "${propertyName}" with value "${expectedValue}"`,
      this.timeout
    );
  }

  /**
   * Assert that the element has the specified JavaScript property with expected value
   * @example await expect(input).toHaveJSProperty('value', 'test')
   */
  async toHaveJSProperty(propertyName: string, expectedValue: any): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const element = await this.element.raw();
        const driver = this.element['driver'];
        const actualValue = await driver.executeScript(
          `return arguments[0].${propertyName};`,
          element
        );
        assert.equal(actualValue, expectedValue);
      }),
      `element to have JS property "${propertyName}" with value "${expectedValue}"`,
      this.timeout
    );
  }

  /**
   * Assert that the element is focused
   * @example await expect(input).toBeFocused()
   */
  async toBeFocused(): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const element = await this.element.raw();
        const driver = this.element['driver'];
        const activeElement = await driver.switchTo().activeElement();
        const isSame = await driver.executeScript(
          'return arguments[0] === arguments[1];',
          element,
          activeElement
        );
        if (!isSame) throw new Error('Element is not focused');
      }),
      'element to be focused',
      this.timeout
    );
  }

  /**
   * Assert that the element is empty (no text content)
   * @example await expect(element).toBeEmpty()
   */
  async toBeEmpty(): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const text = await this.element.getText();
        assert.equal(text.trim(), '');
      }),
      'element to be empty',
      this.timeout
    );
  }

  /**
   * Assert that the element is in the viewport
   * @example await expect(element).toBeInViewport()
   */
  async toBeInViewport(): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const element = await this.element.raw();
        const driver = this.element['driver'];
        const isInViewport = await driver.executeScript(`
          const rect = arguments[0].getBoundingClientRect();
          return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
          );
        `, element);
        if (!isInViewport) throw new Error('Element is not in viewport');
      }),
      'element to be in viewport',
      this.timeout
    );
  }

  /**
   * Assert that elements matching the locator have the expected count
   * @example await expect(items).toHaveCount(3)
   */
  async toHaveCount(expectedCount: number): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const count = await this.element.count();
        assert.equal(count, expectedCount);
      }),
      `elements to have count ${expectedCount}`,
      this.timeout
    );
  }

  /**
   * Assert that select element has the specified values selected (for multi-select)
   * @example await expect(select).toHaveValues(['option1', 'option2'])
   */
  async toHaveValues(expectedValues: string[]): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const element = await this.element.raw();
        const driver = this.element['driver'];
        const actualValues = await driver.executeScript(`
          const select = arguments[0];
          const selectedOptions = Array.from(select.selectedOptions);
          return selectedOptions.map(opt => opt.value);
        `, element);
        assert.hasMembers(actualValues as string[], expectedValues);
      }),
      `element to have values ${JSON.stringify(expectedValues)}`,
      this.timeout
    );
  }
}
