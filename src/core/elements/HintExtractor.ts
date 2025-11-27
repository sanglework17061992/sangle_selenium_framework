/**
 * HintExtractor - Extract useful hints from locators and DOM elements
 * Used to generate candidate locators during healing
 */

import { logger } from '@utils/Logger';

export interface Locator {
  using: 'css' | 'xpath' | 'id' | 'name' | 'class';
  value: string;
}

export interface LocatorHints {
  text?: string;
  textPartial?: string;
  idPattern?: string;
  classPattern?: string;
  ariaLabel?: string;
  tagName?: string;
  role?: string;
}

export interface DOMElementInfo {
  tag: string;
  attributes: Record<string, string>;
  text: string;
}

export class HintExtractor {
  /**
   * Extract hints from a locator string
   */
  extractFromLocator(locator: Locator): LocatorHints {
    const hints: LocatorHints = {};

    switch (locator.using) {
      case 'css':
        return this.extractFromCSS(locator.value);
      case 'xpath':
        return this.extractFromXPath(locator.value);
      case 'id':
        hints.idPattern = locator.value;
        return hints;
      case 'name':
        hints.ariaLabel = locator.value;
        return hints;
      case 'class':
        hints.classPattern = locator.value;
        return hints;
      default:
        return hints;
    }
  }

  /**
   * Extract hints from CSS selector
   */
  private extractFromCSS(value: string): LocatorHints {
    const hints: LocatorHints = {};

    // Extract attribute value: [data-testid="login-button"]
    const attrPattern = /\[(?:data-)?(\w+)[="']*([^"'\]]+)/u;
    const attrMatch = attrPattern.exec(value);
    if (attrMatch) {
      hints.textPartial = attrMatch[2];
    }

    // Extract id: #submit-btn
    const idPattern = /#([\w-]+)/u;
    const idMatch = idPattern.exec(value);
    if (idMatch) {
      hints.idPattern = idMatch[1];
    }

    // Extract class: .btn-primary
    const classPattern = /\.([\w-]+)/u;
    const classMatch = classPattern.exec(value);
    if (classMatch) {
      hints.classPattern = classMatch[1];
    }

    // Extract tag name
    const tagPattern = /^(\w+)/u;
    const tagMatch = tagPattern.exec(value);
    if (tagMatch) {
      hints.tagName = tagMatch[1];
    }

    return hints;
  }

  /**
   * Extract hints from XPath expression
   */
  private extractFromXPath(value: string): LocatorHints {
    const hints: LocatorHints = {};

    // Extract text()
    const textPattern = /text\(\)\s*=\s*['"]([^'"]+)['"]/u;
    const textMatch = textPattern.exec(value);
    if (textMatch) {
      hints.text = textMatch[1];
    }

    // Extract contains text
    const containsPattern = /contains\(\.\s*,\s*['"]([^'"]+)['"]\)/u;
    const containsMatch = containsPattern.exec(value);
    if (containsMatch) {
      hints.textPartial = containsMatch[1];
    }

    // Extract @id
    const idPattern = /@id\s*=\s*['"]([^'"]+)['"]/u;
    const idMatch = idPattern.exec(value);
    if (idMatch) {
      hints.idPattern = idMatch[1];
    }

    // Extract @class
    const classPattern = /@class[^=]*=\s*['"]([^'"]+)['"]/u;
    const classMatch = classPattern.exec(value);
    if (classMatch) {
      hints.classPattern = classMatch[1];
    }

    // Extract tag name
    const tagPattern = /\/\/(\w+)/u;
    const tagMatch = tagPattern.exec(value);
    if (tagMatch) {
      hints.tagName = tagMatch[1];
    }

    // Extract @aria-label
    const ariaPattern = /@aria-label\s*=\s*['"]([^'"]+)['"]/u;
    const ariaMatch = ariaPattern.exec(value);
    if (ariaMatch) {
      hints.ariaLabel = ariaMatch[1];
    }

    return hints;
  }

  /**
   * Extract hints from DOM element attributes
   */
  extractFromDOMElement(element: DOMElementInfo): LocatorHints {
    const hints: LocatorHints = {};

    if (element.attributes['data-testid']) {
      hints.textPartial = element.attributes['data-testid'];
    }

    if (element.attributes['id']) {
      hints.idPattern = element.attributes['id'];
    }

    if (element.attributes['class']) {
      const classes = element.attributes['class'].split(' ');
      const commonClasses = new Set(['container', 'wrapper', 'flex', 'grid', 'row', 'col']);
      const meaningfulClass = classes.find(
        (c: string) => !commonClasses.has(c)
      );
      if (meaningfulClass) {
        hints.classPattern = meaningfulClass;
      }
    }

    if (element.attributes['aria-label']) {
      hints.ariaLabel = element.attributes['aria-label'];
    }

    if (element.text && element.text.length > 0 && element.text.length < 100) {
      hints.text = element.text.trim();
    }

    hints.tagName = element.tag;

    if (element.attributes['role']) {
      hints.role = element.attributes['role'];
    }

    return hints;
  }

  /**
   * Merge multiple hint sources with priority ranking
   */
  mergeHints(hintsArray: LocatorHints[]): LocatorHints {
    const merged: LocatorHints = {};

    for (const hints of hintsArray) {
      this.mergeHint(merged, hints, 'textPartial');
      this.mergeHint(merged, hints, 'text');
      this.mergeHint(merged, hints, 'idPattern');
      this.mergeHint(merged, hints, 'classPattern');
      this.mergeHint(merged, hints, 'ariaLabel');
      this.mergeHint(merged, hints, 'tagName');
      this.mergeHint(merged, hints, 'role');
    }

    return merged;
  }

  /**
   * Helper to merge individual hint
   */
  private mergeHint(
    target: LocatorHints,
    source: LocatorHints,
    key: keyof LocatorHints
  ): void {
    if (source[key] && !target[key]) {
      target[key] = source[key];
    }
  }

  /**
   * Score how useful extracted hints are
   */
  scoreHints(hints: LocatorHints): number {
    let score = 0;

    if (hints.textPartial?.includes('test')) {
      score += 40;
    } else if (hints.textPartial) {
      score += 25;
    }

    if (hints.idPattern) score += 35;
    if (hints.text) score += 20;
    if (hints.classPattern) score += 10;
    if (hints.ariaLabel) score += 30;
    if (hints.tagName) score += 5;

    if (Object.keys(hints).length > 2) score += 10;

    return Math.min(100, score);
  }

  /**
   * Log extracted hints for debugging
   */
  logHints(locator: Locator, hints: LocatorHints): void {
    logger.debug(`🔍 Hints extracted from ${locator.using}="${locator.value}"`);
    for (const [key, value] of Object.entries(hints)) {
      if (value) logger.debug(`   ${key}: ${String(value)}`);
    }
  }
}

// Singleton instance
export const hintExtractor = new HintExtractor();
