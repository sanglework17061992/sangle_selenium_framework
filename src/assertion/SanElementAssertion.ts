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
   * Assert that the element's value attribute equals the expected value
   * @example await expect(input).toHaveValue('John')
   */
  async toHaveValue(expectedValue: string): Promise<void> {
    await this.toHaveAttribute('value', expectedValue);
  }
}
