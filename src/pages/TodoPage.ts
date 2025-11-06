import { BasePage } from './BasePage';
import { configLoader } from '../config/ConfigLoader';
import { Key } from 'selenium-webdriver';
import { AllureReporter } from '../reporting/AllureReporter';
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
  getTodoCheckboxByText = (text: string) => this.byXpath(`//li[@data-testid="todo-item"]//label[contains(text(), "%s")]/preceding::input[@class="toggle"]`, text);
  getTodoDeleteByText = (text: string) => this.byXpath(`//li[@data-testid="todo-item"]//label[contains(text(), "%s")]/following-sibling::button[@class="destroy"]`, text);

  async open(): Promise<void> {
    const appConfig = configLoader.getAppConfig();
    await super.open(appConfig.baseUrl);
  }

  async addTodo(text: string): Promise<void> {
    if (AllureReporter.isEnabled()) {
      await AllureReporter.step(`Add todo item: "${text}"`, async () => {
        await this.newTodoInput.type(text, Key.RETURN);
      });
    } else {
      await this.newTodoInput.type(text, Key.RETURN);
    }
  }

  async getTodoCount(): Promise<number> {
    await AllureReporter.step('Get total count of todo items', async () => {
      // Step logic is handled here, but we return the value below
    });

    try {
      return await this.todoItemsList.count();
    } catch {
      return 0;
    }
  }

  async getTodoTexts(): Promise<string[]> {
    await AllureReporter.step('Get all todo item texts', async () => {
      // Step logic is handled here, but we return the value below
    });

    try {
      const labels = await this.todoLabelsList.getElements();
      const texts: string[] = [];
      for (const label of labels) {
        const textContent = await label.getAttribute('textContent') || await label.getText();
        // Decode HTML entities
        const decodedText = textContent
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#39;/g, "'");
        texts.push(decodedText);
      }
      return texts;
    } catch {
      return [];
    }
  }

  async toggleTodo(text: string): Promise<void> {
    await AllureReporter.step(`Toggle todo completion: "${text}"`, async () => {
      // Find all toggle checkboxes, then find the one associated with the todo text
      const checkboxes = await this.driver.findElements({ css: 'input.toggle' });
      const labels = await this.driver.findElements({ css: 'li label' });
      
      for (let i = 0; i < labels.length; i++) {
        const labelText = await labels[i].getText();
        if (labelText === text) {
          await checkboxes[i].click();
          return;
        }
      }
      
      throw new Error(`Todo with text "${text}" not found`);
    });
  }  
  
  async deleteTodo(text: string): Promise<void> {
    await AllureReporter.step(`Delete todo item: "${text}"`, async () => {
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
    });
  }  
  
  async clearCompleted(): Promise<void> {
    await AllureReporter.step('Clear all completed todo items', async () => {
      await this.clearCompletedButton.click();
    });
  }

  async filterAll(): Promise<void> {
    await AllureReporter.step('Filter todos to show all items', async () => {
      await this.allFilter.click();
    });
  }

  async filterActive(): Promise<void> {
    await AllureReporter.step('Filter todos to show only active items', async () => {
      await this.activeFilter.click();
    });
  }

  async filterCompleted(): Promise<void> {
    await AllureReporter.step('Filter todos to show only completed items', async () => {
      await this.completedFilter.click();
    });
  }

  async getRemainingCount(): Promise<number> {
    await AllureReporter.step('Get count of remaining active todo items', async () => {
      // Step logic is handled here, but we return the value below
    });

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
    await AllureReporter.step(`Check if todo item is completed: "${text}"`, async () => {
      // Step logic is handled here, but we return the value below
    });

    try {
      const todoItems = await this.driver.findElements({ css: '.todo-list li' });
      
      for (const item of todoItems) {
        const label = await item.findElement({ css: 'label' });
        const labelText = await label.getText();
        if (labelText === text) {
          const classAttr = await item.getAttribute('class');
          return classAttr ? classAttr.includes('completed') : false;
        }
      }
      
      return false;
    } catch {
      return false;
    }
  }

  async markAllAsCompleted(): Promise<void> {
    await AllureReporter.step('Mark all todo items as completed', async () => {
      const todos = await this.getTodoTexts();
      for (const todo of todos) {
        if (!(await this.isTodoCompleted(todo))) {
          await this.toggleTodo(todo);
        }
      }
    });
  }
}