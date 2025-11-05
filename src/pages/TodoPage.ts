import { BasePage } from './BasePage';
import { configLoader } from '../config/ConfigLoader';
import { By, Key } from 'selenium-webdriver';
import { AllureReporter } from '../reporting/AllureReporter';

export class TodoPage extends BasePage {
  // ==========================================
  // TODO APP ELEMENTS
  // ==========================================

  // Input field for new todos
  newTodoInput = this.byCss('.new-todo');

  // Todo list container
  todoList = this.byCss('.todo-list');

  // Todo items
  todoItems = this.byCss('.todo-list li');

  // Todo item labels
  todoLabels = this.byCss('.todo-list li label');

  // Todo item checkboxes
  todoCheckboxes = this.byCss('.todo-list li .toggle');

  // Todo item delete buttons
  todoDeleteButtons = this.byCss('.todo-list li .destroy');

  // Footer elements
  todoCount = this.byCss('.todo-count');
  clearCompletedButton = this.byCss('.clear-completed');

  // Filter buttons
  allFilter = this.byCss('[href="#/"]');
  activeFilter = this.byCss('[href="#/active"]');
  completedFilter = this.byCss('[href="#/completed"]');

  // ==========================================
  // DYNAMIC XPATH FOR COMPLEX SCENARIOS
  // ==========================================

  // Get todo item by text content
  getTodoByText = (text: string) => this.byXpath(`//li[@data-testid="todo-item"]//label[contains(text(), "%s")]`, text);

  // Get todo checkbox by text
  getTodoCheckboxByText = (text: string) => this.byXpath(`//label[contains(text(), "%s")]/preceding-sibling::input[@class="toggle"]`, text);

  // Get todo delete button by text
  getTodoDeleteByText = (text: string) => this.byXpath(`//li[@data-testid="todo-item"]//label[contains(text(), "%s")]/following-sibling::button[@class="destroy"]`, text);

  async open(): Promise<void> {
    const appConfig = configLoader.getAppConfig();
    await this.driver.get(appConfig.baseUrl);
  }

  async refresh(): Promise<void> {
    await this.driver.navigate().refresh();
  }

  // ==========================================
  // TODO APP METHODS
  // ==========================================

  async addTodo(text: string): Promise<void> {
    await AllureReporter.step(`Add todo item: "${text}"`, async () => {
      await this.newTodoInput.type(text);

      // Try using Actions API to send Enter key
      const actions = this.driver.actions({ bridge: true });
      await actions.sendKeys(Key.RETURN).perform();
    });
  }

  async getTodoCount(): Promise<number> {
    await AllureReporter.step('Get total count of todo items', async () => {
      // Step logic is handled here, but we return the value below
    });

    try {
      return await this.byCssAll('.todo-list li').count();
    } catch {
      return 0;
    }
  }

  async getTodoTexts(): Promise<string[]> {
    await AllureReporter.step('Get all todo item texts', async () => {
      // Step logic is handled here, but we return the value below
    });

    try {
      const labels = await this.byCssAll('.todo-list li label').getElements();
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
      // Find the checkbox and click it using JavaScript
      const label = await this.byXpath(`//label[contains(text(), "${text}")]`).raw();
      const li = await label.findElement(By.xpath('ancestor::li'));
      const checkbox = await li.findElement(By.css('input.toggle'));
      await checkbox.click();
      // Small delay to allow UI to update
      await new Promise(resolve => setTimeout(resolve, 100));
    });
  }

  async deleteTodo(text: string): Promise<void> {
    await AllureReporter.step(`Delete todo item: "${text}"`, async () => {
      // Find the label first, then find the li and delete button
      const label = await this.byXpath(`//label[contains(text(), "${text}")]`).raw();
      const li = await label.findElement(By.xpath('ancestor::li'));
      await this.driver.actions().move({ origin: li }).perform();

      const deleteButton = await li.findElement(By.css('button.destroy'));
      await deleteButton.click();
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
      const label = await this.byXpath(`//label[contains(text(), "${text}")]`).raw();
      const li = await label.findElement(By.xpath('ancestor::li'));
      const checkbox = await li.findElement(By.css('input.toggle'));
      return await checkbox.isSelected();
    } catch {
      return false;
    }
  }

  async markAllAsCompleted(): Promise<void> {
    await AllureReporter.step('Mark all todo items as completed', async () => {
      // Try to find the "toggle all" checkbox in TodoMVC
      try {
        const toggleAll = await this.driver.findElement(By.css('.toggle-all'));
        await toggleAll.click();
      } catch {
        // If no toggle all, mark each individually
        const todos = await this.getTodoTexts();
        for (const todo of todos) {
          if (!(await this.isTodoCompleted(todo))) {
            await this.toggleTodo(todo);
          }
        }
      }
    });
  }
}