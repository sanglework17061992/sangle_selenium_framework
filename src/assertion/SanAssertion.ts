import { SanElement } from '../core/elements/SanElement';
import { configLoader } from '../config/ConfigLoader';
import { AssertHelper } from '../helpers/AssertHelper';

const testConfig = configLoader.getTestConfig();
const DEFAULT_TIMEOUT = 5000; // 5 seconds like Playwright

/**
 * Auto-retrying assertions for SanElement (locators)
 * These assertions will retry until the condition is met or timeout is reached
 * Similar to Playwright's expect(locator).toBeVisible()
 */
export class ElementAssertions {
  private readonly element: SanElement;
  private readonly timeout: number;
  private readonly pollInterval: number = 100; // Poll every 100ms

  constructor(element: SanElement, timeout?: number) {
    this.element = element;
    this.timeout = timeout ?? DEFAULT_TIMEOUT;
  }

  /**
   * Core retry mechanism - waits until condition passes or timeout
   */
  private async waitUntil(
    condition: () => Promise<boolean>,
    errorMessage: string
  ): Promise<void> {
    const startTime = Date.now();
    let lastError: Error | null = null;

    while (Date.now() - startTime < this.timeout) {
      try {
        const result = await condition();
        if (result) {
          return; // Condition passed
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
      
      // Wait before next retry
      await new Promise(resolve => setTimeout(resolve, this.pollInterval));
    }

    // Timeout reached - throw error
    const timeoutMsg = `Timeout ${this.timeout}ms exceeded waiting for ${errorMessage}`;
    if (lastError) {
      throw new Error(`${timeoutMsg}\n${lastError.message}`);
    }
    throw new Error(timeoutMsg);
  }

  /**
   * Assert that the element has the exact text
   */
  async toHaveText(expectedText: string): Promise<void> {
    await this.waitUntil(
      async () => {
        try {
          const actualText = await this.element.getText();
          AssertHelper.equal(actualText.trim(), expectedText);
          return true;
        } catch {
          return false;
        }
      },
      `element to have text "${expectedText}"`
    );
  }

  /**
   * Assert that the element contains the specified text
   */
  async toContainText(expectedSubstring: string): Promise<void> {
    await this.waitUntil(
      async () => {
        try {
          const actualText = await this.element.getText();
          AssertHelper.include(actualText.trim(), expectedSubstring);
          return true;
        } catch {
          return false;
        }
      },
      `element to contain text "${expectedSubstring}"`
    );
  }

  /**
   * Assert that the element has the specified attribute with the expected value
   */
  async toHaveAttribute(attributeName: string, expectedValue: string): Promise<void> {
    await this.waitUntil(
      async () => {
        try {
          const actualValue = await this.element.getAttribute(attributeName);
          AssertHelper.equal(actualValue, expectedValue);
          return true;
        } catch {
          return false;
        }
      },
      `element to have attribute "${attributeName}" with value "${expectedValue}"`
    );
  }

  /**
   * Assert that the element is visible
   */
  async toBeVisible(): Promise<void> {
    await this.waitUntil(
      async () => {
        try {
          return await this.element.isDisplayed();
        } catch {
          return false;
        }
      },
      'element to be visible'
    );
  }

  /**
   * Assert that the element is hidden (not visible)
   */
  async toBeHidden(): Promise<void> {
    await this.waitUntil(
      async () => {
        try {
          const isVisible = await this.element.isDisplayed();
          return !isVisible;
        } catch {
          // Element not found = hidden
          return true;
        }
      },
      'element to be hidden'
    );
  }

  /**
   * Assert that the element is enabled
   */
  async toBeEnabled(): Promise<void> {
    await this.waitUntil(
      async () => {
        try {
          const element = await this.element.raw();
          return await element.isEnabled();
        } catch {
          return false;
        }
      },
      'element to be enabled'
    );
  }

  /**
   * Assert that the element is disabled
   */
  async toBeDisabled(): Promise<void> {
    await this.waitUntil(
      async () => {
        try {
          const element = await this.element.raw();
          const isEnabled = await element.isEnabled();
          return !isEnabled;
        } catch {
          return false;
        }
      },
      'element to be disabled'
    );
  }

  /**
   * Assert that the element is editable (enabled and not readonly)
   */
  async toBeEditable(): Promise<void> {
    await this.waitUntil(
      async () => {
        try {
          const element = await this.element.raw();
          const isEnabled = await element.isEnabled();
          const readonlyAttr = await element.getAttribute('readonly');
          return isEnabled && !readonlyAttr;
        } catch {
          return false;
        }
      },
      'element to be editable'
    );
  }

  /**
   * Assert that the element is checked (for checkboxes/radio buttons)
   */
  async toBeChecked(): Promise<void> {
    await this.waitUntil(
      async () => {
        try {
          const element = await this.element.raw();
          return await element.isSelected();
        } catch {
          return false;
        }
      },
      'element to be checked'
    );
  }

  /**
   * Assert that the element is unchecked
   */
  async toBeUnchecked(): Promise<void> {
    await this.waitUntil(
      async () => {
        try {
          const element = await this.element.raw();
          const isChecked = await element.isSelected();
          return !isChecked;
        } catch {
          return false;
        }
      },
      'element to be unchecked'
    );
  }

  /**
   * Assert that the element is attached to the DOM
   */
  async toBeAttached(): Promise<void> {
    await this.waitUntil(
      async () => {
        try {
          await this.element.raw();
          return true;
        } catch {
          return false;
        }
      },
      'element to be attached'
    );
  }

  /**
   * Assert that the element has the specified CSS class
   */
  async toHaveClass(className: string): Promise<void> {
    await this.waitUntil(
      async () => {
        try {
          const classAttribute = await this.element.getAttribute('class');
          const classes = classAttribute ? classAttribute.split(/\s+/) : [];
          AssertHelper.include(classes, className);
          return true;
        } catch {
          return false;
        }
      },
      `element to have CSS class "${className}"`
    );
  }

  /**
   * Assert that the element's value attribute equals the expected value
   */
  async toHaveValue(expectedValue: string): Promise<void> {
    await this.toHaveAttribute('value', expectedValue);
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

