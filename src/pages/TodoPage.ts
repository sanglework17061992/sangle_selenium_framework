import { BasePage } from './BasePage';
import SanElement from '@core/elements/SanElement';

/**
 * TodoPage - Page object for TodoMVC application
 */
export class TodoPage extends BasePage {
  // Locators
  readonly newTodoInput: SanElement;
  readonly todoList: SanElement;
  readonly todoItems: SanElement;
  readonly clearCompletedBtn: SanElement;

  constructor() {
    super();

    // Initialize locators
    this.newTodoInput = this.css('.new-todo');
    this.todoList = this.css('.todo-list');
    this.todoItems = this.css('.todo-list li');
    this.clearCompletedBtn = this.css('.clear-completed');
  }

  // Todo item getter by index
  getTodoItem(index: number): SanElement {
    return this.css(`.todo-list li:nth-child(${index + 1})`);
  }

  // Page actions
  async addTodo(todoText: string): Promise<void> {
    await this.newTodoInput.type(todoText);
  }

  async toggleTodo(index: number): Promise<void> {
    const checkbox = this.css(`.todo-list li:nth-child(${index + 1}) .toggle`);
    await checkbox.click();
  }

  async deleteTodo(index: number): Promise<void> {
    const deleteBtn = this.css(`.todo-list li:nth-child(${index + 1}) .destroy`);
    await deleteBtn.click();
  }
}
