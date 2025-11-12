/**
 * SanElementAssertion - Auto-retrying assertions for SanElement
 * 
 * These assertions automatically retry until the condition is met or timeout is reached.
 * This makes tests more reliable by handling dynamic content and timing issues.
 * 
 * Similar to Playwright's expect(locator) API with auto-waiting built-in.
 * 
 * @example
 * // Wait for element to have specific text
 * await expect(element).toHaveText('Welcome');
 * 
 * // Wait for element to have specific attribute
 * await expect(element).toHaveAttribute('class', 'active');
 * 
 * // Custom timeout
 * await expect(element, 10000).toHaveText('Welcome');
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
        const element = await this.element.raw();
        const actualText = await element.getText();
        assert.equal(actualText.trim(), expectedText);
      }),
      `element to have text "${expectedText}"`,
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
}
