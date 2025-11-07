import { expect } from '../../src/assertion/SanAssertion';
import { createReporter } from '../../src/reporters';
import { TodoTest } from './TodoTest';

describe('Todo App - Todo Count', () => {
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

  describe('Todo Count', () => {
    it('should display correct count for single todo', async () => {
      await test.page.addTodo('Buy groceries');

      expect(await test.page.getRemainingCount()).toBe(1);
    });

    it('should display correct count after completing todos', async () => {
      await test.page.addTodo('Buy groceries');
      await test.page.addTodo('Walk the dog');
      await test.page.toggleTodo('Buy groceries');

      expect(await test.page.getRemainingCount()).toBe(1);
    });

    it('should display correct count after deleting todos', async () => {
      await test.page.addTodo('Buy groceries');
      await test.page.addTodo('Walk the dog');
      await test.page.deleteTodo('Buy groceries');

      expect(await test.page.getRemainingCount()).toBe(1);
    });
  });
});