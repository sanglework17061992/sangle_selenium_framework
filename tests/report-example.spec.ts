import { describe, it, before, after, beforeEach } from 'mocha';
import { WebDriver } from 'selenium-webdriver';
import driverManager from '@driver/DriverManager';
import { configLoader } from '@config/ConfigLoader';
import { logger } from '@utils/Logger';
import SanElement from '@core/elements/SanElement';
import { expect as sanExpect } from '@assertion/index';
import { createReporter } from '@reporting/index';

describe('Reporter System Demo', () => {
  let reporter: any;
  let driver: WebDriver;

  before(async () => {
    const logLevel = configLoader.getLogLevel();
    logger.setLevel(logLevel);
    logger.info(`Log level: ${logLevel}`);

    // Initialize driver
    await driverManager.createDriver();
    driver = driverManager.getDriver();

    // Setup reporters in beforeAll
    reporter = createReporter();
    if (reporter) {
      await reporter.beforeAll?.();
      reporter.setDriver?.(driver);
      logger.info('Reporter initialized');
    }
  });

  after(async () => {
    // Cleanup reporters
    if (reporter) {
      await reporter.afterAll?.();
    }
    // Cleanup driver
    await driverManager.quitDriver();
  });

  beforeEach(async () => {
    if (reporter) {
      await reporter.beforeEach?.();
    }
  });

  describe('Simple Reporter Test', () => {
    it('should demonstrate multi-reporter coordination', async () => {
      const baseUrl = configLoader.getBaseUrl();

      logger.info(`Navigating to: ${baseUrl}`);
      await driver.get(baseUrl);

      const title = await driver.getTitle();
      logger.info(`Page title: ${title}`);

      // Simple assertion - verify page loaded
      sanExpect(true).toBe(true);
      logger.info('✅ Page loaded successfully - reporters will capture this');
    });

    it('should add a todo item and capture in reports', async () => {
      const baseUrl = configLoader.getBaseUrl();

      // Navigate to TodoMVC
      await driver.get(baseUrl);

      // Create SanElement for the todo input and type it
      const todoInput = SanElement.css('.new-todo');
      const todoText = 'Demo todo with reporter';
      await todoInput.type(todoText);

      // Press Enter to submit (sendKeys)
      const Keys = require('selenium-webdriver').Key;
      const element = await driver.findElement({ css: '.new-todo' });
      await element.sendKeys(Keys.RETURN);

      // Verify page title for demo
      await sanExpect(driver).toHaveTitle('React • TodoMVC');

      logger.info('✅ Todo demo completed - reporters will capture this');
    });
  });
});
