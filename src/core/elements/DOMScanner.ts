/**
 * DOMScanner - Scans page DOM to find alternative element candidates
 * Used when configured locators fail during healing
 */

import { WebDriver } from 'selenium-webdriver';
import { logger } from '@utils/Logger';
import { hintExtractor, Locator, LocatorHints, DOMElementInfo } from './HintExtractor';

export interface CandidateLocator extends Locator {
  score: number;
  source: string;
  reason?: string;
}

export interface DOMScanResult {
  totalElements: number;
  matchedElements: DOMElementInfo[];
  candidateLocators: CandidateLocator[];
  scanDurationMs: number;
}

export class DOMScanner {
  /**
   * Scan DOM and extract elements matching hints
   * Returns ranked candidate locators for healing
   */
  async scanAndGenerateCandidates(
    driver: WebDriver,
    hints: LocatorHints,
    maxCandidates: number = 10
  ): Promise<DOMScanResult> {
    const startTime = Date.now();

    try {
      logger.info(`🔎 Scanning DOM for elements matching hints...`);

      // Get page source
      const pageSource = await driver.getPageSource();

      // Parse HTML to extract elements
      const elements = this.extractElementsFromHTML(pageSource, hints);

      logger.info(`   Found ${elements.length} matching elements`);

      // Generate candidate locators
      const candidates = this.generateCandidatesFromElements(
        elements,
        hints,
        maxCandidates
      );

      const duration = Date.now() - startTime;

      logger.info(`   Generated ${candidates.length} candidate locators in ${duration}ms`);

      return {
        totalElements: elements.length,
        matchedElements: elements,
        candidateLocators: candidates,
        scanDurationMs: duration,
      };
    } catch (error) {
      logger.error(`❌ DOM scan failed: ${error instanceof Error ? error.message : String(error)}`);
      return {
        totalElements: 0,
        matchedElements: [],
        candidateLocators: [],
        scanDurationMs: Date.now() - startTime,
      };
    }
  }

  /**
   * Extract elements from HTML matching hints
   * Uses simple regex-based parsing (not full DOM parsing)
   */
  private extractElementsFromHTML(html: string, hints: LocatorHints): DOMElementInfo[] {
    const elements: DOMElementInfo[] = [];

    // Match two patterns:
    // 1. Opening tag with closing: <tag attrs>text</tag>
    // 2. Self-closing tag: <tag attrs/> or <tag attrs>
    const patterns = [
      /<(\w+)([^>]*)>([^<]*)<\/\1>/gu,  // Paired tags
      /<(\w+)([^/>]*)\s*\/>/gu,          // Self-closing tags
      /<(\w+)([^>]*)>/gu,                // Opening tags (input, img, br, etc)
    ];

    const maxMatches = 1000; // Limit processing
    let matchCount = 0;

    for (const pattern of patterns) {
      let match = pattern.exec(html);
      while (match && matchCount++ < maxMatches) {
        const tag = match[1];
        const attrsStr = match[2] || '';
        const text = match[3] || '';

        const attributes = this.parseAttributes(attrsStr);
        const element: DOMElementInfo = {
          tag,
          attributes,
          text: text?.trim() || '',
        };

        // Check if element matches hints
        if (this.matchesHints(element, hints)) {
          elements.push(element);
        }

        match = pattern.exec(html);
      }
    }

    return elements;
  }

  /**
   * Parse HTML attributes from attribute string
   */
  private parseAttributes(attrsStr: string): Record<string, string> {
    const attributes: Record<string, string> = {};

    // Match attribute="value" or attribute='value'
    const attrPattern = /(\w[^\s=]*)\s*=\s*["']([^"']*)["']/gu;
    let match = attrPattern.exec(attrsStr);

    while (match) {
      const [, name, value] = match;
      attributes[name] = value;
      match = attrPattern.exec(attrsStr);
    }

    return attributes;
  }

  /**
   * Check if element matches extracted hints
   */
  private matchesHints(element: DOMElementInfo, hints: LocatorHints): boolean {
    // Match on text
    if (hints.text && element.text.includes(hints.text)) {
      return true;
    }

    if (hints.textPartial && element.text.includes(hints.textPartial)) {
      return true;
    }

    // Match on ID
    if (hints.idPattern && element.attributes['id']?.includes(hints.idPattern)) {
      return true;
    }

    // Match on class
    if (hints.classPattern && element.attributes['class']?.includes(hints.classPattern)) {
      return true;
    }

    // Match on data-testid
    if (hints.textPartial && element.attributes['data-testid']?.includes(hints.textPartial)) {
      return true;
    }

    // Match on aria-label
    if (hints.ariaLabel && element.attributes['aria-label']?.includes(hints.ariaLabel)) {
      return true;
    }

    // Match on tag name
    if (hints.tagName && element.tag === hints.tagName) {
      // If only tag name match, still consider it a weak match
      return false;
    }

    return false;
  }

  /**
   * Generate candidate locators from matched elements
   */
  private generateCandidatesFromElements(
    elements: DOMElementInfo[],
    hints: LocatorHints,
    maxCandidates: number
  ): CandidateLocator[] {
    const candidates: CandidateLocator[] = [];

    for (const element of elements) {
      const elementHints = hintExtractor.extractFromDOMElement(element);
      const score = this.scoreMatch(element, hints, elementHints);

      // Generate CSS selector
      if (element.attributes['data-testid']) {
        candidates.push({
          using: 'css',
          value: `[data-testid="${element.attributes['data-testid']}"]`,
          score: score + 25,
          source: 'data-testid',
          reason: 'Explicit test identifier',
        });
      }

      // Generate ID selector
      if (element.attributes['id']) {
        candidates.push({
          using: 'id',
          value: element.attributes['id'],
          score: score + 20,
          source: 'id',
          reason: 'Element ID',
        });
      }

      // Generate XPath with text
      if (element.text && element.text.length < 100) {
        candidates.push({
          using: 'xpath',
          value: `//${element.tag}[text()='${element.text}']`,
          score: score + 15,
          source: 'text',
          reason: 'Text content match',
        });
      }

      // Generate CSS class selector
      if (element.attributes['class']) {
        const classes = element.attributes['class'].split(' ')[0];
        candidates.push({
          using: 'css',
          value: `.${classes}`,
          score: score + 5,
          source: 'class',
          reason: 'CSS class',
        });
      }

      if (candidates.length >= maxCandidates) {
        break;
      }
    }

    // Sort by score descending
    candidates.sort((a, b) => b.score - a.score);

    return candidates.slice(0, maxCandidates);
  }

  /**
   * Score how well element matches hints
   */
  private scoreMatch(
    element: DOMElementInfo,
    originalHints: LocatorHints,
    elementHints: LocatorHints
  ): number {
    let score = 0;

    // Text matches
    if (originalHints.text && element.text === originalHints.text) {
      score += 30;
    } else if (originalHints.text && element.text.includes(originalHints.text)) {
      score += 20;
    }

    if (originalHints.textPartial && element.text.includes(originalHints.textPartial)) {
      score += 15;
    }

    // ID matches
    if (
      originalHints.idPattern &&
      element.attributes['id']?.includes(originalHints.idPattern)
    ) {
      score += 25;
    }

    // Class matches
    if (
      originalHints.classPattern &&
      element.attributes['class']?.includes(originalHints.classPattern)
    ) {
      score += 10;
    }

    // data-testid matches
    if (
      originalHints.textPartial &&
      element.attributes['data-testid']?.includes(originalHints.textPartial)
    ) {
      score += 25;
    }

    return Math.min(100, score);
  }
}

export const domScanner = new DOMScanner();
