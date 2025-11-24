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
   * Assert that the page has the expected URL (exact match)
   * Trims whitespace from both actual and expected URL before comparison.
   * Handles navigation timing issues gracefully by catching exceptions during URL retrieval.
   * @example await expect(driver).toHaveURL('https://example.com/dashboard')
   */
  async toHaveURL(expectedUrl: string): Promise<void> {
    let lastActualUrl = '';
    await waitUntil(
      async () => {
        try {
          lastActualUrl = await this.driver.getCurrentUrl();
          return lastActualUrl.trim() === expectedUrl.trim();
        } catch {
          // Navigation not complete yet, return false to retry
          return false;
        }
      },
      `Expected URL "${expectedUrl.trim()}" but got "${lastActualUrl.trim()}"`,
      this.timeout
    );
  }

  /**
   * Assert that the page URL contains the expected substring
   * Useful for partial URL matching without needing exact URLs
   * @example await expect(driver).toHaveURLContaining('example.com')
   */
  async toHaveURLContaining(expectedUrlPart: string): Promise<void> {
    let lastActualUrl = '';
    await waitUntil(
      async () => {
        try {
          lastActualUrl = await this.driver.getCurrentUrl();
          return lastActualUrl.includes(expectedUrlPart);
        } catch {
          // Navigation not complete yet, return false to retry
          return false;
        }
      },
      `Expected URL to contain "${expectedUrlPart}" but got "${lastActualUrl}"`,
      this.timeout
    );
  }
}
