import { BasePage } from '../pages/BasePage';
import DriverManager from '../driver/DriverManager';
import { ThenableWebDriver } from 'selenium-webdriver';

export interface MochaTestContext {
  currentTest?: {
    title: string;
    state?: 'passed' | 'failed' | 'pending';
    err?: Error;
  };
}

/**
 * Reporter interface that test reporters must implement
 * This allows plugging in different reporters (Allure, Mochawesome, etc.)
 */
export interface TestReporter {
  beforeAll?(): Promise<void>;
  afterAll?(): Promise<void>;
  beforeEach?(): Promise<void>;
  afterEach?(): Promise<void>;
  onTestFailure?(testName: string, error: Error): Promise<void>;
  setDriver?(driver: ThenableWebDriver): void;
}

/**
 * No-op reporter for when no reporting is needed
 */
class NoOpReporter implements TestReporter {
  async beforeAll(): Promise<void> { 
    // No-op
  }
  async afterAll(): Promise<void> { 
    // No-op
  }
  async beforeEach(): Promise<void> { 
    // No-op
  }
  async afterEach(): Promise<void> { 
    // No-op
  }
  async onTestFailure(): Promise<void> { 
    // No-op
  }
  setDriver(): void { 
    // No-op
  }
}

/**
 * MultiReporter allows using multiple reporters at the same time.
 * It delegates all TestReporter methods to each reporter in the array.
 * 
 * @example
 * const test = new TodoTest(
 *   new MultiReporter([
 *     createAllureReporter(),
 *     createMochawesomeReporter()
 *   ])
 * );
 */
export class MultiReporter implements TestReporter {
  private readonly reporters: TestReporter[];

  constructor(reporters: TestReporter[]) {
    this.reporters = reporters;
  }

  async beforeAll(): Promise<void> {
    for (const reporter of this.reporters) {
      await reporter.beforeAll?.();
    }
  }

  async afterAll(): Promise<void> {
    for (const reporter of this.reporters) {
      await reporter.afterAll?.();
    }
  }

  async beforeEach(): Promise<void> {
    for (const reporter of this.reporters) {
      await reporter.beforeEach?.();
    }
  }

  async afterEach(): Promise<void> {
    for (const reporter of this.reporters) {
      await reporter.afterEach?.();
    }
  }

  async onTestFailure(testName: string, error: Error): Promise<void> {
    for (const reporter of this.reporters) {
      await reporter.onTestFailure?.(testName, error);
    }
  }

  setDriver(driver: ThenableWebDriver): void {
    for (const reporter of this.reporters) {
      reporter.setDriver?.(driver);
    }
  }
}

/**
 * Generic BaseTest class that can be used with any Page Object and any Reporter
 * 
 * @example
 * // Usage with custom page and reporter:
 * class TodoTest extends BaseTest<TodoPage> {
 *   protected createPage(driver: WebDriver): TodoPage {
 *     return new TodoPage(driver);
 *   }
 * }
 * 
 * // With Allure reporter:
 * const test = new TodoTest(new AllureReporter());
 * 
 * // Without reporter:
 * const test = new TodoTest();
 * 
 * // Access page via: test.page
 */
export abstract class BaseTest<T extends BasePage> {
  public page!: T;
  protected driver!: ThenableWebDriver;
  protected reporter: TestReporter;

  /**
   * @param reporter Optional test reporter (Allure, Mochawesome, etc.)
   */
  constructor(reporter?: TestReporter) {
    this.reporter = reporter || new NoOpReporter();
  }

  /**
   * Abstract method that must be implemented by subclasses to create their specific page object
   */
  protected abstract createPage(driver: ThenableWebDriver): T;

  /**
   * Setup WebDriver and initialize page object
   * Call this in the before() hook
   */
  async setupDriver(): Promise<void> {
    await this.reporter.beforeAll?.();
    
    this.driver = await DriverManager.getConfiguredDriver() as ThenableWebDriver;
    
    this.reporter.setDriver?.(this.driver);
    
    this.page = this.createPage(this.driver);
  }

  /**
   * Teardown WebDriver
   * Call this in the after() hook
   */
  async teardownDriver(): Promise<void> {
    await this.reporter.afterAll?.();
    
    // Quit the driver if it exists
    await this.driver?.quit();
  }

  /**
   * Setup for each test - opens the page
   * Call this in the beforeEach() hook
   * @param url URL to open
   */
  async setupTest(url: string): Promise<void> {
    await this.page.open(url);
    await this.reporter.beforeEach?.();
  }

  /**
   * Teardown for each test - handles failures and screenshots
   * Call this in the afterEach() hook
   */
  async teardownTest(testContext?: MochaTestContext): Promise<void> {
    if (testContext?.currentTest?.state === 'failed') {
      await this.reporter.onTestFailure?.(
        testContext.currentTest.title,
        testContext.currentTest?.err || new Error('Unknown error')
      );
    }
    await this.reporter.afterEach?.();
  }

  /**
   * Get the WebDriver instance
   */
  getDriver(): ThenableWebDriver {
    return this.driver;
  }
}
