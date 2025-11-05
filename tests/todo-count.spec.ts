import { expect } from 'chai';
import { TodoPage } from '../src/pages/TodoPage';
import DriverManager from '../src/driver/DriverManager';
import { expectValue } from '../src/assertion/SanAssertion';
import { AllureTestHooks } from '../src/reporting/AllureTestHooks';
import { BaseTest } from './BaseTest';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

describe('Todo App - Todo Count', () => {
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

  describe('Todo Count', () => {
    it('should display correct count for single todo', async () => {
      await baseTest.todoPage.addTodo('Buy groceries');

      await expectValue(
        () => baseTest.todoPage.getRemainingCount(),
        (count) => expect(count).to.equal(1),
        'Expected remaining count to be 1 for single todo'
      );
    });

    it('should display correct count after completing todos', async () => {
      await baseTest.todoPage.addTodo('Buy groceries');
      await baseTest.todoPage.addTodo('Walk the dog');
      await baseTest.todoPage.toggleTodo('Buy groceries');

      await expectValue(
        () => baseTest.todoPage.getRemainingCount(),
        (count) => expect(count).to.equal(1),
        'Expected remaining count to be 1 after completing one todo'
      );
    });

    it('should display correct count after deleting todos', async () => {
      await baseTest.todoPage.addTodo('Buy groceries');
      await baseTest.todoPage.addTodo('Walk the dog');
      await baseTest.todoPage.deleteTodo('Buy groceries');

      await expectValue(
        () => baseTest.todoPage.getRemainingCount(),
        (count) => expect(count).to.equal(1),
        'Expected remaining count to be 1 after deleting one todo'
      );
    });
  });
});