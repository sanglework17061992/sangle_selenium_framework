import { describe, it, before, after } from 'mocha';
import DriverManager, { DriverContext } from '../src/driver/DriverManager';
import { configLoader } from '../src/config/ConfigLoader';
import { logger } from '../src/utils/Logger';

describe('SaniumTS Framework - Foundation', () => {
  before(async () => {
    const logLevel = configLoader.getLogLevel();
    logger.setLevel(logLevel);
    logger.info(`Log level: ${logLevel}`);
    
    // Initialize driver once for all tests
    await DriverManager.getConfiguredDriver();
  });

  after(async () => {
    // Cleanup driver after all tests
    await DriverManager.quitDriver();
  });

  describe('Browser Driver', () => {
    it('should initialize driver and navigate to base URL', async () => {
      const driver = DriverContext.getDriver();
      const baseUrl = configLoader.getBaseUrl();

      logger.info(`Navigating to: ${baseUrl}`);
      await driver.get(baseUrl);

      const title = await driver.getTitle();
      logger.info(`Page title: ${title}`);
    });
  });
});
