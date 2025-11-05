import { expect } from 'chai';
import { TodoPage } from '../src/pages/TodoPage';
import DriverManager from '../src/driver/DriverManager';
import { AllureTestHooks } from '../src/reporting/AllureTestHooks';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

describe('Todo App - Deleting Todos', () => {
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

  describe('Deleting Todos', () => {
    beforeEach(async () => {
      await todoPage.addTodo('Buy groceries');
      await todoPage.addTodo('Walk the dog');
      await todoPage.addTodo('Clean the house');
    });

    it('should delete a todo item', async () => {
      await todoPage.deleteTodo('Walk the dog');

      expect(await todoPage.getTodoCount()).to.equal(2);

      const texts = await todoPage.getTodoTexts();
      expect(texts).to.not.include('Walk the dog');
      expect(texts).to.have.members(['Buy groceries', 'Clean the house']);
    });

    it('should clear completed todos', async () => {
      await todoPage.toggleTodo('Walk the dog');
      await todoPage.clearCompleted();

      expect(await todoPage.getTodoCount()).to.equal(2);

      const texts = await todoPage.getTodoTexts();
      expect(texts).to.not.include('Walk the dog');
      expect(texts).to.have.members(['Buy groceries', 'Clean the house']);
    });
  });
});