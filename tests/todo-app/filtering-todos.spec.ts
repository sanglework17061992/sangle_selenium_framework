import { expect } from '../../src/assertion/SanAssertion';
import { createReporter } from '../../src/reporters';
import { TodoTest } from './TodoTest';

describe('Todo App - Filtering Todos', () => {
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

  describe('Filtering Todos', () => {
    beforeEach(async () => {
      await test.page.addTodo('Buy groceries');
      await test.page.addTodo('Walk the dog');
      await test.page.addTodo('Clean the house');
      await test.page.toggleTodo('Walk the dog');
    });

    it('should show all todos by default', async () => {
      await test.page.filterAll();

      expect(await test.page.getTodoCount()).toBe(3);
    });

    it('should show only active todos', async () => {
      await test.page.filterActive();

      expect(await test.page.getTodoCount()).toBe(2);

      expect(await test.page.getTodoTexts()).toHaveMembers(['Buy groceries', 'Clean the house']);
    });

    it('should show only completed todos', async () => {
      await test.page.filterCompleted();

      expect(await test.page.getTodoCount()).toBe(1);

      expect(await test.page.getTodoTexts()).toHaveMembers(['Walk the dog']);
    });
  });
});