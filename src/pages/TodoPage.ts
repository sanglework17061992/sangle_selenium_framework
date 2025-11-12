import { ThenableWebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage';
import { SanElement } from '../core/elements/SanElement';
import { delay } from '../core/elements/ActionabilityChecker';

/**
 * Page Object for Todo App
 * Simple page for testing common interactions
 */
export class TodoPage extends BasePage {
  // Locators - defined in constructor
  private readonly newTodoInput: SanElement;
  private readonly todoList: SanElement;
  private readonly todoItems: SanElement;
  private readonly todoCount: SanElement;
  private readonly clearCompletedBtn: SanElement;
  private readonly filterAll: SanElement;
  private readonly filterActive: SanElement;
  private readonly filterCompleted: SanElement;

  constructor(driver: ThenableWebDriver) {
    super(driver);
    
    // Initialize locators
    this.newTodoInput = this.byCss('.new-todo');
    this.todoList = this.byCss('.todo-list');
    this.todoItems = this.byCss('.todo-list li');
    this.todoCount = this.byCss('.todo-count');
    this.clearCompletedBtn = this.byCss('.clear-completed');
    this.filterAll = this.byCss('a[href="#/"]');
    this.filterActive = this.byCss('a[href="#/active"]');
    this.filterCompleted = this.byCss('a[href="#/completed"]');
  }

  // Actions
  async addTodo(todoText: string): Promise<void> {
    await this.newTodoInput.type(todoText, '\n');
  }

  getTodoItem(index: number): SanElement {
    return this.byCss(`.todo-list li:nth-child(${index + 1})`);
  }

  getTodoCheckbox(index: number): SanElement {
    return this.byCss(`.todo-list li:nth-child(${index + 1}) .toggle`);
  }

  getTodoLabel(index: number): SanElement {
    return this.byCss(`.todo-list li:nth-child(${index + 1}) label`);
  }

  getTodoDeleteBtn(index: number): SanElement {
    return this.byCss(`.todo-list li:nth-child(${index + 1}) .destroy`);
  }

  async toggleTodo(index: number): Promise<void> {
    const checkbox = this.getTodoCheckbox(index);
    await checkbox.click({ force: true });
  }

  async deleteTodo(index: number): Promise<void> {
    // Hover over the todo item to reveal the delete button
    const item = this.getTodoItem(index);
    await item.hover();
    
    // Wait a bit for CSS transition to complete
    await delay(100);
    
    // Click the delete button (use force as button might still be transitioning)
    const deleteBtn = this.getTodoDeleteBtn(index);
    await deleteBtn.click({ force: true });
  }

  async getTodoCount(): Promise<number> {
    return await this.todoItems.count();
  }

  async clearCompleted(): Promise<void> {
    await this.clearCompletedBtn.click();
  }

  async filterByAll(): Promise<void> {
    await this.filterAll.click();
  }

  async filterByActive(): Promise<void> {
    await this.filterActive.click();
  }

  async filterByCompleted(): Promise<void> {
    await this.filterCompleted.click();
  }
}
