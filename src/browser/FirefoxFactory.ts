import { Builder } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox.js';
import { BrowserType } from '@enums';
import type { BrowserConfig } from '@configTypes';
import { FIREFOX_ARGS } from '@config/Constants';
import { BaseBrowserFactory } from '@browser/BaseBrowserFactory';

/**
 * Firefox browser factory
 * Handles Firefox-specific configuration and driver creation
 * 
 * Features:
 * - Headless mode support
 * - Custom arguments support for advanced configurations
 */
export class FirefoxFactory extends BaseBrowserFactory {
  protected override getBrowserName(): string {
    return BrowserType.FIREFOX;
  }

  protected override configureDriverBuilder(config: BrowserConfig): Builder {
    const firefoxOptions = new firefox.Options();

    // Apply headless mode
    if (config.headless) {
      firefoxOptions.addArguments(FIREFOX_ARGS.HEADLESS);
    }

    // Add additional arguments
    if (config.args && config.args.length > 0) {
      firefoxOptions.addArguments(...config.args);
    }

    return new Builder().forBrowser(this.getBrowserName()).setFirefoxOptions(firefoxOptions);
  }
}
