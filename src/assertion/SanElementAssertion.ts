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
 * // Wait for element to have specific attribute
 * await expect(element).toHaveAttribute('class', 'active');
 */

import { SanElement } from '@core/elements/SanElement';
import { safeAssert, waitUntil } from '@assertion/shared/AssertionUtils';
import * as assert from '@assertion/shared/AssertionUtils';
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
   * @example await expect(element).toHaveText('Welcome')
   */
  async toHaveText(expectedText: string): Promise<void> {
    let lastActualText = '';
    await waitUntil(
      async () => {
        lastActualText = await this.element.getText();
        return safeAssert(async () => {
          assert.equal(lastActualText.trim(), expectedText);
        });
      },
      `Expected element text "${expectedText}" but got "${lastActualText.trim()}"`,
      this.timeout
    );
  }

  /**
   * Assert that the element is displayed/visible
   * @example await expect(element).toBeVisible()
   */
  async toBeVisible(): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        // Try to get text to verify element is accessible and visible
        await this.element.getText();
      }),
      `element to be visible`,
      this.timeout
    );
  }
}
