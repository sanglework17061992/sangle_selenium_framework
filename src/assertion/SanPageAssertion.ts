/**
 * SanPageAssertion - Auto-retrying assertions for page-level properties
 * 
 * These assertions automatically retry until the condition is met or timeout is reached.
 * Used for page-level checks like title and URL validation.
 * 
 * @example
 * // Wait for page to have specific title (auto-retry until timeout)
 * await expect(driver).toHaveTitle('My App');
 * 
 * // Wait for page URL to match
 * await expect(driver).toHaveURL('https://example.com/dashboard');
 */

import { WebDriver } from 'selenium-webdriver';
import { defaultDriverManager } from '@driver/DriverManager';
import { waitUntilVisible } from '@assertion/shared/AssertionUtils';
import type { ErrorContext } from '@errorTypes';
import { TIMING } from '@config/Constants';

export class SanPageAssertion {
  private readonly driver: WebDriver;
  private readonly timeout: number;

  constructor(driver?: WebDriver, timeout?: number) {
    this.driver = driver ?? defaultDriverManager.getDriver();
    this.timeout = timeout ?? TIMING.DEFAULT_ASSERTION_TIMEOUT;
  }

  /**
   * Generic assertion helper that retries until condition is met
   * @private
   */
  private async assertWithRetry(
    operation: string,
    locator: string,
    expectedValue: any,
    testFn: (context: ErrorContext) => Promise<boolean>
  ): Promise<void> {
    const context: ErrorContext = {
      operation,
      expected: expectedValue,
      locator,
    };

    await waitUntilVisible(
      () => testFn(context),
      context,
      this.timeout
    );
  }

  /**
   * Assert that the page has the expected title (exact match)
   * Trims whitespace from both actual and expected title before comparison.
   * @example await expect(driver).toHaveTitle('Dashboard')
   */
  async toHaveTitle(expectedTitle: string): Promise<void> {
    await this.assertWithRetry(
      'toHaveTitle',
      'page.title',
      expectedTitle.trim(),
      async (context) => {
        const actualTitle = await this.driver.getTitle();
        context.actual = actualTitle.trim();
        return actualTitle.trim() === expectedTitle.trim();
      }
    );
  }

  /**
   * Assert that the page URL matches the expected value
   * Supports exact string matching and RegExp pattern matching
   * @param expectedUrl - String for exact match or RegExp for pattern matching
   * @example 
   * // Exact match
   * await expect(driver).toHaveURL('https://example.com/dashboard')
   * // Partial match with regex
   * await expect(driver).toHaveURL(/example\.com/)
   * // Pattern match
   * await expect(driver).toHaveURL(/\/dashboard\/\d+/)
   */
  async toHaveURL(expectedUrl: string | RegExp): Promise<void> {
    const isRegExp = expectedUrl instanceof RegExp;
    const expectedPattern = isRegExp ? expectedUrl.toString() : expectedUrl;

    await this.assertWithRetry(
      'toHaveURL',
      'page.url',
      expectedPattern,
      async (context) => {
        try {
          const actualUrl = await this.driver.getCurrentUrl();
          context.actual = actualUrl.trim();
          if (isRegExp) {
            return expectedUrl.test(actualUrl);
          } else {
            return actualUrl.trim() === expectedUrl.trim();
          }
        } catch {
          return false;
        }
      }
    );
  }
}

