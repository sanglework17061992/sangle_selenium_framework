import { expect } from '../../src/assertion/SanAssertion';
import { createReporter } from '../../src/reporters';
import { TodoTest } from './TodoTest';

describe('Todo App - Edge Cases', () => {
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

  describe('Edge Cases', () => {
    it('should handle very long todo text', async () => {
      const longText = 'A'.repeat(200);
      await test.page.addTodo(longText);

      expect(await test.page.getTodoTexts()).toInclude(longText);
    });

    it('should handle duplicate todo text', async () => {
      await test.page.addTodo('Buy groceries');
      await test.page.addTodo('Buy groceries');

      expect(await test.page.getTodoCount()).toBe(2);

      expect(await test.page.getTodoTexts()).toHaveMembers(['Buy groceries', 'Buy groceries']);
    });
  });
});