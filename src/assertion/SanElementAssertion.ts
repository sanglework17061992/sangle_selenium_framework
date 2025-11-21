/**
 * SanElementAssertion - Auto-retrying assertions for SanElement
 * 
 * These assertions automatically retry until the condition is met or timeout is reached.
 * This makes tests more reliable by handling dynamic content and timing issues.
 * 
 * @example
 * // Wait for element to have specific text
 * await expect(element).toHaveText('Welcome');
 * 
 * // Wait for element to be visible
 * await expect(element).toBeVisible();
 */

import { SanElement } from '@core/elements/SanElement';
import { retryAssertion, equal } from '@assertion/shared/AssertionUtils';
import { TIMING } from '@config/Constants';

export class SanElementAssertion {
  private readonly element: SanElement;
  private readonly timeout: number;

  constructor(element: SanElement, timeout?: number) {
    this.element = element;
    this.timeout = timeout ?? TIMING.DEFAULT_ASSERTION_TIMEOUT;
  }

  /**
   * Assert that the element has the exact text
   * Trims whitespace (spaces, newlines, indentation) from element text before comparison.
   * This is necessary because HTML formatting often adds whitespace that doesn't affect
   * visual display but would otherwise cause assertions to fail.
   * @example await expect(element).toHaveText('Welcome')
   */
  async toHaveText(expectedText: string): Promise<void> {
    await retryAssertion(
      () => this.element.getText(),
      (actualText: string) => {
        equal(actualText.trim(), expectedText);
      },
      `element text "${expectedText}"`,
      this.timeout
    );
  }

  /**
   * Assert that the element is displayed/visible
   * @example await expect(element).toBeVisible()
   */
  async toBeVisible(): Promise<void> {
    await retryAssertion(
      () => this.element.isDisplayed(),
      (isVisible: boolean) => {
        equal(isVisible, true);
      },
      'element to be visible',
      this.timeout
    );
  }
}
