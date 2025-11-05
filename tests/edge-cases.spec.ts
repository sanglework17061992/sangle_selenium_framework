import { expect } from 'chai';
import { TodoPage } from '../src/pages/TodoPage';
import DriverManager from '../src/driver/DriverManager';
import { expectValue } from '../src/assertion/SanAssertion';
import { AllureTestHooks } from '../src/reporting/AllureTestHooks';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

describe('Todo App - Edge Cases', () => {
  let todoPage: TodoPage;
  let driver: any;

  before(async () => {
    if (isAllureReporter) {
      await AllureTestHooks.beforeAll();
    }
    driver = await DriverManager.getConfiguredDriver();
    if (isAllureReporter) {
      AllureTestHooks.setDriver(driver);
    }
    todoPage = new TodoPage(driver);
  });

  after(async () => {
    if (isAllureReporter) {
      await AllureTestHooks.afterAll();
    } else if (driver) {
      await driver.quit();
    }
  });

  beforeEach(async () => {
    await todoPage.open();
    if (isAllureReporter) {
      await AllureTestHooks.beforeEach();
    }
  });

  afterEach(async function() {
    if (isAllureReporter && this.currentTest?.state === 'failed') {
      await AllureTestHooks.onTestFailure(this.currentTest, this.currentTest?.err);
    }
    if (isAllureReporter) {
      await AllureTestHooks.afterEach();
    }
  });

  describe('Edge Cases', () => {
    it('should handle special characters in todo text', async () => {
      await todoPage.addTodo('Buy groceries: milk, bread & eggs!');

      await expectValue(
        () => todoPage.getTodoTexts(),
        (texts) => expect(texts).to.include('Buy groceries: milk, bread & eggs!'),
        'Expected todo with special characters to be added correctly'
      );
    });

    it('should handle very long todo text', async () => {
      const longText = 'A'.repeat(200);
      await todoPage.addTodo(longText);

      await expectValue(
        () => todoPage.getTodoTexts(),
        (texts) => expect(texts).to.include(longText),
        'Expected very long todo text to be handled correctly'
      );
    });

    it('should handle duplicate todo text', async () => {
      await todoPage.addTodo('Buy groceries');
      await todoPage.addTodo('Buy groceries');

      await expectValue(
        () => todoPage.getTodoCount(),
        (count) => expect(count).to.equal(2),
        'Expected duplicate todos to be allowed'
      );

      await expectValue(
        () => todoPage.getTodoTexts(),
        (texts) => expect(texts).to.have.members(['Buy groceries', 'Buy groceries']),
        'Expected duplicate todo texts to be preserved'
      );
    });
  });
});