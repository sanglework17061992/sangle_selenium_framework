import { expectValue } from '../../src/assertion/SanAssertion';
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

      expectValue(await test.page.getTodoCount()).toBe(1);

      expectValue(await test.page.getTodoTexts()).toInclude('Buy groceries');
    });

    it('should add multiple todo items', async () => {
      await test.page.addTodo('Buy groceries');
      await test.page.addTodo('Walk the dog');
      await test.page.addTodo('Clean the house');

      expectValue(await test.page.getTodoCount()).toBe(3);

      const todoTexts = await test.page.getTodoTexts();
      expectValue(todoTexts.length).toBe(3);
      expectValue(todoTexts).toInclude('Buy groceries');
      expectValue(todoTexts).toInclude('Walk the dog');
      expectValue(todoTexts).toInclude('Clean the house');
    });

    it('should trim whitespace from todo text', async () => {
      await test.page.addTodo('  Buy groceries  ');

      expectValue(await test.page.getTodoTexts()).toInclude('Buy groceries');
    });
  });
});