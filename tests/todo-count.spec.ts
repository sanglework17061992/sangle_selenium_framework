import { expectValue } from '../src/assertion/SanAssertion';
import { TodoPage } from '../src/pages/TodoPage';
import DriverManager from '../src/driver/DriverManager';
import { BaseTest } from './BaseTest';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

describe('Todo App - Todo Count', () => {
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

  describe('Todo Count', () => {
    it('should display correct count for single todo', async () => {
      await baseTest.todoPage.addTodo('Buy groceries');

      expectValue(await baseTest.todoPage.getRemainingCount()).toBe(1);
    });

    it('should display correct count after completing todos', async () => {
      await baseTest.todoPage.addTodo('Buy groceries');
      await baseTest.todoPage.addTodo('Walk the dog');
      await baseTest.todoPage.toggleTodo('Buy groceries');

      expectValue(await baseTest.todoPage.getRemainingCount()).toBe(1);
    });

    it('should display correct count after deleting todos', async () => {
      await baseTest.todoPage.addTodo('Buy groceries');
      await baseTest.todoPage.addTodo('Walk the dog');
      await baseTest.todoPage.deleteTodo('Buy groceries');

      expectValue(await baseTest.todoPage.getRemainingCount()).toBe(1);
    });
  });
});