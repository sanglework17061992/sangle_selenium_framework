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
import { waitUntilVisible, waitUntilHidden } from '@assertion/shared/AssertionUtils';
import { TIMING } from '@config/Constants';
import type { ErrorContext } from '@errorTypes';

export class SanElementAssertion {
  private readonly element: SanElement;
  private readonly timeout: number;

  constructor(element: SanElement, timeout?: number) {
    this.element = element;
    this.timeout = timeout ?? TIMING.DEFAULT_ASSERTION_TIMEOUT;
  }

  /**
   * Generic assertion helper that retries until condition is met
   * @private
   */
  private async assertWithRetry(
    operation: string,
    expectedValue: any,
    testFn: (context: ErrorContext) => Promise<boolean>
  ): Promise<void> {
    const context: ErrorContext = {
      operation,
      expected: expectedValue,
      locator: this.element.getLocatorString(),
    };

    await waitUntilVisible(
      () => testFn(context),
      context,
      this.timeout
    );
  }

  /**
   * Generic assertion helper for hidden elements (uses waitUntilHidden instead of waitUntilVisible)
   * @private
   */
  private async assertWithRetryHidden(
    operation: string,
    expectedValue: any,
    testFn: (context: ErrorContext) => Promise<boolean>
  ): Promise<void> {
    const context: ErrorContext = {
      operation,
      expected: expectedValue,
      locator: this.element.getLocatorString(),
    };

    await waitUntilHidden(
      () => testFn(context),
      context,
      this.timeout
    );
  }

  /**
   * Assert that the element has the exact text
   * Trims whitespace (spaces, newlines, indentation) from both actual and expected text before comparison.
   * This is necessary because HTML formatting often adds whitespace that doesn't affect
   * visual display but would otherwise cause assertions to fail.
   * @example await expect(element).toHaveText('Welcome')
   */
  async toHaveText(expectedText: string): Promise<void> {
    await this.assertWithRetry(
      'toHaveText',
      expectedText.trim(),
      async (context) => {
        const actualText = await this.element.getText();
        context.actual = actualText.trim();
        return actualText.trim() === expectedText.trim();
      }
    );
  }

  /**
   * Assert that the element is displayed/visible
   * @example await expect(element).toBeVisible()
   */
  async toBeVisible(): Promise<void> {
    await this.assertWithRetry(
      'toBeVisible',
      'visible',
      async (context) => {
        const isDisplayed = await this.element.isDisplayed();
        context.actual = isDisplayed ? 'visible' : 'hidden';
        return isDisplayed;
      }
    );
  }

  /**
   * Assert that the element is hidden/not visible
   * Handles both cases: element is hidden (display:none) or element is removed from DOM
   * @example await expect(element).toBeHidden()
   */
  async toBeHidden(): Promise<void> {
    await this.assertWithRetryHidden(
      'toBeHidden',
      'hidden',
      async (context) => {
        const isDisplayed = await this.element.isDisplayedNow();
        context.actual = isDisplayed ? 'visible' : 'hidden';
        return !isDisplayed;
      }
    );
  }

  /**
   * Assert that the element is enabled
   * Waits for the element to become enabled
   * @example await expect(inputElement).toBeEnabled()
   */
  async toBeEnabled(): Promise<void> {
    await this.assertWithRetry(
      'toBeEnabled',
      true,
      async (context) => {
        const isEnabled = await this.element.isEnabledNow();
        context.actual = isEnabled;
        return isEnabled === true;
      }
    );
  }

  /**
   * Assert that the element is disabled
   * Waits for the element to become disabled
   * @example await expect(inputElement).toBeDisabled()
   */
  async toBeDisabled(): Promise<void> {
    await this.assertWithRetry(
      'toBeDisabled',
      false,
      async (context) => {
        const isEnabled = await this.element.isEnabledNow();
        context.actual = !isEnabled;
        return isEnabled === false;
      }
    );
  }
}

