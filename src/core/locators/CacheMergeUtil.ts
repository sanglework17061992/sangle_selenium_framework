import fs from 'node:fs/promises';
import path from 'node:path';
import { logger } from '@utils/Logger';
import { LocatorCache, type LocatorScoreEntry } from '@core/locators/LocatorCache';

/**
 * CacheMergeUtil - Merges locator caches from parallel workers
 * 
 * After parallel test execution completes, each worker has recorded its learned locators.
 * This utility:
 * - Loads all worker caches
 * - Merges by combining scores intelligently
 * - Produces single master cache ordered by best performing locators
 * - Persists for next test run
 * 
 * Usage:
 * After tests: npm run cache:merge
 * Or programmatically:
 * const merger = new CacheMergeUtil('./.cache');
 * await merger.merge();
 */
export class CacheMergeUtil {
  private readonly cacheDir: string;

  constructor(cacheDir: string = './.locator-cache') {
    this.cacheDir = cacheDir;
  }

  /**
   * Merge all worker caches into master cache
   * @returns Summary of merge operation
   */
  async merge(): Promise<{ mergedElements: number; totalLocators: number }> {
    try {
      // Ensure cache directory exists
      await fs.mkdir(this.cacheDir, { recursive: true });

      // Find all worker cache files
      const files = await fs.readdir(this.cacheDir);
      const workerCaches = files.filter(f => /^cache-worker-\d+\.json$/.exec(f));

      if (workerCaches.length === 0) {
        logger.info('CacheMergeUtil: No worker caches found to merge');
        return { mergedElements: 0, totalLocators: 0 };
      }

      logger.info(`CacheMergeUtil: Found ${workerCaches.length} worker caches to merge`);

      // Load all caches
      const allCaches = await Promise.all(
        workerCaches.map(file => this.loadCache(path.join(this.cacheDir, file)))
      );

      // Merge caches
      const merged = this.mergeCaches(allCaches);

      // Save merged cache
      const masterPath = path.join(this.cacheDir, 'cache-master.json');
      await fs.writeFile(masterPath, JSON.stringify(merged, null, 2), 'utf-8');

      const totalLocators = Object.values(merged).reduce(
        (sum, entries) => sum + (entries as any[]).length,
        0
      );

      logger.info(
        `CacheMergeUtil: ✓ Merged ${Object.keys(merged).length} elements with ${totalLocators} total locators`
      );

      return { mergedElements: Object.keys(merged).length, totalLocators };

    } catch (error) {
      logger.error(`CacheMergeUtil: Failed to merge caches: ${error}`);
      throw error;
    }
  }

  /**
   * Load master cache (returns LocatorCache instance)
   */
  async loadMaster(): Promise<LocatorCache> {
    const cache = new LocatorCache('master');
    const masterPath = path.join(this.cacheDir, 'cache-master.json');

    try {
      const data = await fs.readFile(masterPath, 'utf-8');
      const json = JSON.parse(data);
      cache.fromJSON(json);
      logger.debug('CacheMergeUtil: Loaded master cache');
    } catch (error) {
      // Master cache not found (expected on first run)
      if (error instanceof Error) {
        logger.debug(`CacheMergeUtil: Master cache not found - ${error.message}`);
      } else {
        logger.debug('CacheMergeUtil: Master cache not found - first run or not merged yet');
      }
    }

    return cache;
  }

  /**
   * Clean up worker caches (after successful merge)
   */
  async cleanupWorkerCaches(): Promise<void> {
    try {
      const files = await fs.readdir(this.cacheDir);
      const pattern = /^cache-worker-\d+\.json$/;
      const workerFiles = files.filter(f => pattern.exec(f) !== null);

      for (const file of workerFiles) {
        await fs.unlink(path.join(this.cacheDir, file));
      }

      logger.info(`CacheMergeUtil: Cleaned up ${workerFiles.length} worker cache files`);
    } catch (error) {
      logger.warn(`CacheMergeUtil: Could not cleanup worker caches: ${error}`);
    }
  }

  // Private helpers

  private async loadCache(
    filePath: string
  ): Promise<Record<string, LocatorScoreEntry[]>> {
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      logger.warn(`CacheMergeUtil: Could not load cache from ${filePath}: ${error}`);
      return {};
    }
  }

  private mergeCaches(
    caches: Array<Record<string, LocatorScoreEntry[]>>
  ): Record<string, LocatorScoreEntry[]> {
    const merged: Record<string, LocatorScoreEntry[]> = {};

    for (const cache of caches) {
      for (const [elementId, entries] of Object.entries(cache)) {
        this.mergeElementLocators(merged, elementId, entries);
      }
    }

    // Sort each element's locators by score
    for (const entries of Object.values(merged)) {
      entries.sort((a, b) => b.score - a.score);
    }

    return merged;
  }

  private mergeElementLocators(
    merged: Record<string, LocatorScoreEntry[]>,
    elementId: string,
    entries: LocatorScoreEntry[]
  ): void {
    if (!merged[elementId]) {
      merged[elementId] = [];
    }

    for (const entry of entries) {
      const existingIndex = merged[elementId].findIndex(e =>
        this.locatorEquals(e.locator, entry.locator)
      );

      if (existingIndex >= 0) {
        this.mergeLocatorEntry(merged[elementId][existingIndex], entry);
      } else {
        merged[elementId].push(entry);
      }
    }
  }

  private mergeLocatorEntry(existing: LocatorScoreEntry, incoming: LocatorScoreEntry): void {
    existing.successCount += incoming.successCount;
    existing.failureCount += incoming.failureCount;
    existing.lastUsed = new Date(
      Math.max(
        new Date(existing.lastUsed).getTime(),
        new Date(incoming.lastUsed).getTime()
      )
    );

    // Recalculate score
    const total = existing.successCount + existing.failureCount;
    existing.score =
      total === 0 ? 0 : Math.round((existing.successCount / total) * 100);
  }

  private locatorEquals(a: any, b: any): boolean {
    return a.using === b.using && a.value === b.value;
  }
}

export default CacheMergeUtil;
