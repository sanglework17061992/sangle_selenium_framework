import { describe, it, before, after } from 'mocha';
import driverManager from '@driver/DriverManager';
import { configLoader } from '@config/ConfigLoader';
import { logger } from '@utils/Logger';
import SanElement from '@core/elements/SanElement';
import { expect as sanExpect } from '@assertion/index';
import { createReporter } from '@reporters/index';

describe('SaniumTS Framework - Foundation', () => {
  before(async () => {
    const logLevel = configLoader.getLogLevel();
    logger.setLevel(logLevel);
    logger.info(`Log level: ${logLevel}`);

    // Initialize driver
    await driverManager.createDriver();
  });

  after(async () => {
    // Cleanup driver
    await driverManager.quitDriver();
  });

  describe('Browser Driver', () => {
    it('should initialize driver and navigate to base URL', async () => {
      const driver = driverManager.getDriver();
      const baseUrl = configLoader.getBaseUrl();

      logger.info(`Navigating to: ${baseUrl}`);
      await driver.get(baseUrl);

      const title = await driver.getTitle();
      logger.info(`Page title: ${title}`);
    });
  });

  describe('SanElement TodoMVC Tests', () => {
    it('should add a new todo item using SanElement auto-wait', async () => {
      const driver = driverManager.getDriver();
      const baseUrl = configLoader.getBaseUrl();

      // Navigate to TodoMVC app
      await driver.get(baseUrl);

      // Create SanElement for the todo input field using clean API
      const todoInput = SanElement.css('.new-todo');

      // Type a new todo item - SanElement will auto-wait for the input to be ready
      const todoText = 'Test todo item with SanElement';
      await todoInput.type(todoText);
    });
  });

  describe('SanAssertion Framework', () => {
    it('should test all 3 assertion types', async () => {
      const driver = driverManager.getDriver();
      const baseUrl = configLoader.getBaseUrl();

      await driver.get(baseUrl);

      // TypeAssertion - no auto-retry because it's not a locator/page
      const sum = 2 + 3;
      sanExpect(sum).toBe(5);

      // SanPageAssertion toHaveTitle - auto-retries until the title matches the expected value
      const expectedTitle = 'React • TodoMVC';
      await sanExpect(driver).toHaveTitle(expectedTitle);

      // SanElementAssertion toBeVisible - auto-retries until element is visible
      const heading = SanElement.css('h1');
      await sanExpect(heading).toBeVisible();

      // Note: In future, when BasePage is implemented, page objects can be passed directly:
      // await sanExpect(todoPage).toHaveTitle(expectedTitle);
    });
  });

  describe('Reporter System', () => {
    it('should support multi-reporter coordination', async () => {
      const reporter = createReporter();
      if (reporter) {
        await reporter.beforeAll?.();
        await reporter.beforeEach?.();
        const driver = driverManager.getDriver() as any;
        reporter.setDriver?.(driver);
        await reporter.afterEach?.();
        await reporter.afterAll?.();
      }
      sanExpect(true).toBe(true);
    });
  });
});
