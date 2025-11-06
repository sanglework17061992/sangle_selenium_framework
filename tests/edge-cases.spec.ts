import { expectValue } from '../src/assertion/SanAssertion';
import { TodoPage } from '../src/pages/TodoPage';
import DriverManager from '../src/driver/DriverManager';
import { BaseTest } from './BaseTest';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

describe('Todo App - Edge Cases', () => {
  const baseTest = new BaseTest();

  before(async () => {
    await baseTest.setupDriver();
  });

  after(async () => {
    await baseTest.teardownDriver();
  });

  beforeEach(async () => {
    await baseTest.setupTest();
  });

  afterEach(async function() {
    await baseTest.teardownTest(this);
  });

  describe('Edge Cases', () => {
    it('should handle special characters in todo text', async () => {
      await baseTest.todoPage.addTodo('Buy groceries: milk, bread & eggs!');

      expectValue(await baseTest.todoPage.getTodoTexts()).toInclude('Buy groceries: milk, bread & eggs!');
    });

    it('should handle very long todo text', async () => {
      const longText = 'A'.repeat(200);
      await baseTest.todoPage.addTodo(longText);

      expectValue(await baseTest.todoPage.getTodoTexts()).toInclude(longText);
    });

    it('should handle duplicate todo text', async () => {
      await baseTest.todoPage.addTodo('Buy groceries');
      await baseTest.todoPage.addTodo('Buy groceries');

      expectValue(await baseTest.todoPage.getTodoCount()).toBe(2);

      expectValue(await baseTest.todoPage.getTodoTexts()).toHaveMembers(['Buy groceries', 'Buy groceries']);
    });
  });
});