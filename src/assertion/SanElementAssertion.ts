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

export class SanElementAssertion {
  private readonly element: SanElement;
  private readonly timeout: number;

  constructor(element: SanElement, timeout?: number) {
    this.element = element;
    this.timeout = timeout ?? TIMING.DEFAULT_ASSERTION_TIMEOUT;
  }

  /**
   * Assert that the element has the exact text
   * Trims whitespace (spaces, newlines, indentation) from both actual and expected text before comparison.
   * This is necessary because HTML formatting often adds whitespace that doesn't affect
   * visual display but would otherwise cause assertions to fail.
   * @example await expect(element).toHaveText('Welcome')
   */
  async toHaveText(expectedText: string): Promise<void> {
    let lastActualText = '';
    await waitUntilVisible(
      async () => {
        lastActualText = await this.element.getText();
        return lastActualText.trim() === expectedText.trim();
      },
      `Expected element text "${expectedText.trim()}" but got "${lastActualText.trim()}"`,
      this.timeout
    );
  }

  /**
   * Assert that the element is displayed/visible
   * @example await expect(element).toBeVisible()
   */
  async toBeVisible(): Promise<void> {
    await waitUntilVisible(
      () => this.element.isDisplayed(),
      'Expected element to be visible but it is not',
      this.timeout
    );
  }

  /**
   * Assert that the element is hidden/not visible
   * Handles both cases: element is hidden (display:none) or element is removed from DOM
   * @example await expect(element).toBeHidden()
   */
  async toBeHidden(): Promise<void> {
    await waitUntilHidden(
      async () => {
        try {
          const isDisplayed = await this.element.isDisplayed({ timeout: 0 });
          return !isDisplayed;
        } catch {
          return true; // Element not found = hidden
        }
      },
      'Expected element to be hidden but it is visible',
      this.timeout
    );
  }

  /**
   * Assert that the element is enabled
   * Waits for the element to become enabled
   * @example await expect(inputElement).toBeEnabled()
   */
  async toBeEnabled(): Promise<void> {
    await waitUntilVisible(
      async () => {
        try {
          const isEnabled = await this.element.isEnabled({ timeout: 0 });
          return isEnabled === true;
        } catch {
          return false;
        }
      },
      'Expected element to be enabled but it is disabled',
      this.timeout
    );
  }

  /**
   * Assert that the element is disabled
   * Waits for the element to become disabled
   * @example await expect(inputElement).toBeDisabled()
   */
  async toBeDisabled(): Promise<void> {
    await waitUntilVisible(
      async () => {
        try {
          const isEnabled = await this.element.isEnabled({ timeout: 0 });
          return isEnabled === false;
        } catch {
          return false;
        }
      },
      'Expected element to be disabled but it is enabled',
      this.timeout
    );
  }
}
