import { expect } from 'chai';
import { TodoPage } from '../src/pages/TodoPage';
import DriverManager from '../src/driver/DriverManager';
import { expectValue } from '../src/assertion/SanAssertion';
import { AllureTestHooks } from '../src/reporting/AllureTestHooks';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

describe('Todo App Tests', () => {
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

      await expectValue(
        () => todoPage.getTodoCount(),
        (count) => expect(count).to.equal(1),
        'Expected todo count to be 1'
      );

      await expectValue(
        () => todoPage.getTodoTexts(),
        (texts) => expect(texts).to.include('Buy groceries'),
        'Expected todo texts to include "Buy groceries"'
      );
    });

    it('should add multiple todo items', async () => {
      await todoPage.addTodo('Buy groceries');
      await todoPage.addTodo('Walk the dog');
      await todoPage.addTodo('Clean the house');

      await expectValue(
        () => todoPage.getTodoCount(),
        (count) => expect(count).to.equal(3),
        'Expected todo count to be 3'
      );

      await expectValue(
        () => todoPage.getTodoTexts(),
        (texts) => expect(texts).to.have.members(['Buy groceries', 'Walk the dog', 'Clean the house']),
        'Expected todo texts to have all three items'
      );
    });

    it('should not add empty todos', async () => {
      await todoPage.addTodo('');
      
      // Small delay to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 500));

      await expectValue(
        () => todoPage.getTodoCount(),
        (count) => expect(count).to.equal(0),
        'Expected todo count to remain 0 for empty input'
      );
    });

    it('should trim whitespace from todo text', async () => {
      await todoPage.addTodo('  Buy groceries  ');

      await expectValue(
        () => todoPage.getTodoTexts(),
        (texts) => expect(texts).to.include('Buy groceries'),
        'Expected whitespace to be trimmed from todo text'
      );
    });
  });

  describe('Completing Todos', () => {
    beforeEach(async () => {
      await todoPage.addTodo('Buy groceries');
      await todoPage.addTodo('Walk the dog');
    });

    it('should mark a todo as completed', async () => {
      await todoPage.addTodo('Buy groceries');
      await todoPage.toggleTodo('Buy groceries');

      await expectValue(
        () => todoPage.isTodoCompleted('Buy groceries'),
        (isCompleted) => expect(isCompleted).to.be.true,
        'Expected todo to be marked as completed'
      );

      await expectValue(
        () => todoPage.getRemainingCount(),
        (count) => expect(count).to.equal(2),
        'Expected remaining count to be 2'
      );
    });

    it('should mark a todo as incomplete', async () => {
      await todoPage.addTodo('Buy groceries');
      await todoPage.toggleTodo('Buy groceries');
      await todoPage.toggleTodo('Buy groceries');

      await expectValue(
        () => todoPage.isTodoCompleted('Buy groceries'),
        (isCompleted) => expect(isCompleted).to.be.false,
        'Expected todo to be marked as incomplete'
      );

      await expectValue(
        () => todoPage.getRemainingCount(),
        (count) => expect(count).to.equal(3),
        'Expected remaining count to be 3'
      );
    });

    it('should mark all todos as completed', async () => {
      await todoPage.markAllAsCompleted();

      await expectValue(
        () => todoPage.isTodoCompleted('Buy groceries'),
        (isCompleted) => expect(isCompleted).to.be.true,
        'Expected first todo to be completed'
      );

      await expectValue(
        () => todoPage.isTodoCompleted('Walk the dog'),
        (isCompleted) => expect(isCompleted).to.be.true,
        'Expected second todo to be completed'
      );

      await expectValue(
        () => todoPage.getRemainingCount(),
        (count) => expect(count).to.equal(0),
        'Expected remaining count to be 0'
      );
    });
  });

  describe('Deleting Todos', () => {
    beforeEach(async () => {
      await todoPage.addTodo('Buy groceries');
      await todoPage.addTodo('Walk the dog');
      await todoPage.addTodo('Clean the house');
    });

    it('should delete a todo item', async () => {
      await todoPage.deleteTodo('Walk the dog');

      await expectValue(
        () => todoPage.getTodoCount(),
        (count) => expect(count).to.equal(2),
        'Expected todo count to be 2 after deletion'
      );

      await expectValue(
        () => todoPage.getTodoTexts(),
        (texts) => {
          expect(texts).to.not.include('Walk the dog');
          expect(texts).to.have.members(['Buy groceries', 'Clean the house']);
        },
        'Expected deleted todo to be removed from list'
      );
    });

    it('should clear completed todos', async () => {
      await todoPage.toggleTodo('Walk the dog');
      await todoPage.clearCompleted();

      await expectValue(
        () => todoPage.getTodoCount(),
        (count) => expect(count).to.equal(2),
        'Expected todo count to be 2 after clearing completed'
      );

      await expectValue(
        () => todoPage.getTodoTexts(),
        (texts) => {
          expect(texts).to.not.include('Walk the dog');
          expect(texts).to.have.members(['Buy groceries', 'Clean the house']);
        },
        'Expected completed todo to be cleared'
      );
    });
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

  describe('Persistence', () => {
    it('should not persist todos across page refreshes (demo app limitation)', async () => {
      await todoPage.addTodo('Buy groceries');
      await todoPage.addTodo('Walk the dog');

      // Refresh the page
      await todoPage.refresh();

      await expectValue(
        () => todoPage.getTodoCount(),
        (count) => expect(count).to.equal(0),
        'Expected no todos to persist after page refresh (demo app limitation)'
      );

      await expectValue(
        () => todoPage.getTodoTexts(),
        (texts) => expect(texts).to.be.empty,
        'Expected no todo texts to persist after page refresh (demo app limitation)'
      );
    });

    it('should not persist completed state across page refreshes (demo app limitation)', async () => {
      await todoPage.addTodo('Buy groceries');
      await todoPage.toggleTodo('Buy groceries');

      // Refresh the page
      await todoPage.refresh();

      await expectValue(
        () => todoPage.getTodoCount(),
        (count) => expect(count).to.equal(0),
        'Expected no todos to persist after page refresh (demo app limitation)'
      );
    });
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
