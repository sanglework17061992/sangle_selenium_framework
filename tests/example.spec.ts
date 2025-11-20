import { describe, it, before, after } from 'mocha';
import driverManager from '@driver/DriverManager';
import { configLoader } from '@config/ConfigLoader';
import { logger } from '@utils/Logger';
import SanElement from '@core/elements/SanElement';

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
});
