import { expect } from 'chai';
import { TodoPage } from '../src/pages/TodoPage';
import DriverManager from '../src/driver/DriverManager';
import { AllureTestHooks } from '../src/reporting/AllureTestHooks';
import { BaseTest } from './BaseTest';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

describe('Todo App - Adding Todos', () => {
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

  describe('Adding Todos', () => {
    it('should add a new todo item', async () => {
      await baseTest.todoPage.addTodo('Buy groceries');

      expect(await baseTest.todoPage.getTodoCount()).to.equal(1);

      expect(await baseTest.todoPage.getTodoTexts()).to.include('Buy groceries');
    });

    it('should add multiple todo items', async () => {
      await baseTest.todoPage.addTodo('Buy groceries');
      await baseTest.todoPage.addTodo('Walk the dog');
      await baseTest.todoPage.addTodo('Clean the house');

      expect(await baseTest.todoPage.getTodoCount()).to.equal(3);

      expect(await baseTest.todoPage.getTodoTexts()).to.have.members(['Buy groceries', 'Walk the dog', 'Clean the house']);
    });

    it('should trim whitespace from todo text', async () => {
      await baseTest.todoPage.addTodo('  Buy groceries  ');

      expect(await baseTest.todoPage.getTodoTexts()).to.include('Buy groceries');
    });
  });
});