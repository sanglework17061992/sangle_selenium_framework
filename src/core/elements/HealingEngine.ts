/**
 * HealingEngine - Orchestrates all self-healing phases
 * PHASE 1: Try primary + fallback locators
 * PHASE 2: Extract hints from locators
 * PHASE 3: Scan DOM for alternative candidates  
 * PHASE 4: Validate candidates and return first match
 * PHASE 5: Update config on successful healing
 */

import { WebDriver, WebElement } from 'selenium-webdriver';
import { logger } from '@utils/Logger';
import { hintExtractor, Locator, LocatorHints } from './HintExtractor';
import { domScanner, CandidateLocator, DOMScanResult } from './DOMScanner';
import { locatorConfigManager } from '@config/LocatorConfigManager';

export interface HealingAttempt {
  timestamp: number;
  locatorId?: string;
  primaryLocator: Locator;
  fallbackLocators: Locator[];
  extractedHints: LocatorHints;
  scanResult?: DOMScanResult;
  healedWith?: CandidateLocator;
  success: boolean;
  duration: number;
}

export class HealingEngine {
  private healingAttempts: HealingAttempt[] = [];

  /**
   * PHASE 1: Try primary + fallback locators from configured list
   */
  private async tryConfiguredLocators(
    driver: WebDriver,
    primaryLocator: Locator,
    fallbackLocators: Locator[],
    timeout: number
  ): Promise<WebElement | null> {
    const startTime = Date.now();

    for (const locator of [primaryLocator, ...fallbackLocators]) {
      try {
        const element = await this.findElementByLocator(driver, locator, timeout);
        if (element) {
          const elapsed = Date.now() - startTime;
          logger.debug(`✅ Found with ${locator.using}="${locator.value}" in ${elapsed}ms`);
          return element;
        }
      } catch (error: unknown) {
        logger.debug(
          `  ⏭️  ${locator.using}="${locator.value}" not found, trying next...`
        );
      }
    }

    return null;
  }

  /**
   * PHASE 2: Extract hints from primary locator
   */
  private extractHints(primaryLocator: Locator, fallbacks: Locator[]): LocatorHints {
    logger.debug(`🔍 PHASE 2: Extracting hints from locators...`);

    const hints = hintExtractor.extractFromLocator(primaryLocator);
    const fallbackHints = fallbacks.map(f => hintExtractor.extractFromLocator(f));
    const mergedHints = hintExtractor.mergeHints([hints, ...fallbackHints]);

    logger.debug(`   Extracted hints: ${JSON.stringify(mergedHints)}`);
    return mergedHints;
  }

  /**
   * PHASE 3: Scan DOM and generate candidates
   */
  private async scanDOMForCandidates(
    driver: WebDriver,
    hints: LocatorHints
  ): Promise<DOMScanResult> {
    logger.debug(`🔎 PHASE 3: Scanning DOM for alternative candidates...`);

    try {
      const result = await domScanner.scanAndGenerateCandidates(driver, hints, 10);
      logger.debug(
        `   Found ${result.candidateLocators.length} candidates from ${result.totalElements} elements`
      );
      return result;
    } catch (error) {
      logger.warn(
        `⚠️  DOM scan failed: ${error instanceof Error ? error.message : String(error)}`
      );
      return {
        totalElements: 0,
        matchedElements: [],
        candidateLocators: [],
        scanDurationMs: 0,
      };
    }
  }

  /**
   * PHASE 4: Validate candidate locators and return first match
   */
  private async validateCandidates(
    driver: WebDriver,
    candidates: CandidateLocator[],
    timeout: number
  ): Promise<{ element: WebElement; candidate: CandidateLocator } | null> {
    logger.debug(`✔️  PHASE 4: Validating ${candidates.length} candidates...`);

    for (const candidate of candidates) {
      try {
        const element = await this.findElementByLocator(driver, candidate, timeout);
        if (element) {
          logger.debug(
            `✅ Healed with ${candidate.using}="${candidate.value}" (${candidate.source})`
          );
          return { element, candidate };
        }
      } catch (error: unknown) {
        logger.debug(
          `  ⏭️  Candidate ${candidate.using}="${candidate.value}" failed, trying next...`
        );
      }
    }

    return null;
  }

