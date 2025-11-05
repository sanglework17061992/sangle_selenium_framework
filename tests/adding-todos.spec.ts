import { expect } from 'chai';
import { TodoPage } from '../src/pages/TodoPage';
import DriverManager from '../src/driver/DriverManager';
import { AllureTestHooks } from '../src/reporting/AllureTestHooks';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

describe('Todo App - Adding Todos', () => {
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

  describe('Adding Todos', () => {
    it('should add a new todo item', async () => {
      await todoPage.addTodo('Buy groceries');

      expect(await todoPage.getTodoCount()).to.equal(1);

      expect(await todoPage.getTodoTexts()).to.include('Buy groceries');
    });

    it('should add multiple todo items', async () => {
      await todoPage.addTodo('Buy groceries');
      await todoPage.addTodo('Walk the dog');
      await todoPage.addTodo('Clean the house');

      expect(await todoPage.getTodoCount()).to.equal(3);

      expect(await todoPage.getTodoTexts()).to.have.members(['Buy groceries', 'Walk the dog', 'Clean the house']);
    });

    it('should trim whitespace from todo text', async () => {
      await todoPage.addTodo('  Buy groceries  ');

      expect(await todoPage.getTodoTexts()).to.include('Buy groceries');
    });
  });
});