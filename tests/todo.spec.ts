import { describe, it, before, beforeEach, after } from 'mocha';
import { configLoader } from '@config/ConfigLoader';
import { logger } from '@utils/Logger';
import { expect as sanExpect } from '@assertion/index';
import { BaseTest } from '@tests/BaseTest';
import { TodoPage } from '@pages/TodoPage';

/**
 * TodoTest - Demonstrates BasePage, BaseTest, TodoPage, and SanAssertion framework
 */
class TodoTest extends BaseTest<TodoPage> {
  protected createPage(): TodoPage {
    return new TodoPage();
  }
}

describe('TodoMVC App - Page Object Pattern & Assertions', () => {
  const test = new TodoTest();
  let todoPage: TodoPage;
  let baseUrl: string;

  before(async () => {
    // BaseTest handles driver initialization and page object creation
    await test.setupDriver();
    todoPage = test.page;
    baseUrl = configLoader.getBaseUrl();
  });

  beforeEach(async () => {
    // Open TodoMVC app before each test
    await todoPage.open(baseUrl);
  });

  after(async () => {
    // BaseTest handles driver cleanup
    await test.teardownDriver();
  });

  describe('Add Todo Item', () => {
    it('should add multiple todo items and verify with assertions', async () => {
      const todos = ['Learn SaniumTS Framework', 'Build page objects', 'Write tests'];
      
      for (const todoText of todos) {
        logger.info(`Adding todo: ${todoText}`);
        await todoPage.addTodo(todoText);
      }

      logger.info('Verifying todo input is visible');
      await sanExpect(todoPage.newTodoInput).toBeVisible();

      logger.info('Verifying page title with auto-retry');
      await sanExpect(todoPage).toHaveTitle('React • TodoMVC');
    });
  });

  describe('Page Assertions', () => {
    it('should demonstrate page object methods and assertions', async () => {
      logger.info('Adding todo via TodoPage');
      await todoPage.addTodo('Test item');

      logger.info('Verifying todo input is visible');
      await sanExpect(todoPage.newTodoInput).toBeVisible();

      logger.info('Verifying page title is correct');
      await sanExpect(todoPage).toHaveTitle('React • TodoMVC');
    });

    it('should verify page URL with toHaveURLContaining assertion', async () => {
      logger.info('Verifying page URL contains todomvc');
      await sanExpect(todoPage).toHaveURLContaining('todomvc');
    });
  });
});
