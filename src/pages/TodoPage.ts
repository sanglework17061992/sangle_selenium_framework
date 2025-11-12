import { ThenableWebDriver } from 'selenium-webdriver';
import { BasePage } from './BasePage';
import { SanElement } from '../core/elements/SanElement';

/**
 * Page Object for Todo App
 * Simple page for testing common interactions
 */
export class TodoPage extends BasePage {
  constructor(driver: ThenableWebDriver) {
    super(driver);
  }

  // Locators - defined as getter methods
  private get newTodoInput() { return this.byCss('.new-todo'); }
  private get todoList() { return this.byCss('.todo-list'); }
  private get todoItems() { return this.byCss('.todo-list li'); }
  private get todoCount() { return this.byCss('.todo-count'); }
  private get clearCompletedBtn() { return this.byCss('.clear-completed'); }
  private get filterAll() { return this.byCss('a[href="#/"]'); }
  private get filterActive() { return this.byCss('a[href="#/active"]'); }
  private get filterCompleted() { return this.byCss('a[href="#/completed"]'); }

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
    const item = this.getTodoItem(index);
    await item.hover();
    const deleteBtn = this.getTodoDeleteBtn(index);
    await deleteBtn.click();
  }

  async getTodoCount(): Promise<number> {
    return await this.todoItems.count();
  }

  async getTodoCountText(): Promise<string> {
    return await this.todoCount.getText();
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

  async isClearCompletedVisible(): Promise<boolean> {
    return await this.clearCompletedBtn.isDisplayed();
  }
}
