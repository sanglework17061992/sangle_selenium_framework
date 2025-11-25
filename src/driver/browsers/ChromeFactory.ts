import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { BrowserType } from '@enums';
import type { BrowserConfig } from '@configTypes';
import { CHROME_ARGS, CHROME_CI } from '@config/Constants';
import { BaseBrowserFactory } from './BaseBrowserFactory';

/**
 * Chrome browser factory
 * Handles Chrome-specific configuration and driver creation
 * 
 * Features:
 * - Headless mode support
 * - No-sandbox configuration for CI environments
 * - Unique user profile directory in CI to prevent "profile already in use" errors
 * - Additional Chrome-specific arguments (GPU disable, crash reporter, etc.)
 * - Custom arguments support for advanced configurations
 */
export class ChromeFactory extends BaseBrowserFactory {
  protected getBrowserName(): string {
    return BrowserType.CHROME;
  }

  protected createBuilder(config: BrowserConfig): Builder {
    const chromeOptions = new chrome.Options();

    // Apply headless mode
    if (config.headless) {
      chromeOptions.addArguments(CHROME_ARGS.HEADLESS);
    }

    // Apply Chrome-specific no-sandbox
    if (config.noSandbox) {
      chromeOptions.addArguments(CHROME_ARGS.NO_SANDBOX, CHROME_ARGS.DISABLE_DEV_SHM);
    }

    const isCI = process.env.CI === 'true';

    // Add CI-specific stability flags
    if (isCI) {
      chromeOptions.addArguments(
        CHROME_ARGS.DISABLE_GPU,
        CHROME_ARGS.DISABLE_CRASH_REPORTER,
        CHROME_ARGS.NO_FIRST_RUN,
        CHROME_ARGS.NO_DEFAULT_BROWSER_CHECK
      );

      // Create unique Chrome user profile directory for CI to prevent conflicts
      const tmp = fs.mkdtempSync(path.join(os.tmpdir(), CHROME_CI.PROFILE_PREFIX));
      chromeOptions.addArguments(`--user-data-dir=${tmp}`);
      chromeOptions.addArguments(`--profile-directory=${CHROME_CI.PROFILE_DIRECTORY}`);
    }

    // Add additional arguments
    if (config.args && config.args.length > 0) {
      chromeOptions.addArguments(...config.args);
    }

    return new Builder()
      .forBrowser(this.getBrowserName())
      .setChromeOptions(chromeOptions);
  }
}
