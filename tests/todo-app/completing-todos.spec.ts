import { expectValue } from '../../src/assertion/SanAssertion';
import { createReporter } from '../../src/reporters';
import { TodoTest } from './TodoTest';

describe('Todo App - Completing Todos', () => {
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

  describe('Completing Todos', () => {
    beforeEach(async () => {
      await test.page.addTodo('Buy groceries');
      await test.page.addTodo('Walk the dog');
    });

    it('should mark a todo as completed', async () => {
      await test.page.toggleTodo('Buy groceries');
      
      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      expectValue(await test.page.isTodoCompleted('Buy groceries')).toBe(true);
      
      expectValue(await test.page.getRemainingCount()).toBe(1);
    });

    it('should mark a todo as incomplete', async () => {
      await test.page.toggleTodo('Buy groceries');
      await new Promise(resolve => setTimeout(resolve, 500));
      await test.page.toggleTodo('Buy groceries');
      
      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      expectValue(await test.page.isTodoCompleted('Buy groceries')).toBe(false);
      
      expectValue(await test.page.getRemainingCount()).toBe(2);
    });

    it('should mark all todos as completed', async () => {
      await test.page.markAllAsCompleted();

      expectValue(await test.page.isTodoCompleted('Buy groceries')).toBe(true);

      expectValue(await test.page.isTodoCompleted('Walk the dog')).toBe(true);

      expectValue(await test.page.getRemainingCount()).toBe(0);
    });
  });
});