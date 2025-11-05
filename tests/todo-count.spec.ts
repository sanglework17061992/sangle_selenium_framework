import { expect } from 'chai';
import { TodoPage } from '../src/pages/TodoPage';
import DriverManager from '../src/driver/DriverManager';
import { expectValue } from '../src/assertion/SanAssertion';
import { AllureTestHooks } from '../src/reporting/AllureTestHooks';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

describe('Todo App - Todo Count', () => {
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

  describe('Todo Count', () => {
    it('should display correct count for single todo', async () => {
      await todoPage.addTodo('Buy groceries');

      await expectValue(
        () => todoPage.getRemainingCount(),
        (count) => expect(count).to.equal(1),
        'Expected remaining count to be 1 for single todo'
      );
    });

    it('should display correct count after completing todos', async () => {
      await todoPage.addTodo('Buy groceries');
      await todoPage.addTodo('Walk the dog');
      await todoPage.toggleTodo('Buy groceries');

      await expectValue(
        () => todoPage.getRemainingCount(),
        (count) => expect(count).to.equal(1),
        'Expected remaining count to be 1 after completing one todo'
      );
    });

    it('should display correct count after deleting todos', async () => {
      await todoPage.addTodo('Buy groceries');
      await todoPage.addTodo('Walk the dog');
      await todoPage.deleteTodo('Buy groceries');

      await expectValue(
        () => todoPage.getRemainingCount(),
        (count) => expect(count).to.equal(1),
        'Expected remaining count to be 1 after deleting one todo'
      );
    });
  });
});