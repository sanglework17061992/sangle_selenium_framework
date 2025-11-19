/**
 * Time-related utility functions for the framework
 */
export class TimeUtils {
  /**
   * Sleep for a specified number of milliseconds
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Calculate remaining timeout from start time
   */
  static getRemainingTimeout(startTime: number, totalTimeout: number): number {
    const elapsed = Date.now() - startTime;
    return Math.max(0, totalTimeout - elapsed);
  }
}