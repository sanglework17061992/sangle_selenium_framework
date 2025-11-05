import { expect } from 'chai';
import { TodoPage } from '../src/pages/TodoPage';
import DriverManager from '../src/driver/DriverManager';
import { AllureTestHooks } from '../src/reporting/AllureTestHooks';
import { BaseTest } from './BaseTest';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

describe('Todo App - Completing Todos', () => {
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

  describe('Completing Todos', () => {
    beforeEach(async () => {
      await baseTest.todoPage.addTodo('Buy groceries');
      await baseTest.todoPage.addTodo('Walk the dog');
    });

    it('should mark a todo as completed', async () => {
      await baseTest.todoPage.toggleTodo('Buy groceries');
      
      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const isCompleted = await baseTest.todoPage.isTodoCompleted('Buy groceries');
      expect(isCompleted).to.be.true;
      
      const remainingCount = await baseTest.todoPage.getRemainingCount();
      expect(remainingCount).to.equal(1);
    });

    it('should mark a todo as incomplete', async () => {
      await baseTest.todoPage.toggleTodo('Buy groceries');
      await new Promise(resolve => setTimeout(resolve, 500));
      await baseTest.todoPage.toggleTodo('Buy groceries');
      
      // Wait for DOM to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const isCompleted = await baseTest.todoPage.isTodoCompleted('Buy groceries');
      expect(isCompleted).to.be.false;
      
      const remainingCount = await baseTest.todoPage.getRemainingCount();
      expect(remainingCount).to.equal(2);
    });

    it('should mark all todos as completed', async () => {
      await baseTest.todoPage.markAllAsCompleted();

      expect(await baseTest.todoPage.isTodoCompleted('Buy groceries')).to.be.true;

      expect(await baseTest.todoPage.isTodoCompleted('Walk the dog')).to.be.true;

      expect(await baseTest.todoPage.getRemainingCount()).to.equal(0);
    });
  });
});