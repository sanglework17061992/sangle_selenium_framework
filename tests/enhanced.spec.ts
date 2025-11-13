import { describe, it, before, after } from 'mocha';
import { DriverManager } from '../src/driver/DriverManager';
import { ConfigLoader, configLoader } from '../src/config/ConfigLoader';
import { Logger, logger } from '../src/utils/Logger';
import { BrowserRegistry } from '../src/driver/BrowserRegistry';
import { ChromeFactory } from '../src/driver/BrowserFactory';

describe('Enhanced DriverManager Features', () => {
  let customDriverManager: DriverManager;

  before(async () => {
    // Create custom driver manager for parallel testing
    customDriverManager = new DriverManager(configLoader, logger);
    
    logger.info('Testing enhanced DriverManager features');
  });

  after(async () => {
    if (customDriverManager.hasDriver()) {
      await customDriverManager.quitDriver();
    }
  });

  describe('Instance-based Design', () => {
    it('should support multiple driver manager instances', async () => {
      const manager1 = new DriverManager(configLoader, logger);
      const manager2 = new DriverManager(configLoader, logger);
      
      // Both managers should be independent
      await manager1.createDriver();
      
      // manager2 should not have a driver yet
      if (manager2.hasDriver()) {
        throw new Error('Managers should be independent');
      }
      
      await manager1.quitDriver();
    });
  });

  describe('Fluent Configuration API', () => {
    it('should support fluent configuration builder', async () => {
      await customDriverManager.createDriverWithConfig(config => 
        config
          .headless(true)
          .args('--disable-gpu')
          .noSandbox(true)
      );

      const driver = customDriverManager.getDriver();
      const baseUrl = configLoader.getBaseUrl();
      
      await driver.get(baseUrl);
      const title = await driver.getTitle();
      
      logger.info(`Fluent config test - Page title: ${title}`);
      
      await customDriverManager.quitDriver();
    });
  });

  describe('Registry Management', () => {
    it('should show available browsers', () => {
      const browsers = customDriverManager.getAvailableBrowsers();
      
      if (browsers.length === 0) {
        throw new Error('Should have registered browsers');
      }
      
      logger.info(`Available browsers: ${browsers.join(', ')}`);
    });

    it('should support custom registry', () => {
      const customRegistry = new BrowserRegistry();
      customRegistry.register('custom-chrome', new ChromeFactory());
      
      const manager = new DriverManager(configLoader, logger, customRegistry);
      const browsers = manager.getAvailableBrowsers();
      
      if (!browsers.includes('custom-chrome')) {
        throw new Error('Custom browser should be registered');
      }
    });
  });
});