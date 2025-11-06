import { expectValue } from '../src/assertion/SanAssertion';
import { BaseTest } from './BaseTest';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

describe('Todo App - Deleting Todos', () => {
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

  describe('Deleting Todos', () => {
    beforeEach(async () => {
      await baseTest.todoPage.addTodo('Buy groceries');
      await baseTest.todoPage.addTodo('Walk the dog');
      await baseTest.todoPage.addTodo('Clean the house');
    });

    it('should delete a todo item', async () => {
      await baseTest.todoPage.deleteTodo('Walk the dog');

      expectValue(await baseTest.todoPage.getTodoCount()).toBe(2);

      const texts = await baseTest.todoPage.getTodoTexts();
      expectValue(texts).toNotInclude('Walk the dog');
      expectValue(texts).toHaveMembers(['Buy groceries', 'Clean the house']);
    });

    it('should clear completed todos', async () => {
      await baseTest.todoPage.toggleTodo('Walk the dog');
      await baseTest.todoPage.clearCompleted();

      expectValue(await baseTest.todoPage.getTodoCount()).toBe(2);

      const texts = await baseTest.todoPage.getTodoTexts();
      expectValue(texts).toNotInclude('Walk the dog');
      expectValue(texts).toHaveMembers(['Buy groceries', 'Clean the house']);
    });
  });
});