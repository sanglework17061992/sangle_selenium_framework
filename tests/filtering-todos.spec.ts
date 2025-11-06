import { expectValue } from '../src/assertion/SanAssertion';
import { TodoPage } from '../src/pages/TodoPage';
import DriverManager from '../src/driver/DriverManager';
import { BaseTest } from './BaseTest';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

describe('Todo App - Filtering Todos', () => {
  const baseTest = new BaseTest();
  let driver: any;

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

  describe('Filtering Todos', () => {
    beforeEach(async () => {
      await baseTest.todoPage.addTodo('Buy groceries');
      await baseTest.todoPage.addTodo('Walk the dog');
      await baseTest.todoPage.addTodo('Clean the house');
      await baseTest.todoPage.toggleTodo('Walk the dog');
    });

    it('should show all todos by default', async () => {
      await baseTest.todoPage.filterAll();

      expectValue(await baseTest.todoPage.getTodoCount()).toBe(3);
    });

    it('should show only active todos', async () => {
      await baseTest.todoPage.filterActive();

      expectValue(await baseTest.todoPage.getTodoCount()).toBe(2);

      expectValue(await baseTest.todoPage.getTodoTexts()).toHaveMembers(['Buy groceries', 'Clean the house']);
    });

    it('should show only completed todos', async () => {
      await baseTest.todoPage.filterCompleted();

      expectValue(await baseTest.todoPage.getTodoCount()).toBe(1);

      expectValue(await baseTest.todoPage.getTodoTexts()).toHaveMembers(['Walk the dog']);
    });
  });
});