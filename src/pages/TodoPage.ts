import { BasePage } from './BasePage';
import SanElement from '@core/elements/SanElement';

/**
 * TodoPage - Page object for TodoMVC application
 */
export class TodoPage extends BasePage {
  // Locators - Field initialization
  readonly newTodoInput: SanElement = this.css('.new-todo');
  readonly todoList: SanElement = this.css('.todo-list');
  readonly todoItems: SanElement = this.css('.todo-list li');
  readonly clearCompletedBtn: SanElement = this.css('.clear-completed');

  // Todo item getter by index - chainable from todoList
  getTodoItem(index: number): SanElement {
    return this.todoList.findChild({ using: 'css', value: `li:nth-child(${index + 1})` });
  }

  // Page actions
  async addTodo(todoText: string): Promise<void> {
    await this.newTodoInput.type(todoText);
  }

  async toggleTodo(index: number): Promise<void> {
    const checkbox = this.getTodoItem(index).findChild({ using: 'css', value: '.toggle' });
    await checkbox.click();
  }

  async deleteTodo(index: number): Promise<void> {
    const deleteBtn = this.getTodoItem(index).findChild({ using: 'css', value: '.destroy' });
    await deleteBtn.click();
  }
}
