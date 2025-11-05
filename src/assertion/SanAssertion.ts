import { SanElement } from '../core/elements/SanElement';
import { configLoader } from '../config/ConfigLoader';
import { expect } from 'chai';

const testConfig = configLoader.getTestConfig();
const defaultRetryTimeout = testConfig.retryCount * testConfig.retryInterval;

/**
 * Fluent assertion wrapper for SanElement
 * Provides Playwright-style assertions with retry logic
 */
export class ElementAssertions {
  private readonly element: SanElement;
  private readonly timeout: number;

  constructor(element: SanElement, timeout?: number) {
    this.element = element;
    this.timeout = timeout ?? defaultRetryTimeout;
  }

  /**
   * Assert that the element has the exact text
   */
  async toHaveText(expectedText: string): Promise<void> {
    await this.retryAssert(async () => {
      const actualText = await this.element.getText();
      expect(actualText.trim()).to.equal(expectedText);
    }, `Expected element to have text "${expectedText}"`);
  }

  /**
   * Assert that the element contains the specified text
   */
  async toContainText(expectedSubstring: string): Promise<void> {
    await this.retryAssert(async () => {
      const actualText = await this.element.getText();
      expect(actualText.trim()).to.include(expectedSubstring);
    }, `Expected element to contain text "${expectedSubstring}"`);
  }

  /**
   * Assert that the element has the specified attribute with the expected value
   */
  async toHaveAttribute(attributeName: string, expectedValue: string): Promise<void> {
    await this.retryAssert(async () => {
      const actualValue = await this.element.getAttribute(attributeName);
      expect(actualValue).to.equal(expectedValue);
    }, `Expected element to have attribute "${attributeName}" with value "${expectedValue}"`);
  }

  /**
   * Assert that the element has the specified attribute containing the expected value
   */
  async toHaveAttributeContaining(attributeName: string, expectedSubstring: string): Promise<void> {
    await this.retryAssert(async () => {
      const actualValue = await this.element.getAttribute(attributeName);
      expect(actualValue).to.include(expectedSubstring);
    }, `Expected element to have attribute "${attributeName}" containing "${expectedSubstring}"`);
  }

  /**
   * Assert that the element is visible
   */
  async toBeVisible(): Promise<void> {
    await this.retryAssert(async () => {
      const isVisible = await this.element.isDisplayed();
      expect(isVisible).to.be.true;
    }, 'Expected element to be visible');
  }

  /**
   * Assert that the element is not visible
   */
  async toBeHidden(): Promise<void> {
    await this.retryAssert(async () => {
      const isVisible = await this.element.isDisplayed();
      expect(isVisible).to.be.false;
    }, 'Expected element to be hidden');
  }

  /**
   * Assert that the element is enabled
   */
  async toBeEnabled(): Promise<void> {
    await this.retryAssert(async () => {
      const isEnabled = await (await this.element.raw()).isEnabled();
      expect(isEnabled).to.be.true;
    }, 'Expected element to be enabled');
  }

  /**
   * Assert that the element is disabled
   */
  async toBeDisabled(): Promise<void> {
    await this.retryAssert(async () => {
      const isEnabled = await (await this.element.raw()).isEnabled();
      expect(isEnabled).to.be.false;
    }, 'Expected element to be disabled');
  }

  /**
   * Assert that the element has the specified CSS class
   */
  async toHaveClass(className: string): Promise<void> {
    await this.retryAssert(async () => {
      const classAttribute = await this.element.getAttribute('class');
      const classes = classAttribute ? classAttribute.split(/\s+/) : [];
      expect(classes).to.include(className);
    }, `Expected element to have CSS class "${className}"`);
  }

  /**
   * Assert that the element's value attribute equals the expected value
   */
  async toHaveValue(expectedValue: string): Promise<void> {
    await this.toHaveAttribute('value', expectedValue);
  }

  /**
   * Assert that the element's value attribute contains the expected substring
   */
  async toHaveValueContaining(expectedSubstring: string): Promise<void> {
    await this.toHaveAttributeContaining('value', expectedSubstring);
  }

  /**
   * Retry assertion with configurable timeout and interval
   */
  private async retryAssert(assertFn: () => Promise<void>, errorMessage: string): Promise<void> {
    const start = Date.now();
    let lastErr: any = null;

    while (Date.now() - start < this.timeout) {
      try {
        await assertFn();
        return;
      } catch (err) {
        lastErr = err;
        await new Promise(r => setTimeout(r, testConfig.retryInterval));
      }
    }

    const error = lastErr || new Error('Assertion timed out');
    error.message = `${errorMessage}\n${error.message}`;
    throw error;
  }
}

/**
 * Create fluent assertions for a SanElement
 * Usage: expectElement(element).toHaveText('expected')
 */
export function expectElement(element: SanElement, timeout?: number): ElementAssertions {
  return new ElementAssertions(element, timeout);
}

/**
 * Retry assertion for values with configurable timeout
 * Provides retry logic similar to element assertions for value-based assertions
 * Usage: await expectValue(() => getTodoCount(), (count) => expect(count).to.equal(1), 'Expected todo count to be 1')
 */
export async function expectValue<T>(
  actualValueFn: () => Promise<T> | T,
  assertionFn: (value: T) => void,
  errorMessage: string,
  timeout?: number
): Promise<void> {
  const actualTimeout = timeout ?? defaultRetryTimeout;
  const start = Date.now();
  let lastErr: any = null;

  while (Date.now() - start < actualTimeout) {
    try {
      const value = await actualValueFn();
      assertionFn(value);
      return;
    } catch (err) {
      lastErr = err;
      await new Promise(r => setTimeout(r, testConfig.retryInterval));
    }
  }

  const error = lastErr || new Error('Assertion timed out');
  error.message = `${errorMessage}\n${error.message}`;
  throw error;
}