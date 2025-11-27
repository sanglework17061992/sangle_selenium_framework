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
import { waitUntil } from '@assertion/shared/AssertionUtils';
import { TIMING } from '@config/Constants';

export class SanPageAssertion {
  private readonly driver: WebDriver;
  private readonly timeout: number;

  constructor(driver?: WebDriver, timeout?: number) {
    this.driver = driver ?? defaultDriverManager.getDriver();
    this.timeout = timeout ?? TIMING.DEFAULT_ASSERTION_TIMEOUT;
  }

  /**
   * Assert that the page has the expected title (exact match)
   * Trims whitespace from both actual and expected title before comparison.
   * @example await expect(driver).toHaveTitle('Dashboard')
   */
  async toHaveTitle(expectedTitle: string): Promise<void> {
    let lastActualTitle = '';
    await waitUntil(
      async () => {
        lastActualTitle = await this.driver.getTitle();
        return lastActualTitle.trim() === expectedTitle.trim();
      },
      `Expected title "${expectedTitle.trim()}" but got "${lastActualTitle.trim()}"`,
      this.timeout
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
    let lastActualUrl = '';
    const isRegExp = expectedUrl instanceof RegExp;
    const expectedPattern = isRegExp ? expectedUrl.toString() : expectedUrl;
    
    await waitUntil(
      async () => {
        try {
          lastActualUrl = await this.driver.getCurrentUrl();
          if (isRegExp) {
            return expectedUrl.test(lastActualUrl);
          } else {
            // Exact string match (not partial)
            return lastActualUrl.trim() === expectedUrl.trim();
          }
        } catch {
          // Navigation not complete yet, return false to retry
          return false;
        }
      },
      `Expected URL to ${isRegExp ? 'match pattern' : 'equal'} "${expectedPattern}" but got "${lastActualUrl.trim()}"`,
      this.timeout
    );
  }
}
