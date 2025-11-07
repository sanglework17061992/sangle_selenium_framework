import { expect } from '../../src/assertion/SanAssertion';
import { createReporter } from '../../src/reporters';
import { TodoTest } from './TodoTest';

describe('Todo App - Deleting Todos', () => {
  const test = new TodoTest(createReporter());

  before(async () => {
    await test.setupDriver();
  });

  after(async () => {
    await test.teardownDriver();
  });

  beforeEach(async () => {
    await test.setupTest();
  });

  afterEach(async function() {
    await test.teardownTest(this);
  });

  describe('Deleting Todos', () => {
    beforeEach(async () => {
      await test.page.addTodo('Buy groceries');
      await test.page.addTodo('Walk the dog');
      await test.page.addTodo('Clean the house');
    });

    it('should delete a todo item', async () => {
      await test.page.deleteTodo('Walk the dog');

      expect(await test.page.getTodoCount()).toBe(2);

      const texts = await test.page.getTodoTexts();
      expect(texts).toNotInclude('Walk the dog');
      expect(texts).toHaveMembers(['Buy groceries', 'Clean the house']);
    });

    it('should clear completed todos', async () => {
      await test.page.toggleTodo('Walk the dog');
      await test.page.clearCompleted();

      expect(await test.page.getTodoCount()).toBe(2);

      const texts = await test.page.getTodoTexts();
      expect(texts).toNotInclude('Walk the dog');
      expect(texts).toHaveMembers(['Buy groceries', 'Clean the house']);
    });
  });
});