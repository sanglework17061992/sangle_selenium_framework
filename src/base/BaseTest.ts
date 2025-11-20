import { ThenableWebDriver } from 'selenium-webdriver';

export interface TestReporter {
  beforeAll?(): Promise<void>;
  afterAll?(): Promise<void>;
  beforeEach?(): Promise<void>;
  afterEach?(): Promise<void>;
  onTestFailure?(testName: string, error: Error): Promise<void>;
  setDriver?(driver: ThenableWebDriver): void;
}
