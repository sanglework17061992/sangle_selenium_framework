import { ThenableWebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage';
import { SanElement, LocatorType } from '../core/elements/SanElement';
import { delay } from '../core/elements/ActionabilityChecker';

/**
 * Page Object for Todo App
 * Simple page for testing common interactions
 */
export class TodoPage extends BasePage {
  // Locators
  private readonly newTodoInput: SanElement;
  private readonly todoList: SanElement;
  private readonly todoItems: SanElement;
  private readonly todoCount: SanElement;
  private readonly clearCompletedBtn: SanElement;
  private readonly filterAll: SanElement;
  private readonly filterActive: SanElement;
  private readonly filterCompleted: SanElement;
  
  // Dynamic locators initialized in constructor
  private readonly todoItem: (index: number) => SanElement;
  private readonly todoCheckbox: (index: number) => SanElement;
  private readonly todoLabel: (index: number) => SanElement;
  private readonly todoDeleteBtn: (index: number) => SanElement;

  constructor(driver: ThenableWebDriver) {
    super(driver);
    
    // Initialize static locators
    this.newTodoInput = this.byCss('.new-todo');
    this.todoList = this.byCss('.todo-list');
    this.todoItems = this.byCss('.todo-list li');
    this.todoCount = this.byCss('.todo-count');
    this.clearCompletedBtn = this.byCss('.clear-completed');
    this.filterAll = this.byCss('a[href="#/"]');
    this.filterActive = this.byCss('a[href="#/active"]');
    this.filterCompleted = this.byCss('a[href="#/completed"]');
    
    // Initialize dynamic locators using chaining
    this.todoItem = (index: number) => this.todoList.findChild(LocatorType.CSS, 'li').nth(index);
    this.todoCheckbox = (index: number) => this.todoItem(index).findChild(LocatorType.CSS, '.toggle');
    this.todoLabel = (index: number) => this.todoItem(index).findChild(LocatorType.CSS, 'label');
    this.todoDeleteBtn = (index: number) => this.todoItem(index).findChild(LocatorType.CSS, '.destroy');
  }

  async addTodo(todoText: string): Promise<void> {
    await this.newTodoInput.type(todoText, '\n');
  }

  getTodoItem(index: number): SanElement {
    return this.todoItem(index);
  }

  getTodoCheckbox(index: number): SanElement {
    return this.todoCheckbox(index);
  }

  getTodoLabel(index: number): SanElement {
    return this.todoLabel(index);
  }

  getTodoDeleteBtn(index: number): SanElement {
    return this.todoDeleteBtn(index);
  }

  async toggleTodo(index: number): Promise<void> {
    const checkbox = this.todoCheckbox(index);
    await checkbox.click({ force: true });
  }

  async deleteTodo(index: number): Promise<void> {
    const item = this.todoItem(index);
    await item.hover();
    
    const deleteBtn = this.todoDeleteBtn(index);
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
