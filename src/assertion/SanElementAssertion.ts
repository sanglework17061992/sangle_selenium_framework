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
import { waitUntilVisible, waitUntilHidden, type AssertionContext } from '@assertion/shared/AssertionUtils';
import { TIMING } from '@config/Constants';

export class SanElementAssertion {
  private readonly element: SanElement;
  private readonly timeout: number;

  constructor(element: SanElement, timeout?: number) {
    this.element = element;
    this.timeout = timeout ?? TIMING.DEFAULT_ASSERTION_TIMEOUT;
  }

  /**
   * Get locator string for error messages
   * @private
   */
  private getLocatorString(): string | undefined {
    try {
      // Access locator from SanElement if available
      const locator = (this.element as any).locator;
      if (locator) {
        return `${locator.using}('${locator.value}')`;
      }
    } catch {
      // Ignore if locator is not accessible
    }
    return undefined;
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
    const context: AssertionContext = {
      assertionType: 'toHaveText',
      expected: expectedText.trim(),
      locator: this.getLocatorString(),
    };

    await waitUntilVisible(
      async () => {
        lastActualText = await this.element.getText();
        context.actual = lastActualText.trim();
        return lastActualText.trim() === expectedText.trim();
      },
      context,
      this.timeout
    );
  }

  /**
   * Assert that the element is displayed/visible
   * @example await expect(element).toBeVisible()
   */
  async toBeVisible(): Promise<void> {
    const context: AssertionContext = {
      assertionType: 'toBeVisible',
      expected: 'visible',
      locator: this.getLocatorString(),
    };

    await waitUntilVisible(
      async () => {
        context.actual = (await this.element.isDisplayed()) ? 'visible' : 'hidden';
        return this.element.isDisplayed();
      },
      context,
      this.timeout
    );
  }

  /**
   * Assert that the element is hidden/not visible
   * Handles both cases: element is hidden (display:none) or element is removed from DOM
   * @example await expect(element).toBeHidden()
   */
  async toBeHidden(): Promise<void> {
    let isDisplayed = false;
    const context: AssertionContext = {
      assertionType: 'toBeHidden',
      expected: 'hidden',
      locator: this.getLocatorString(),
    };

    await waitUntilHidden(
      async () => {
        const isDisplayed = await this.element.isDisplayedNow();
        context.actual = isDisplayed ? 'visible' : 'hidden';
        return !isDisplayed;
      },
      context,
      this.timeout
    );
  }

  /**
   * Assert that the element is enabled
   * Waits for the element to become enabled
   * @example await expect(inputElement).toBeEnabled()
   */
  async toBeEnabled(): Promise<void> {
    const context: AssertionContext = {
      assertionType: 'toBeEnabled',
      expected: true,
      locator: this.getLocatorString(),
    };

    await waitUntilVisible(
      async () => {
        const isEnabled = await this.element.isEnabledNow();
        context.actual = isEnabled;
        return isEnabled === true;
      },
      context,
      this.timeout
    );
  }

  /**
   * Assert that the element is disabled
   * Waits for the element to become disabled
   * @example await expect(inputElement).toBeDisabled()
   */
  async toBeDisabled(): Promise<void> {
    const context: AssertionContext = {
      assertionType: 'toBeDisabled',
      expected: false,
      locator: this.getLocatorString(),
    };

    await waitUntilVisible(
      async () => {
        const isEnabled = await this.element.isEnabledNow();
        context.actual = !isEnabled;
        return isEnabled === false;
      },
      context,
      this.timeout
    );
  }
}

