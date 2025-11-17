import { describe, it, before, after } from 'mocha';
import driverManager from '../src/driver/DriverManager';
import { configLoader } from '../src/config/ConfigLoader';
import { logger } from '../src/utils/Logger';

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
});
