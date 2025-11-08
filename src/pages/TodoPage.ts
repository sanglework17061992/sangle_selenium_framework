import { BasePage } from './BasePage';
import { configLoader } from '../config/ConfigLoader';
import { Key } from 'selenium-webdriver';
import SanElement from '../core/elements/SanElement';

export class TodoPage extends BasePage {
  get newTodoInput() { return this.byCss('.new-todo'); }
  get todoList() { return this.byCss('.todo-list'); }
  get todoItemsList() { return this.byCssAll('.todo-list li'); }
  get todoLabelsList() { return this.byCssAll('.todo-list li label'); }
  get todoCount() { return this.byCss('.todo-count'); }
  get clearCompletedButton() { return this.byCss('.clear-completed'); }
  get toggleAllCheckbox() { return this.byCss('.toggle-all'); }
  get allFilter() { return this.byCss('[href="#/"]'); }
  get activeFilter() { return this.byCss('[href="#/active"]'); }
  get completedFilter() { return this.byCss('[href="#/completed"]'); }

  getTodoByText = (text: string) => this.byXpath(`//li[@data-testid="todo-item"][.//label[contains(text(), "%s")]]`, text);
  getTodoCheckboxByText = (text: string) => this.byXpath(`//li[@data-testid="todo-item"][.//label[contains(text(), "%s")]]//input[@class="toggle"]`, text);
  getTodoDeleteByText = (text: string) => this.byXpath(`//li[@data-testid="todo-item"]//label[contains(text(), "%s")]/following-sibling::button[@class="destroy"]`, text);

  async open(): Promise<void> {
    const appConfig = configLoader.getAppConfig();
    await super.open(appConfig.baseUrl);
  }

  /**
   * Decode common HTML entities in text
   */
  private decodeHtmlEntities(text: string): string {
    const entities: Record<string, string> = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'"
    };
    
    return text.replace(/&(?:amp|lt|gt|quot|#39);/g, match => entities[match] || match);
  }

  async addTodo(text: string): Promise<void> {
    await this.newTodoInput.type(text, Key.RETURN);
  }

  async getTodoCount(): Promise<number> {
    try {
      return await this.todoItemsList.count();
    } catch {
      return 0;
    }
  }

  async getTodoTexts(): Promise<string[]> {
    try {
      const labels = await this.todoLabelsList.getElements();
      const texts: string[] = [];
      for (const label of labels) {
        const textContent = await label.getAttribute('textContent') || await label.getText();
        texts.push(this.decodeHtmlEntities(textContent));
      }
      return texts;
    } catch {
      return [];
    }
  }

  async toggleTodo(text: string): Promise<void> {
    // TodoMVC checkboxes are typically hidden, so we need to force click
    const checkbox = this.getTodoCheckboxByText(text);
    await checkbox.click({ force: true });
  }  
  
  async deleteTodo(text: string): Promise<void> {
    // Use SanElement's static method to execute JavaScript for finding and clicking the delete button
    const findAndClickScript = `
      const labels = document.querySelectorAll('.todo-list li label');
      for (const label of labels) {
        if (label.textContent.trim() === arguments[0]) {
          const li = label.closest('li');
          const button = li.querySelector('button.destroy');
          if (button) {
            // Force visibility and click
            button.style.display = 'block';
            button.style.visibility = 'visible';
            button.click();
            return;
          }
        }
      }
      throw new Error('Todo item not found: ' + arguments[0]);
    `;

    await SanElement.clickWithJavaScriptByCriteria(this.driver, findAndClickScript, text);
  }  
  
  async clearCompleted(): Promise<void> {
    await this.clearCompletedButton.click();
  }

  async filterAll(): Promise<void> {
    await this.allFilter.click();
  }

  async filterActive(): Promise<void> {
    await this.activeFilter.click();
  }

  async filterCompleted(): Promise<void> {
    await this.completedFilter.click();
  }

  async getRemainingCount(): Promise<number> {
    try {
      const countText = await this.todoCount.getText();
      // Extract number from text like "3 items left"
      const match = /(\d+)/.exec(countText);
      return match ? Number.parseInt(match[1], 10) : 0;
    } catch {
      return 0;
    }
  }

  async isTodoCompleted(text: string): Promise<boolean> {
    try {
      const todoItem = this.getTodoByText(text);
      const classAttr = await todoItem.getAttribute('class');
      return classAttr ? classAttr.includes('completed') : false;
    } catch {
      return false;
    }
  }

  async markAllAsCompleted(): Promise<void> {
    const todos = await this.getTodoTexts();
    for (const todo of todos) {
      if (!(await this.isTodoCompleted(todo))) {
        await this.toggleTodo(todo);
      }
    }
  }
}