import { BaseTest } from '../../src/base';
import { TodoPage } from '../../src/pages/TodoPage';
import { ThenableWebDriver } from 'selenium-webdriver';
import { ConfigLoader } from '../../src/config/ConfigLoader';

/**
 * Shared TodoPage test class for all todo-app tests
 */
export class TodoTest extends BaseTest<TodoPage> {
  protected createPage(driver: ThenableWebDriver): TodoPage {
    return new TodoPage(driver);
  }

  async setupTest(): Promise<void> {
    const config = ConfigLoader.getInstance().getConfig();
    await super.setupTest(config.app.baseUrl);
  }
}
