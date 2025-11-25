import { WebDriver, WebElement } from 'selenium-webdriver';
import { logger } from '@utils/Logger';
import type { Locator } from '@core/elements/SanElement';
import { elementFinder } from '@core/elements/ElementFinder';
import { LocatorCache } from '@core/locators/LocatorCache';

/**
 * SmartLocatorFinder - Intelligent element finding with self-healing capability
 * 
 * Features:
 * - Tries locators ordered by learned success rate
 * - Records success/failure for future optimization
 * - Supports fallback locators with scoring
 * - Integrates with LocatorCache for persistent learning
 * - Parallel-worker aware
 * 
 * Usage:
 * const finder = new SmartLocatorFinder(driver, cache);
 * const element = await finder.find('login-button', [cssLocator, xpathLocator]);
 * // Automatically learns best locator for future use
 */
export class SmartLocatorFinder {
  constructor(
    private readonly driver: WebDriver,
    private readonly cache: LocatorCache
  ) {}

  /**
   * Find element with intelligent fallback and self-healing
   * 
   * @param elementId - Unique identifier for element (e.g., 'login-button')
   * @param providedLocators - Additional locators to try
   * @param timeout - Maximum wait time in milliseconds (total, not per locator)
   * @returns WebElement if found
   * @throws Error if all locators fail
   */
  async find(
    elementId: string,
    providedLocators: Locator[] = [],
    timeout: number = 5000
  ): Promise<WebElement> {
    const cachedLocators = this.cache.getByScore(elementId);
    const locatorsToTry = [...cachedLocators, ...providedLocators];
    
    if (locatorsToTry.length === 0) {
      throw new Error(`No locators provided for element: ${elementId}`);
    }

    const startTime = Date.now();
    const errors: Array<{ locator: Locator; error: string }> = [];
    
    // Per-locator timeout: distribute total timeout across locators
    // Minimum 500ms per locator, maximum 2000ms
    const perLocatorTimeout = Math.max(
      500,
      Math.min(2000, Math.floor(timeout / locatorsToTry.length))
    );

    for (const locator of locatorsToTry) {
      try {
        const remainingTimeout = timeout - (Date.now() - startTime);
        if (remainingTimeout <= 0) {
          throw new Error(`Timeout exceeded (${timeout}ms)`);
        }

        // Use per-locator timeout, but respect overall remaining time
        const thisLocatorTimeout = Math.min(perLocatorTimeout, remainingTimeout);

        logger.debug(
          `SmartLocatorFinder: Trying ${locator.using}="${locator.value}" for ${elementId}`
        );

        const element = await elementFinder.find(locator, this.driver, { timeout: thisLocatorTimeout });

        // Success! Record it
        this.cache.recordSuccess(elementId, locator);
        logger.info(
          `SmartLocatorFinder: ✓ Found ${elementId} using ${locator.using}="${locator.value}"`
        );

        return element;

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push({ locator, error: errorMsg });
        this.cache.recordFailure(elementId, locator);
        
        logger.debug(
          `SmartLocatorFinder: ✗ Failed for ${elementId} (${locator.using}): ${errorMsg}`
        );
      }
    }

    // All locators failed
    const attempts = errors
      .map((e, i) => `\n  ${i + 1}. ${e.locator.using}="${e.locator.value}": ${e.error}`)
      .join('');

    throw new Error(
      `SmartLocatorFinder: Failed to find "${elementId}" after ${locatorsToTry.length} attempts:${attempts}`
    );
  }

  /**
   * Get learning stats for debugging
   */
  getStats(elementId: string): object {
    const scores = this.cache.getScores(elementId);
    
    return {
      elementId,
      totalLocators: scores.length,
      locators: scores.map(s => ({
        locator: `${s.locator.using}="${s.locator.value}"`,
        score: `${s.score}%`,
        successes: s.successCount,
        failures: s.failureCount,
        discovered: s.discoveredAt.toISOString(),
        lastUsed: s.lastUsed.toISOString()
      }))
    };
  }
}

export default SmartLocatorFinder;
