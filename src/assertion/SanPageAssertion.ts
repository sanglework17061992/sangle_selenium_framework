/**
 * SanPageAssertion - Auto-retrying assertions for BasePage
 * 
 * These assertions automatically retry until the condition is met or timeout is reached.
 * Used for page-level checks like title and URL validation.
 * 
 * Similar to Playwright's expect(page) API with auto-waiting built-in.
 * 
 * @example
 * // Wait for page to have specific title (auto-retry until timeout)
 * await expect(page).toHaveTitle('My App');
 * 
 * // Wait for page URL to contain substring
 * await expect(page).toHaveURLContaining('/dashboard');
 * 
 * // Wait for page title to match regex
 * await expect(page).toHaveTitleMatching(/Dashboard/);
 * 
 * // Custom timeout
 * await expect(page, 10000).toHaveTitle('My App');
 */

import { BasePage } from '../pages/BasePage';
import { safeAssert, waitUntil, DEFAULT_TIMEOUT } from './shared/AssertionUtils';
import * as assert from './shared/AssertionUtils';

export class SanPageAssertion {
  private readonly page: BasePage;
  private readonly timeout: number;

  constructor(page: BasePage, timeout?: number) {
    this.page = page;
    this.timeout = timeout ?? DEFAULT_TIMEOUT;
  }

  /**
   * Assert that the page has the expected title (exact match)
   * @example await expect(page).toHaveTitle('Dashboard')
   */
  async toHaveTitle(expectedTitle: string): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const driver = this.page['driver'];
        const actualTitle = await driver.getTitle();
        assert.equal(actualTitle, expectedTitle);
      }),
      `page to have title "${expectedTitle}"`,
      this.timeout
    );
  }

  /**
   * Assert that the page title contains the expected substring
   * @example await expect(page).toHaveTitleContaining('Dashboard')
   */
  async toHaveTitleContaining(expectedSubstring: string): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const driver = this.page['driver'];
        const actualTitle = await driver.getTitle();
        assert.include(actualTitle, expectedSubstring);
      }),
      `page title to contain "${expectedSubstring}"`,
      this.timeout
    );
  }

  /**
   * Alias for toHaveTitleContaining
   * @example await expect(page).toContainTitle('Dashboard')
   */
  async toContainTitle(expectedSubstring: string): Promise<void> {
    await this.toHaveTitleContaining(expectedSubstring);
  }

  /**
   * Assert that the page title matches the expected regex pattern
   * @example await expect(page).toHaveTitleMatching(/Dashboard/)
   */
  async toHaveTitleMatching(pattern: RegExp): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const driver = this.page['driver'];
        const actualTitle = await driver.getTitle();
        if (!pattern.test(actualTitle)) {
          throw new Error(`Title "${actualTitle}" does not match pattern ${pattern}`);
        }
      }),
      `page title to match pattern ${pattern}`,
      this.timeout
    );
  }

  /**
   * Assert that the page has the expected URL (exact match)
   * @example await expect(page).toHaveURL('https://example.com/dashboard')
   */
  async toHaveURL(expectedUrl: string): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const driver = this.page['driver'];
        const actualUrl = await driver.getCurrentUrl();
        assert.equal(actualUrl, expectedUrl);
      }),
      `page to have URL "${expectedUrl}"`,
      this.timeout
    );
  }

  /**
   * Assert that the page URL contains the expected substring
   * @example await expect(page).toHaveURLContaining('/dashboard')
   */
  async toHaveURLContaining(expectedSubstring: string): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const driver = this.page['driver'];
        const actualUrl = await driver.getCurrentUrl();
        assert.include(actualUrl, expectedSubstring);
      }),
      `page URL to contain "${expectedSubstring}"`,
      this.timeout
    );
  }

  /**
   * Alias for toHaveURLContaining
   * @example await expect(page).toContainURL('/dashboard')
   */
  async toContainURL(expectedSubstring: string): Promise<void> {
    await this.toHaveURLContaining(expectedSubstring);
  }

  /**
   * Assert that the page URL matches the expected regex pattern
   * @example await expect(page).toHaveURLMatching(/dashboard/)
   */
  async toHaveURLMatching(pattern: RegExp): Promise<void> {
    await waitUntil(
      () => safeAssert(async () => {
        const driver = this.page['driver'];
        const actualUrl = await driver.getCurrentUrl();
        if (!pattern.test(actualUrl)) {
          throw new Error(`URL "${actualUrl}" does not match pattern ${pattern}`);
        }
      }),
      `page URL to match pattern ${pattern}`,
      this.timeout
    );
  }
}
