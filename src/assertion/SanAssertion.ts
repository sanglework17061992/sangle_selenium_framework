import { SanElement } from '../core/elements/SanElement';
import { configLoader } from '../config/ConfigLoader';
import { AssertHelper } from '../helpers/AssertHelper';

const testConfig = configLoader.getTestConfig();
const defaultRetryTimeout = testConfig.retryCount * testConfig.retryInterval;

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
      AssertHelper.equal(actualText.trim(), expectedText);
    }, `Expected element to have text "${expectedText}"`);
  }

  /**
   * Assert that the element contains the specified text
   */
  async toContainText(expectedSubstring: string): Promise<void> {
    await this.retryAssert(async () => {
      const actualText = await this.element.getText();
      AssertHelper.include(actualText.trim(), expectedSubstring);
    }, `Expected element to contain text "${expectedSubstring}"`);
  }

  /**
   * Assert that the element has the specified attribute with the expected value
   */
  async toHaveAttribute(attributeName: string, expectedValue: string): Promise<void> {
    await this.retryAssert(async () => {
      const actualValue = await this.element.getAttribute(attributeName);
      AssertHelper.equal(actualValue, expectedValue);
    }, `Expected element to have attribute "${attributeName}" with value "${expectedValue}"`);
  }

  /**
   * Assert that the element has the specified attribute containing the expected value
   */
  async toHaveAttributeContaining(attributeName: string, expectedSubstring: string): Promise<void> {
    await this.retryAssert(async () => {
      const actualValue = await this.element.getAttribute(attributeName);
      AssertHelper.include(actualValue, expectedSubstring);
    }, `Expected element to have attribute "${attributeName}" containing "${expectedSubstring}"`);
  }

  /**
   * Assert that the element is visible
   */
  async toBeVisible(): Promise<void> {
    await this.retryAssert(async () => {
      const isVisible = await this.element.isDisplayed();
      AssertHelper.isTrue(isVisible);
    }, 'Expected element to be visible');
  }

  /**
   * Assert that the element is not visible
   */
  async toBeHidden(): Promise<void> {
    await this.retryAssert(async () => {
      const isVisible = await this.element.isDisplayed();
      AssertHelper.isFalse(isVisible);
    }, 'Expected element to be hidden');
  }

  /**
   * Assert that the element is enabled
   */
  async toBeEnabled(): Promise<void> {
    await this.retryAssert(async () => {
      const isEnabled = await (await this.element.raw()).isEnabled();
      AssertHelper.isTrue(isEnabled);
    }, 'Expected element to be enabled');
  }

  /**
   * Assert that the element is disabled
   */
  async toBeDisabled(): Promise<void> {
    await this.retryAssert(async () => {
      const isEnabled = await (await this.element.raw()).isEnabled();
      AssertHelper.isFalse(isEnabled);
    }, 'Expected element to be disabled');
  }

  /**
   * Assert that the element has the specified CSS class
   */
  async toHaveClass(className: string): Promise<void> {
    await this.retryAssert(async () => {
      const classAttribute = await this.element.getAttribute('class');
      const classes = classAttribute ? classAttribute.split(/\s+/) : [];
      AssertHelper.include(classes, className);
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
   * Assert that the element does not have the exact text
   */
  async toNotHaveText(expectedText: string): Promise<void> {
    await this.retryAssert(async () => {
      const actualText = await this.element.getText();
      AssertHelper.notEqual(actualText.trim(), expectedText);
    }, `Expected element not to have text "${expectedText}"`);
  }

  /**
   * Assert that the element does not contain the specified text
   */
  async toNotContainText(expectedSubstring: string): Promise<void> {
    await this.retryAssert(async () => {
      const actualText = await this.element.getText();
      AssertHelper.notInclude(actualText.trim(), expectedSubstring);
    }, `Expected element not to contain text "${expectedSubstring}"`);
  }

  /**
   * Assert that the element does not have the specified attribute with the expected value
   */
  async toNotHaveAttribute(attributeName: string, expectedValue: string): Promise<void> {
    await this.retryAssert(async () => {
      const actualValue = await this.element.getAttribute(attributeName);
      AssertHelper.notEqual(actualValue, expectedValue);
    }, `Expected element not to have attribute "${attributeName}" with value "${expectedValue}"`);
  }

  /**
   * Assert that the element does not have the specified attribute containing the expected value
   */
  async toNotHaveAttributeContaining(attributeName: string, expectedSubstring: string): Promise<void> {
    await this.retryAssert(async () => {
      const actualValue = await this.element.getAttribute(attributeName);
      AssertHelper.notInclude(actualValue, expectedSubstring);
    }, `Expected element not to have attribute "${attributeName}" containing "${expectedSubstring}"`);
  }

  /**
   * Assert that the element does not have the specified CSS class
   */
  async toNotHaveClass(className: string): Promise<void> {
    await this.retryAssert(async () => {
      const classAttribute = await this.element.getAttribute('class');
      const classes = classAttribute ? classAttribute.split(/\s+/) : [];
      AssertHelper.notInclude(classes, className);
    }, `Expected element not to have CSS class "${className}"`);
  }

  /**
   * Assert that the element's value attribute does not equal the expected value
   */
  async toNotHaveValue(expectedValue: string): Promise<void> {
    await this.toNotHaveAttribute('value', expectedValue);
  }

  /**
   * Assert that the element's value attribute does not contain the expected substring
   */
  async toNotHaveValueContaining(expectedSubstring: string): Promise<void> {
    await this.toNotHaveAttributeContaining('value', expectedSubstring);
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
 * Non-retry assertion for values - synchronous like Playwright's expect
 * Performs immediate assertions on resolved values
 * Usage: expectValue(await getTodoCount()).toBe(3)
 */
export function expectValue<T>(actualValue: T) {
  return {
    toBe: (expected: T, message?: string) => {
      try {
        AssertHelper.equal(actualValue, expected);
      } catch (err) {
        const error = new Error(message || `Expected ${actualValue} to equal ${expected}`);
        if (err instanceof Error) {
          error.message += `\n${err.message}`;
        }
        throw error;
      }
    },

    toEqual: (expected: T, message?: string) => {
      try {
        AssertHelper.equal(actualValue, expected);
      } catch (err) {
        const error = new Error(message || `Expected ${actualValue} to equal ${expected}`);
        if (err instanceof Error) {
          error.message += `\n${err.message}`;
        }
        throw error;
      }
    },

    toNotBe: (expected: T, message?: string) => {
      try {
        AssertHelper.notEqual(actualValue, expected);
      } catch (err) {
        const error = new Error(message || `Expected ${actualValue} not to equal ${expected}`);
        if (err instanceof Error) {
          error.message += `\n${err.message}`;
        }
        throw error;
      }
    },

    toInclude: (expected: any, message?: string) => {
      try {
        AssertHelper.include(actualValue as any, expected);
      } catch (err) {
        const error = new Error(message || `Expected ${actualValue} to include ${expected}`);
        if (err instanceof Error) {
          error.message += `\n${err.message}`;
        }
        throw error;
      }
    },

    toNotInclude: (expected: any, message?: string) => {
      try {
        AssertHelper.notInclude(actualValue as any, expected);
      } catch (err) {
        const error = new Error(message || `Expected ${actualValue} not to include ${expected}`);
        if (err instanceof Error) {
          error.message += `\n${err.message}`;
        }
        throw error;
      }
    },

    toHaveMembers: (expected: any[], message?: string) => {
      try {
        AssertHelper.hasMembers(actualValue as any[], expected);
      } catch (err) {
        const error = new Error(message || `Expected ${actualValue} to have members ${expected}`);
        if (err instanceof Error) {
          error.message += `\n${err.message}`;
        }
        throw error;
      }
    },

    toBeTrue: (message?: string) => {
      try {
        AssertHelper.isTrue(actualValue);
      } catch (err) {
        const error = new Error(message || `Expected ${actualValue} to be true`);
        if (err instanceof Error) {
          error.message += `\n${err.message}`;
        }
        throw error;
      }
    },

    toBeFalse: (message?: string) => {
      try {
        AssertHelper.isFalse(actualValue);
      } catch (err) {
        const error = new Error(message || `Expected ${actualValue} to be false`);
        if (err instanceof Error) {
          error.message += `\n${err.message}`;
        }
        throw error;
      }
    }
  };
}

/**
 * Assertion functions for use with expectValue
 * These provide a clean API without exposing AssertHelper directly
 */
export const assertions = {
  equal: (expected: any) => (actual: any) => AssertHelper.equal(actual, expected),
  notEqual: (expected: any) => (actual: any) => AssertHelper.notEqual(actual, expected),
  include: (expected: any) => (actual: any) => AssertHelper.include(actual, expected),
  notInclude: (expected: any) => (actual: any) => AssertHelper.notInclude(actual, expected),
  hasMembers: (expected: any[]) => (actual: any[]) => AssertHelper.hasMembers(actual, expected),
  isTrue: (actual: any) => AssertHelper.isTrue(actual),
  isFalse: (actual: any) => AssertHelper.isFalse(actual),
};

