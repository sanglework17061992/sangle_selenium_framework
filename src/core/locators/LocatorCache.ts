import { logger } from '@utils/Logger';
import type { Locator } from '@core/elements/SanElement';

/**
 * Locator Score Entry - Tracks reliability of a locator
 */
export interface LocatorScoreEntry {
  locator: Locator;
  score: number;           // 0-100: success rate percentage
  successCount: number;    // Times successfully found element
  failureCount: number;    // Times failed to find element
  lastUsed: Date;
  discoveredAt: Date;
}

/**
 * LocatorCache - In-memory cache for learned locators with scoring
 * 
 * Features:
 * - Tracks locator success/failure rates
 * - Auto-learns best locators during test execution
 * - Ordered by reliability score (highest first)
 * - Supports parallel workers (in-memory, merged post-run)
 * - Per-worker isolation (each worker has own cache)
 * 
 * Usage:
 * const cache = new LocatorCache();
 * await cache.recordSuccess('login-button', cssLocator);
 * const locators = cache.getByScore('login-button');  // Sorted by score
 * await cache.flush('worker-1');  // Save to disk after test
 */
export class LocatorCache {
  private readonly cache = new Map<string, LocatorScoreEntry[]>();
  private readonly workerName: string;

  constructor(workerName: string = 'default') {
    this.workerName = workerName;
    logger.debug(`LocatorCache initialized for worker: ${workerName}`);
  }

  /**
   * Record successful locator discovery
   * Updates or adds locator with success score increment
   */
  recordSuccess(elementId: string, locator: Locator): void {
    const key = this.normalizeKey(elementId);
    const entries = this.cache.get(key) || [];
    
    const existingIdx = entries.findIndex(e => this.locatorEquals(e.locator, locator));
    
    if (existingIdx >= 0) {
      // Update existing
      entries[existingIdx].successCount++;
      entries[existingIdx].lastUsed = new Date();
    } else {
      // Add new
      entries.push({
        locator,
        score: 100,  // Start with perfect score
        successCount: 1,
        failureCount: 0,
        lastUsed: new Date(),
        discoveredAt: new Date()
      });
    }
    
    this.updateScore(entries, existingIdx >= 0 ? existingIdx : entries.length - 1);
    this.cache.set(key, entries);
    
    logger.debug(`LocatorCache: Recorded success for ${key}`);
  }

  /**
   * Record failed locator attempt
   * Updates failure count and recalculates score
   */
  recordFailure(elementId: string, locator: Locator): void {
    const key = this.normalizeKey(elementId);
    const entries = this.cache.get(key) || [];
    
    const existingIdx = entries.findIndex(e => this.locatorEquals(e.locator, locator));
    
    if (existingIdx >= 0) {
      entries[existingIdx].failureCount++;
      this.updateScore(entries, existingIdx);
      this.cache.set(key, entries);
      
      logger.debug(`LocatorCache: Recorded failure for ${key}`);
    }
  }

  /**
   * Get all locators for element, ordered by score (highest first)
   */
  getByScore(elementId: string): Locator[] {
    const key = this.normalizeKey(elementId);
    const entries = this.cache.get(key) || [];
    
    // Sort by score descending (best first)
    const sorted = [...entries].sort((a: LocatorScoreEntry, b: LocatorScoreEntry) => b.score - a.score);
    return sorted.map((e: LocatorScoreEntry) => e.locator);
  }

  /**
   * Get detailed scores (for debugging/analytics)
   */
  getScores(elementId: string): LocatorScoreEntry[] {
    const key = this.normalizeKey(elementId);
    const entries = this.cache.get(key) || [];
    
    const sorted = [...entries].sort((a: LocatorScoreEntry, b: LocatorScoreEntry) => b.score - a.score);
    return sorted.map((e: LocatorScoreEntry) => ({ ...e }));  // Return copy
  }

  /**
   * Clear all cached locators
   */
  clear(): void {
    this.cache.clear();
    logger.debug('LocatorCache cleared');
  }

  /**
   * Get cache size (for testing)
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Convert cache to JSON for saving
   */
  toJSON(): Record<string, LocatorScoreEntry[]> {
    const result: Record<string, LocatorScoreEntry[]> = {};
    
    for (const [key, entries] of this.cache.entries()) {
      result[key] = entries.map(e => ({
        ...e,
        lastUsed: e.lastUsed.toISOString(),
        discoveredAt: e.discoveredAt.toISOString()
      })) as any;
    }
    
    return result;
  }

  /**
   * Load cache from JSON
   */
  fromJSON(data: Record<string, any>): void {
    this.cache.clear();
    
    for (const [key, entries] of Object.entries(data)) {
      const parsed = (entries as any[]).map(e => ({
        ...e,
        lastUsed: new Date(e.lastUsed),
        discoveredAt: new Date(e.discoveredAt)
      }));
      
      this.cache.set(key, parsed);
    }
    
    logger.debug(`LocatorCache loaded ${this.cache.size} element entries`);
  }

  // Private helpers

  private normalizeKey(elementId: string): string {
    return elementId.toLowerCase().trim();
  }

  private locatorEquals(a: Locator, b: Locator): boolean {
    return a.using === b.using && a.value === b.value;
  }

  private updateScore(entries: LocatorScoreEntry[], index: number): void {
    const entry = entries[index];
    const total = entry.successCount + entry.failureCount;
    
    if (total === 0) {
      entry.score = 0;
    } else {
      entry.score = Math.round((entry.successCount / total) * 100);
    }
  }
}

export default LocatorCache;
