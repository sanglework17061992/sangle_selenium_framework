import { expect } from '../../src/assertion/SanAssertion';
import { createReporter } from '../../src/reporters';
import { TodoTest } from './TodoTest';

describe('Todo App - Adding Todos', () => {
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

  describe('Adding Todos', () => {
    it('should add a new todo item', async () => {
      await test.page.addTodo('Buy groceries');

      expect(await test.page.getTodoCount()).toBe(1);

      expect(await test.page.getTodoTexts()).toInclude('Buy groceries');
    });

    it('should add multiple todo items', async () => {
      await test.page.addTodo('Buy groceries');
      await test.page.addTodo('Walk the dog');
      await test.page.addTodo('Clean the house');

      expect(await test.page.getTodoCount()).toBe(3);

      const todoTexts = await test.page.getTodoTexts();
      expect(todoTexts.length).toBe(3);
      expect(todoTexts).toInclude('Buy groceries');
      expect(todoTexts).toInclude('Walk the dog');
      expect(todoTexts).toInclude('Clean the house');
    });

    it('should trim whitespace from todo text', async () => {
      await test.page.addTodo('  Buy groceries  ');

      expect(await test.page.getTodoTexts()).toInclude('Buy groceries');
    });
  });
});