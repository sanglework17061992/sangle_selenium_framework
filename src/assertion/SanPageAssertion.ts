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
import { safeAssert, waitUntil, equal, createAssertionError } from '@assertion/shared/AssertionUtils';
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
   * Does NOT trim whitespace - page titles should match exactly as defined.
   * Unlike element text assertions, page titles are typically controlled and don't
   * have formatting whitespace issues.
   * @example await expect(driver).toHaveTitle('Dashboard')
   */
  async toHaveTitle(expectedTitle: string): Promise<void> {
    let lastActualTitle = '';
    await waitUntil(
      async () => {
        lastActualTitle = await this.driver.getTitle();
        return safeAssert(async () => {
          equal(lastActualTitle, expectedTitle);
        });
      },
      createAssertionError('title', expectedTitle, lastActualTitle),
      this.timeout
    );
  }

  /**
   * Assert that the page has the expected URL (exact match)
   * Does NOT trim whitespace - URLs are exact values that should match precisely.
   * Handles navigation timing issues gracefully by catching exceptions during URL retrieval.
   * @example await expect(driver).toHaveURL('https://example.com/dashboard')
   */
  async toHaveURL(expectedUrl: string): Promise<void> {
    let lastActualUrl = '';
    await waitUntil(
      async () => {
        try {
          lastActualUrl = await this.driver.getCurrentUrl();
          return safeAssert(async () => {
            equal(lastActualUrl, expectedUrl);
          });
        } catch {
          // Navigation not complete yet, or driver in transitional state - retry
          // (Don't throw - just return false to trigger retry)
          return false;
        }
      },
      createAssertionError('URL', expectedUrl, lastActualUrl),
      this.timeout
    );
  }
}
