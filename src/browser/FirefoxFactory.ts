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
export class FirefoxFactory extends BaseBrowserFactory<BrowserType.FIREFOX> {
  protected readonly browserName = BrowserType.FIREFOX;

  protected getHeadlessArg(): string {
    return FIREFOX_ARGS.HEADLESS;
  }

  protected getOptionsObject(config: BrowserConfig): firefox.Options {
    return new firefox.Options();
  }

  protected configureOptions(options: firefox.Options, config: BrowserConfig): void {
    // No Firefox-specific configuration needed beyond headless and custom args
  }

  protected createBuilderWithOptions(options: firefox.Options): Builder {
    return new Builder().forBrowser(this.browserName).setFirefoxOptions(options);
  }
}
