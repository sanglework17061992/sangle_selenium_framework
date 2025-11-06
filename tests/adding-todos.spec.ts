import { expectValue } from '../src/assertion/SanAssertion';
import { BaseTest } from './BaseTest';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

describe('Todo App - Adding Todos', () => {
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

  describe('Adding Todos', () => {
    it('should add a new todo item', async () => {
      await baseTest.todoPage.addTodo('Buy groceries');

      expectValue(await baseTest.todoPage.getTodoCount()).toBe(1);

      expectValue(await baseTest.todoPage.getTodoTexts()).toInclude('Buy groceries');
    });

    it('should add multiple todo items', async () => {
      await baseTest.todoPage.addTodo('Buy groceries');
      await baseTest.todoPage.addTodo('Walk the dog');
      await baseTest.todoPage.addTodo('Clean the house');

      expectValue(await baseTest.todoPage.getTodoCount()).toBe(3);

      const todoTexts = await baseTest.todoPage.getTodoTexts();
      expectValue(todoTexts.length).toBe(3);
      expectValue(todoTexts).toInclude('Buy groceries');
      expectValue(todoTexts).toInclude('Walk the dog');
      expectValue(todoTexts).toInclude('Clean the house');
    });

    it('should trim whitespace from todo text', async () => {
      await baseTest.todoPage.addTodo('  Buy groceries  ');

      expectValue(await baseTest.todoPage.getTodoTexts()).toInclude('Buy groceries');
    });
  });
});