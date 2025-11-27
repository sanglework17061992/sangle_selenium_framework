/**
 * Self-Healing Types and Interfaces
 */

/**
 * Locator definition (supports multiple formats)
 */
export interface Locator {
  using: 'css' | 'xpath' | 'id' | 'name' | 'class';
  value: string;
}

/**
 * Extracted hints from a locator or element
 */
export interface LocatorHints {
  text?: string;
  textPartial?: string;
  idPattern?: string;
  classPattern?: string;
  ariaLabel?: string;
  tagName?: string;
  role?: string;
}

/**
 * A candidate locator generated during healing
 * Includes score and metadata for ranking
 */
export interface CandidateLocator extends Locator {
  score: number;  // 0-100, higher is better
  source: 'hint-text' | 'hint-id' | 'hint-class' | 'dom-scan' | 'aria';
  reason?: string;  // Why this locator was suggested
}

/**
 * Result of a healing attempt
 */
export interface HealingAttempt {
  timestamp: number;
  locatorId: string;
  primaryLocator: Locator;
  fallbackLocators: Locator[];
  allAttemptsFailed: boolean;
  hintExtracted: LocatorHints;
  candidatesGenerated: CandidateLocator[];
  healedWith?: CandidateLocator;
  success: boolean;
  errorMessage?: string;
}

/**
 * Configuration for a single locator with primary and fallbacks
 */
export interface LocatorConfigEntry {
  locatorId: string;
  description?: string;
  primary: Locator;
  fallbacks: Locator[];
  hints?: LocatorHints;  // Manual hints for faster healing
  priority?: 'high' | 'medium' | 'low';  // Healing priority
  updatedAt?: string;  // Last update timestamp
}

/**
 * Root config file structure for all locators
 */
export interface LocatorsConfig {
  version: string;  // Config version (e.g., "1.0.0")
  framework: string;
  generatedAt: string;
  selfHealingEnabled: boolean;
  maxHealingAttempts: number;
  updateOnHeal: boolean;  // Auto-update JSON on successful healing
  locators: Record<string, LocatorConfigEntry>;
}

/**
 * Healing statistics and report
 */
export interface HealingReport {
  totalAttempts: number;
  successfulHealings: number;
  failedHealings: number;
  fragilePrimaries: Array<{
    locatorId: string;
    failureCount: number;
    healedCount: number;
    lastHealed?: string;
    suggestedUpdate?: Locator;
  }>;
  recommendations: string[];
  generatedAt: string;
}

/**
 * DOM element with attributes for analysis
 */
export interface DOMElementInfo {
  tag: string;
  attributes: Record<string, string>;
  text: string;
  xpath: string;  // XPath to this element
  css?: string;   // CSS selector if available
  visible: boolean;
  score?: number;  // Matching score
}

/**
 * Result from DOM scanning
 */
export interface DOMScanResult {
  totalElements: number;
  matchedElements: DOMElementInfo[];
  candidateLocators: CandidateLocator[];
  scanDurationMs: number;
}

/**
 * Error for self-healing failures
 */
export class SelfHealingError extends Error {
  constructor(
    message: string,
    public primaryLocator?: Locator,
    public attempts?: HealingAttempt[]
  ) {
    super(message);
    this.name = 'SelfHealingError';
  }
}
