import { TodoPage } from '../src/pages/TodoPage';
import DriverManager from '../src/driver/DriverManager';
import { AllureTestHooks } from '../src/reporting/AllureTestHooks';

const isAllureReporter = process.argv.includes('--reporter') &&
                        process.argv.includes('allure-mocha');

export class BaseTest {
  public todoPage!: TodoPage;
  protected driver: any;

  async setupDriver(): Promise<void> {
    if (isAllureReporter) {
      await AllureTestHooks.beforeAll();
    }
    this.driver = await DriverManager.getConfiguredDriver();
    if (isAllureReporter) {
      AllureTestHooks.setDriver(this.driver);
    }
    this.todoPage = new TodoPage(this.driver);
  }

  async teardownDriver(): Promise<void> {
    if (isAllureReporter) {
      await AllureTestHooks.afterAll();
    } else if (this.driver) {
      await this.driver.quit();
    }
  }

  async setupTest(): Promise<void> {
    await this.todoPage.open();
    if (isAllureReporter) {
      await AllureTestHooks.beforeEach();
    }
  }

  async teardownTest(testContext?: any): Promise<void> {
    if (isAllureReporter && testContext?.currentTest?.state === 'failed') {
      await AllureTestHooks.onTestFailure(testContext.currentTest, testContext.currentTest?.err);
    }
    if (isAllureReporter) {
      await AllureTestHooks.afterEach();
    }
  }
}