  /**
   * PHASE 5: Update config with successful healing
   */
  private async updateConfigAfterHealing(
    locatorId: string | undefined,
    primaryLocator: Locator,
    healedCandidate: CandidateLocator
  ): Promise<void> {
    if (!locatorId) {
      logger.debug(`⏭️  No locator ID provided, skipping config update`);
      return;
    }

    logger.debug(`📝 PHASE 5: Updating config...`);

    try {
      locatorConfigManager.updateAfterHealing(
        locatorId,
        healedCandidate,
        primaryLocator
      );

      await locatorConfigManager.saveConfig();
      logger.info(`✅ Config updated for ${locatorId}`);
    } catch (error) {
      logger.warn(
        `⚠️  Failed to update config: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Main healing flow orchestration
   * Returns healed element or throws error
   */
  async heal(
    driver: WebDriver,
    primaryLocator: Locator,
    fallbackLocators: Locator[],
    timeout: number = 10000,
    locatorId?: string
  ): Promise<{ element: WebElement; healedWith?: CandidateLocator }> {
    const startTime = Date.now();
    logger.info(`\n🔧 Self-Healing started for ${locatorId || primaryLocator.using}="${primaryLocator.value}"`);

    // PHASE 1: Try configured locators
    logger.debug(`🔌 PHASE 1: Trying configured locators...`);
    let element = await this.tryConfiguredLocators(
      driver,
      primaryLocator,
      fallbackLocators,
      timeout
    );

    if (element) {
      logger.info(`✅ Self-Healing: Primary/fallback locators worked`);
      return { element };
    }

    logger.warn(`❌ All configured locators failed, entering healing mode...`);

    // PHASE 2: Extract hints
    const hints = this.extractHints(primaryLocator, fallbackLocators);

    // PHASE 3: Scan DOM
    const scanResult = await this.scanDOMForCandidates(driver, hints);

    if (scanResult.candidateLocators.length === 0) {
      throw new Error(
        `Self-healing failed: No candidates generated\n` +
        `Primary: ${primaryLocator.using}="${primaryLocator.value}"\n` +
        `Hints: ${JSON.stringify(hints)}`
      );
    }

    // PHASE 4: Validate candidates
    const healResult = await this.validateCandidates(
      driver,
      scanResult.candidateLocators,
      timeout
    );

    if (!healResult) {
      throw new Error(
        `Self-healing failed: No valid candidates found\n` +
        `Tried ${scanResult.candidateLocators.length} candidates`
      );
    }

    // PHASE 5: Update config
    await this.updateConfigAfterHealing(
      locatorId,
      primaryLocator,
      healResult.candidate
    );

    const duration = Date.now() - startTime;
    logger.info(`✨ Self-Healing successful in ${duration}ms`);
    logger.info(`   Used: ${healResult.candidate.using}="${healResult.candidate.value}" (${healResult.candidate.source})`);

    // Record attempt
    this.healingAttempts.push({
      timestamp: Date.now(),
      locatorId,
      primaryLocator,
      fallbackLocators,
      extractedHints: hints,
      scanResult,
      healedWith: healResult.candidate,
      success: true,
      duration,
    });

    return {
      element: healResult.element,
      healedWith: healResult.candidate,
    };
  }

  /**
   * Attempt to find element by locator
   */
  private async findElementByLocator(
    driver: WebDriver,
    locator: Locator,
    timeout: number
  ): Promise<WebElement | null> {
    const { By } = require('selenium-webdriver');
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        let by;
        switch (locator.using) {
          case 'css':
            by = By.css(locator.value);
            break;
          case 'xpath':
            by = By.xpath(locator.value);
            break;
          case 'id':
            by = By.id(locator.value);
            break;
          case 'name':
            by = By.name(locator.value);
            break;
          case 'class':
            by = By.className(locator.value);
            break;
          default:
            return null;
        }

        const element = await driver.findElement(by);
        if (element) {
          return element;
        }
      } catch (error: unknown) {
        // Element not found yet, retry
      }

      // Wait a bit before retry
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return null;
  }

  /**
   * Get all healing attempts
   */
  getAttempts(): HealingAttempt[] {
    return this.healingAttempts;
  }

  /**
   * Get healing statistics
   */
  getStats(): {
    totalAttempts: number;
    successfulAttempts: number;
    averageDuration: number;
  } {
    const total = this.healingAttempts.length;
    const successful = this.healingAttempts.filter(a => a.success).length;
    const avgDuration = total > 0
      ? this.healingAttempts.reduce((sum, a) => sum + a.duration, 0) / total
      : 0;

    return {
      totalAttempts: total,
      successfulAttempts: successful,
      averageDuration: avgDuration,
    };
  }

  /**
   * Clear healing history
   */
  clearHistory(): void {
    this.healingAttempts = [];
  }
}

export const healingEngine = new HealingEngine();
