import { describe, it, before } from 'mocha';
import DriverManager from '../src/driver/DriverManager';
import { configLoader } from '../src/config/ConfigLoader';
import { logger } from '../src/utils/Logger';

describe('SaniumTS Framework - Foundation', () => {
  before(() => {
    const logLevel = configLoader.getLogLevel();
    logger.setLevel(logLevel);
    logger.info(`Log level: ${logLevel}`);
  });

  describe('Browser Driver', () => {
    it('should initialize driver and navigate to base URL', async () => {
      const driver = await DriverManager.getConfiguredDriver();
      const baseUrl = configLoader.getBaseUrl();

      logger.info(`Navigating to: ${baseUrl}`);
      await driver.get(baseUrl);

      const title = await driver.getTitle();
      logger.info(`Page title: ${title}`);

      await driver.quit();
      logger.info('Driver closed');
    });
  });
});
