import { expect } from 'chai';
import { TodoPage } from '../src/pages/TodoPage';
import DriverManager from '../src/driver/DriverManager';
import { expectValue } from '../src/assertion/SanAssertion';
import { AllureTestHooks } from '../src/reporting/AllureTestHooks';
import { BaseTest } from './BaseTest';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

describe('Todo App - Edge Cases', () => {
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

  describe('Edge Cases', () => {
    it('should handle special characters in todo text', async () => {
      await baseTest.todoPage.addTodo('Buy groceries: milk, bread & eggs!');

      await expectValue(
        () => baseTest.todoPage.getTodoTexts(),
        (texts) => expect(texts).to.include('Buy groceries: milk, bread & eggs!'),
        'Expected todo with special characters to be added correctly'
      );
    });

    it('should handle very long todo text', async () => {
      const longText = 'A'.repeat(200);
      await baseTest.todoPage.addTodo(longText);

      await expectValue(
        () => baseTest.todoPage.getTodoTexts(),
        (texts) => expect(texts).to.include(longText),
        'Expected very long todo text to be handled correctly'
      );
    });

    it('should handle duplicate todo text', async () => {
      await baseTest.todoPage.addTodo('Buy groceries');
      await baseTest.todoPage.addTodo('Buy groceries');

      await expectValue(
        () => baseTest.todoPage.getTodoCount(),
        (count) => expect(count).to.equal(2),
        'Expected duplicate todos to be allowed'
      );

      await expectValue(
        () => baseTest.todoPage.getTodoTexts(),
        (texts) => expect(texts).to.have.members(['Buy groceries', 'Buy groceries']),
        'Expected duplicate todo texts to be preserved'
      );
    });
  });
});