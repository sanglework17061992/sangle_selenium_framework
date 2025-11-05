import { expect } from 'chai';
import { TodoPage } from '../src/pages/TodoPage';
import DriverManager from '../src/driver/DriverManager';
import { expectValue } from '../src/assertion/SanAssertion';
import { AllureTestHooks } from '../src/reporting/AllureTestHooks';
import { BaseTest } from './BaseTest';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

describe('Todo App - Filtering Todos', () => {
  const baseTest = new BaseTest();
  let driver: any;

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

  describe('Filtering Todos', () => {
    beforeEach(async () => {
      await baseTest.todoPage.addTodo('Buy groceries');
      await baseTest.todoPage.addTodo('Walk the dog');
      await baseTest.todoPage.addTodo('Clean the house');
      await baseTest.todoPage.toggleTodo('Walk the dog');
    });

    it('should show all todos by default', async () => {
      await baseTest.todoPage.filterAll();

      await expectValue(
        () => baseTest.todoPage.getTodoCount(),
        (count) => expect(count).to.equal(3),
        'Expected to show all 3 todos when filtered to all'
      );
    });

    it('should show only active todos', async () => {
      await baseTest.todoPage.filterActive();

      await expectValue(
        () => baseTest.todoPage.getTodoCount(),
        (count) => expect(count).to.equal(2),
        'Expected to show 2 active todos'
      );

      await expectValue(
        () => baseTest.todoPage.getTodoTexts(),
        (texts) => expect(texts).to.have.members(['Buy groceries', 'Clean the house']),
        'Expected to show only active todo texts'
      );
    });

    it('should show only completed todos', async () => {
      await baseTest.todoPage.filterCompleted();

      await expectValue(
        () => baseTest.todoPage.getTodoCount(),
        (count) => expect(count).to.equal(1),
        'Expected to show 1 completed todo'
      );

      await expectValue(
        () => baseTest.todoPage.getTodoTexts(),
        (texts) => expect(texts).to.have.members(['Walk the dog']),
        'Expected to show only completed todo text'
      );
    });
  });
});