import { Builder, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BrowserType } from '../types/Enums';
import { configLoader } from '../config/ConfigLoader';
import { logger } from '../utils/Logger';
import { CHROME_ARGS, FIREFOX_ARGS } from '../config/Constants';

export interface DriverOptions {
  headless?: boolean;
  noSandbox?: boolean;
  args?: string[];
}

export interface BrowserFactory {
  createWebDriver(options?: DriverOptions): Promise<WebDriver>;
}

type BrowserOptions = chrome.Options | firefox.Options;

/**
 * Base factory to eliminate duplication across browser implementations
 */
abstract class BaseBrowserFactory implements BrowserFactory {
  protected abstract createOptions(): BrowserOptions;
  protected abstract getBrowserName(): string;
  protected abstract applyHeadlessMode(opts: BrowserOptions): void;
  protected abstract configureBuilder(builder: Builder, opts: BrowserOptions): Builder;

  /**
   * Merge config and runtime options
   */
  protected mergeOptions(config: { headless?: boolean; noSandbox?: boolean }, options?: DriverOptions) {
    return {
      headless: config.headless || options?.headless || false,
      noSandbox: config.noSandbox || options?.noSandbox || false,
      args: options?.args || []
    };
  }

  async createWebDriver(options?: DriverOptions): Promise<WebDriver> {
    const config = configLoader.getBrowserConfig();
    const opts = this.createOptions();
    const merged = this.mergeOptions(config, options);

    logger.debug(`Creating ${this.getBrowserName()} driver with headless=${merged.headless}`);

    // Apply headless mode
    if (merged.headless) {
      this.applyHeadlessMode(opts);
    }

    // Apply no-sandbox (Chrome-specific)
    if (merged.noSandbox && opts instanceof chrome.Options) {
      opts.addArguments(CHROME_ARGS.NO_SANDBOX, CHROME_ARGS.DISABLE_DEV_SHM);
    }

    // Add any additional args
    if (merged.args.length > 0) {
      opts.addArguments(...merged.args);
    }

    return this.configureBuilder(new Builder().forBrowser(this.getBrowserName()), opts).build();
  }
}

/**
 * Chrome browser factory
 */
export class ChromeFactory extends BaseBrowserFactory {
  protected createOptions(): chrome.Options {
    return new chrome.Options();
  }

  protected getBrowserName(): string {
    return BrowserType.CHROME;
  }

  protected applyHeadlessMode(opts: BrowserOptions): void {
    (opts as chrome.Options).addArguments(CHROME_ARGS.HEADLESS);
  }

  protected configureBuilder(builder: Builder, opts: BrowserOptions): Builder {
    return builder.setChromeOptions(opts as chrome.Options);
  }
}

/**
 * Firefox browser factory
 */
export class FirefoxFactory extends BaseBrowserFactory {
  protected createOptions(): firefox.Options {
    const opts = new firefox.Options();
    // Use OS-agnostic temporary profile to avoid profile lock issues
    const tempProfile = join(tmpdir(), `firefox-profile-${Date.now()}`);
    opts.addArguments(FIREFOX_ARGS.PROFILE, tempProfile);
    return opts;
  }

  protected getBrowserName(): string {
    return BrowserType.FIREFOX;
  }

  protected applyHeadlessMode(opts: BrowserOptions): void {
    (opts as firefox.Options).addArguments(FIREFOX_ARGS.HEADLESS);
  }

  protected configureBuilder(builder: Builder, opts: BrowserOptions): Builder {
    return builder.setFirefoxOptions(opts as firefox.Options);
  }
}
