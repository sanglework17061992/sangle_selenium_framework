import { expect } from 'chai';
import { TodoPage } from '../src/pages/TodoPage';
import DriverManager from '../src/driver/DriverManager';
import { AllureTestHooks } from '../src/reporting/AllureTestHooks';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

describe('Todo App - Completing Todos', () => {
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

  describe('Completing Todos', () => {
    beforeEach(async () => {
      await todoPage.addTodo('Buy groceries');
      await todoPage.addTodo('Walk the dog');
    });

    it('should mark a todo as completed', async () => {
      await todoPage.toggleTodo('Buy groceries');
      
      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const isCompleted = await todoPage.isTodoCompleted('Buy groceries');
      expect(isCompleted).to.be.true;
      
      const remainingCount = await todoPage.getRemainingCount();
      expect(remainingCount).to.equal(1);
    });

    it('should mark a todo as incomplete', async () => {
      await todoPage.toggleTodo('Buy groceries');
      await new Promise(resolve => setTimeout(resolve, 500));
      await todoPage.toggleTodo('Buy groceries');
      
      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const isCompleted = await todoPage.isTodoCompleted('Buy groceries');
      expect(isCompleted).to.be.false;
      
      const remainingCount = await todoPage.getRemainingCount();
      expect(remainingCount).to.equal(2);
    });

    it('should mark all todos as completed', async () => {
      await todoPage.markAllAsCompleted();

      expect(await todoPage.isTodoCompleted('Buy groceries')).to.be.true;

      expect(await todoPage.isTodoCompleted('Walk the dog')).to.be.true;

      expect(await todoPage.getRemainingCount()).to.equal(0);
    });
  });
});