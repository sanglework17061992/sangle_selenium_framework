import { expect } from 'chai';
import { TodoPage } from '../src/pages/TodoPage';
import DriverManager from '../src/driver/DriverManager';
import { expectValue } from '../src/assertion/SanAssertion';
import { AllureTestHooks } from '../src/reporting/AllureTestHooks';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

describe('Todo App - Filtering Todos', () => {
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

  describe('Filtering Todos', () => {
    beforeEach(async () => {
      await todoPage.addTodo('Buy groceries');
      await todoPage.addTodo('Walk the dog');
      await todoPage.addTodo('Clean the house');
      await todoPage.toggleTodo('Walk the dog');
    });

    it('should show all todos by default', async () => {
      await todoPage.filterAll();

      await expectValue(
        () => todoPage.getTodoCount(),
        (count) => expect(count).to.equal(3),
        'Expected to show all 3 todos when filtered to all'
      );
    });

    it('should show only active todos', async () => {
      await todoPage.filterActive();

      await expectValue(
        () => todoPage.getTodoCount(),
        (count) => expect(count).to.equal(2),
        'Expected to show 2 active todos'
      );

      await expectValue(
        () => todoPage.getTodoTexts(),
        (texts) => expect(texts).to.have.members(['Buy groceries', 'Clean the house']),
        'Expected to show only active todo texts'
      );
    });

    it('should show only completed todos', async () => {
      await todoPage.filterCompleted();

      await expectValue(
        () => todoPage.getTodoCount(),
        (count) => expect(count).to.equal(1),
        'Expected to show 1 completed todo'
      );

      await expectValue(
        () => todoPage.getTodoTexts(),
        (texts) => expect(texts).to.have.members(['Walk the dog']),
        'Expected to show only completed todo text'
      );
    });
  });
});