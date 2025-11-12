import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import { TodoPage } from '../src/pages/TodoPage';
import { expect } from '../src/assertion';
import { BaseTest, MultiReporter } from '../src/base/BaseTest';
import { createAllureReporter, createMochawesomeReporter } from '../src/reporters';
import { ThenableWebDriver } from 'selenium-webdriver';
import { configLoader } from '../src/config/ConfigLoader';

/**
 * Todo App Test - Simple demo test similar to Playwright
 */
class TodoTest extends BaseTest<TodoPage> {
  protected createPage(driver: ThenableWebDriver): TodoPage {
    return new TodoPage(driver);
  }

  async setupTest(): Promise<void> {
    await super.setupTest(configLoader.getBaseUrl() + 'todomvc');
  }
}

describe('Todo App - Basic Operations', () => {
  const test = new TodoTest(
    new MultiReporter([
      createAllureReporter(),
      createMochawesomeReporter()
    ])
  );

  before(async () => {
    await test.setupDriver();
  });

  after(async () => {
    await test.teardownDriver();
  });

  beforeEach(async () => {
    await test.setupTest();
  });

  afterEach(async function() {
    await test.teardownTest(this);
  });

  it('should add new todo items', async () => {
    const page = test.page;

    // Add first todo
    await page.addTodo('Buy groceries');
    const firstTodo = page.getTodoLabel(0);
    await expect(firstTodo).toHaveText('Buy groceries');

    // Add second todo
    await page.addTodo('Walk the dog');
    const secondTodo = page.getTodoLabel(1);
    await expect(secondTodo).toHaveText('Walk the dog');

    // Verify count
    const count = await page.getTodoCount();
    expect(count).toBe(2);
  });

  it('should mark todo as completed', async () => {
    const page = test.page;

    // Add todo
    await page.addTodo('Read a book');
    
    // Toggle as completed
    await page.toggleTodo(0);
    
    // Verify the todo item has completed class
    const todoItem = page.getTodoItem(0);
    await expect(todoItem).toHaveAttribute('class', 'completed');
  });

  it('should delete todo items', async () => {
    const page = test.page;

    // Add two todos
    await page.addTodo('Task 1');
    await page.addTodo('Task 2');
    
    // Delete first todo
    await page.deleteTodo(0);
    
    // Verify only one remains
    const count = await page.getTodoCount();
    expect(count).toBe(1);
    
    // Verify remaining todo
    const remainingTodo = page.getTodoLabel(0);
    await expect(remainingTodo).toHaveText('Task 2');
  });

  it('should filter todos by status', async () => {
    const page = test.page;

    // Add three todos
    await page.addTodo('Active task');
    await page.addTodo('Completed task');
    await page.addTodo('Another active task');
    
    // Mark second todo as completed
    await page.toggleTodo(1);
    
    // Filter by active
    await page.filterByActive();
    const activeCount = await page.getTodoCount();
    expect(activeCount).toBe(2);
    
    // Filter by completed
    await page.filterByCompleted();
    const completedCount = await page.getTodoCount();
    expect(completedCount).toBe(1);
    
    // Filter by all
    await page.filterByAll();
    const allCount = await page.getTodoCount();
    expect(allCount).toBe(3);
  });

  it('should clear completed todos', async () => {
    const page = test.page;

    // Add and complete some todos
    await page.addTodo('Todo 1');
    await page.addTodo('Todo 2');
    await page.addTodo('Todo 3');
    
    // Complete first and third
    await page.toggleTodo(0);
    await page.toggleTodo(2);
    
    // Clear completed
    await page.clearCompleted();
    
    // Verify only active todo remains
    const count = await page.getTodoCount();
    expect(count).toBe(1);
    
    const remainingTodo = page.getTodoLabel(0);
    await expect(remainingTodo).toHaveText('Todo 2');
  });
});
