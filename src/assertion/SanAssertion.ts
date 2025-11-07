import { SanElement } from '../core/elements/SanElement';
import { configLoader } from '../config/ConfigLoader';
import { AssertHelper } from '../helpers/AssertHelper';
import { BasePage } from '../pages/BasePage';

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
   * Helper method to safely execute assertion logic with try-catch
   * Returns true if assertion passes, false if it fails
   */
  private async safeAssert(assertionFn: () => Promise<void>): Promise<boolean> {
    try {
      await assertionFn();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Assert that the element has the exact text
   */
  async toHaveText(expectedText: string): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const actualText = await this.element.getText();
        AssertHelper.equal(actualText.trim(), expectedText);
      }),
      `element to have text "${expectedText}"`
    );
  }

  /**
   * Assert that the element contains the specified text
   */
  async toContainText(expectedSubstring: string): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const actualText = await this.element.getText();
        AssertHelper.include(actualText.trim(), expectedSubstring);
      }),
      `element to contain text "${expectedSubstring}"`
    );
  }

  /**
   * Assert that the element has the specified attribute with the expected value
   */
  async toHaveAttribute(attributeName: string, expectedValue: string): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const actualValue = await this.element.getAttribute(attributeName);
        AssertHelper.equal(actualValue, expectedValue);
      }),
      `element to have attribute "${attributeName}" with value "${expectedValue}"`
    );
  }

  /**
   * Assert that the element is visible
   */
  async toBeVisible(): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const isVisible = await this.element.isDisplayed();
        if (!isVisible) throw new Error('Element is not visible');
      }),
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
      () => this.safeAssert(async () => {
        const element = await this.element.raw();
        const isEnabled = await element.isEnabled();
        if (!isEnabled) throw new Error('Element is not enabled');
      }),
      'element to be enabled'
    );
  }

  /**
   * Assert that the element is disabled
   */
  async toBeDisabled(): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const element = await this.element.raw();
        const isEnabled = await element.isEnabled();
        if (isEnabled) throw new Error('Element is not disabled');
      }),
      'element to be disabled'
    );
  }

  /**
   * Assert that the element is editable (enabled and not readonly)
   */
  async toBeEditable(): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const element = await this.element.raw();
        const isEnabled = await element.isEnabled();
        const readonlyAttr = await element.getAttribute('readonly');
        if (!isEnabled || readonlyAttr) {
          throw new Error('Element is not editable');
        }
      }),
      'element to be editable'
    );
  }

  /**
   * Assert that the element is checked (for checkboxes/radio buttons)
   */
  async toBeChecked(): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const element = await this.element.raw();
        const isChecked = await element.isSelected();
        if (!isChecked) throw new Error('Element is not checked');
      }),
      'element to be checked'
    );
  }

  /**
   * Assert that the element is unchecked
   */
  async toBeUnchecked(): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const element = await this.element.raw();
        const isChecked = await element.isSelected();
        if (isChecked) throw new Error('Element is checked');
      }),
      'element to be unchecked'
    );
  }

  /**
   * Assert that the element is attached to the DOM
   */
  async toBeAttached(): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        await this.element.raw();
      }),
      'element to be attached'
    );
  }

  /**
   * Assert that the element has the specified CSS class
   */
  async toHaveClass(className: string): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const classAttribute = await this.element.getAttribute('class');
        const classes = classAttribute ? classAttribute.split(/\s+/) : [];
        AssertHelper.include(classes, className);
      }),
      `element to have CSS class "${className}"`
    );
  }

  /**
   * Assert that the element's value attribute equals the expected value
   */
  async toHaveValue(expectedValue: string): Promise<void> {
    await this.toHaveAttribute('value', expectedValue);
  }

  /**
   * Assert that the element has the specified ID
   */
  async toHaveId(expectedId: string): Promise<void> {
    await this.toHaveAttribute('id', expectedId);
  }

  /**
   * Assert that the element has the specified CSS property with expected value
   */
  async toHaveCSS(propertyName: string, expectedValue: string): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const element = await this.element.raw();
        const actualValue = await element.getCssValue(propertyName);
        AssertHelper.equal(actualValue, expectedValue);
      }),
      `element to have CSS property "${propertyName}" with value "${expectedValue}"`
    );
  }

  /**
   * Assert that the element has the specified JavaScript property with expected value
   */
  async toHaveJSProperty(propertyName: string, expectedValue: any): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const element = await this.element.raw();
        const driver = this.element['driver'];
        const actualValue = await driver.executeScript(
          `return arguments[0].${propertyName};`,
          element
        );
        AssertHelper.equal(actualValue, expectedValue);
      }),
      `element to have JS property "${propertyName}" with value "${expectedValue}"`
    );
  }

  /**
   * Assert that the element is focused
   */
  async toBeFocused(): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const element = await this.element.raw();
        const driver = this.element['driver'];
        const activeElement = await driver.switchTo().activeElement();
        const isSame = await driver.executeScript(
          'return arguments[0] === arguments[1];',
          element,
          activeElement
        );
        if (!isSame) throw new Error('Element is not focused');
      }),
      'element to be focused'
    );
  }

  /**
   * Assert that the element is empty (no text content)
   */
  async toBeEmpty(): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const text = await this.element.getText();
        AssertHelper.equal(text.trim(), '');
      }),
      'element to be empty'
    );
  }

  /**
   * Assert that the element is in the viewport
   */
  async toBeInViewport(): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const element = await this.element.raw();
        const driver = this.element['driver'];
        const isInViewport = await driver.executeScript(`
          const rect = arguments[0].getBoundingClientRect();
          return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
          );
        `, element);
        if (!isInViewport) throw new Error('Element is not in viewport');
      }),
      'element to be in viewport'
    );
  }

  /**
   * Assert that elements matching the locator have the expected count
   */
  async toHaveCount(expectedCount: number): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const count = await this.element.count();
        AssertHelper.equal(count, expectedCount);
      }),
      `elements to have count ${expectedCount}`
    );
  }

  /**
   * Assert that select element has the specified values selected (for multi-select)
   */
  async toHaveValues(expectedValues: string[]): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const element = await this.element.raw();
        const driver = this.element['driver'];
        const actualValues = await driver.executeScript(`
          const select = arguments[0];
          const selectedOptions = Array.from(select.selectedOptions);
          return selectedOptions.map(opt => opt.value);
        `, element);
        AssertHelper.hasMembers(actualValues as string[], expectedValues);
      }),
      `element to have values ${JSON.stringify(expectedValues)}`
    );
  }
}

/**
 * Auto-retrying assertions for BasePage (page-level checks)
 * These assertions will retry until the condition is met or timeout is reached
 * Similar to Playwright's expect(page).toHaveTitle()
 */
export class PageAssertions {
  private readonly page: BasePage;
  private readonly timeout: number;
  private readonly pollInterval: number = 100; // Poll every 100ms

  constructor(page: BasePage, timeout?: number) {
    this.page = page;
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
   * Helper method to safely execute assertion logic with try-catch
   * Returns true if assertion passes, false if it fails
   */
  private async safeAssert(assertionFn: () => Promise<void>): Promise<boolean> {
    try {
      await assertionFn();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Assert that the page has the expected title (exact match)
   */
  async toHaveTitle(expectedTitle: string): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const driver = this.page['driver'];
        const actualTitle = await driver.getTitle();
        AssertHelper.equal(actualTitle, expectedTitle);
      }),
      `page to have title "${expectedTitle}"`
    );
  }

  /**
   * Assert that the page title contains the expected substring
   */
  async toHaveTitleContaining(expectedSubstring: string): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const driver = this.page['driver'];
        const actualTitle = await driver.getTitle();
        AssertHelper.include(actualTitle, expectedSubstring);
      }),
      `page title to contain "${expectedSubstring}"`
    );
  }

  /**
   * Assert that the page title matches the expected regex pattern
   */
  async toHaveTitleMatching(pattern: RegExp): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const driver = this.page['driver'];
        const actualTitle = await driver.getTitle();
        if (!pattern.test(actualTitle)) {
          throw new Error(`Title "${actualTitle}" does not match pattern ${pattern}`);
        }
      }),
      `page title to match pattern ${pattern}`
    );
  }

  /**
   * Assert that the page has the expected URL (exact match)
   */
  async toHaveURL(expectedUrl: string): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const driver = this.page['driver'];
        const actualUrl = await driver.getCurrentUrl();
        AssertHelper.equal(actualUrl, expectedUrl);
      }),
      `page to have URL "${expectedUrl}"`
    );
  }

  /**
   * Assert that the page URL contains the expected substring
   */
  async toHaveURLContaining(expectedSubstring: string): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const driver = this.page['driver'];
        const actualUrl = await driver.getCurrentUrl();
        AssertHelper.include(actualUrl, expectedSubstring);
      }),
      `page URL to contain "${expectedSubstring}"`
    );
  }

  /**
   * Assert that the page URL matches the expected regex pattern
   */
  async toHaveURLMatching(pattern: RegExp): Promise<void> {
    await this.waitUntil(
      () => this.safeAssert(async () => {
        const driver = this.page['driver'];
        const actualUrl = await driver.getCurrentUrl();
        if (!pattern.test(actualUrl)) {
          throw new Error(`URL "${actualUrl}" does not match pattern ${pattern}`);
        }
      }),
      `page URL to match pattern ${pattern}`
    );
  }
}

/**
 * Create fluent assertions for a SanElement
 * Usage: expect(element).toHaveText('expected')
 * 
 * @deprecated Use expect(element) instead
 */
export function expectElement(element: SanElement, timeout?: number): ElementAssertions {
  return new ElementAssertions(element, timeout);
}

/**
 * Non-retry assertion for values - synchronous like Playwright's expect
 * Performs immediate assertions on resolved values
 * Usage: expectValue(await getTodoCount()).toBe(3)
 * 
 * @deprecated Use expect(value) instead
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
 * Value assertions for immediate (non-retrying) checks
 */
class ValueAssertions<T> {
  constructor(private readonly actualValue: T) {}

  toBe(expected: T, message?: string): void {
    try {
      AssertHelper.equal(this.actualValue, expected);
    } catch (err) {
      const error = new Error(message || `Expected ${this.actualValue} to equal ${expected}`);
      if (err instanceof Error) {
        error.message += `\n${err.message}`;
      }
      throw error;
    }
  }

  toEqual(expected: T, message?: string): void {
    this.toBe(expected, message);
  }

  toNotBe(expected: T, message?: string): void {
    try {
      AssertHelper.notEqual(this.actualValue, expected);
    } catch (err) {
      const error = new Error(message || `Expected ${this.actualValue} not to equal ${expected}`);
      if (err instanceof Error) {
        error.message += `\n${err.message}`;
      }
      throw error;
    }
  }

  toInclude(expected: any, message?: string): void {
    try {
      AssertHelper.include(this.actualValue as any, expected);
    } catch (err) {
      const error = new Error(message || `Expected ${this.actualValue} to include ${expected}`);
      if (err instanceof Error) {
        error.message += `\n${err.message}`;
      }
      throw error;
    }
  }

  toNotInclude(expected: any, message?: string): void {
    try {
      AssertHelper.notInclude(this.actualValue as any, expected);
    } catch (err) {
      const error = new Error(message || `Expected ${this.actualValue} not to include ${expected}`);
      if (err instanceof Error) {
        error.message += `\n${err.message}`;
      }
      throw error;
    }
  }

  toHaveMembers(expected: any[], message?: string): void {
    try {
      AssertHelper.hasMembers(this.actualValue as any[], expected);
    } catch (err) {
      const error = new Error(message || `Expected ${this.actualValue} to have members ${expected}`);
      if (err instanceof Error) {
        error.message += `\n${err.message}`;
      }
      throw error;
    }
  }

  toBeTrue(message?: string): void {
    try {
      AssertHelper.isTrue(this.actualValue);
    } catch (err) {
      const error = new Error(message || `Expected ${this.actualValue} to be true`);
      if (err instanceof Error) {
        error.message += `\n${err.message}`;
      }
      throw error;
    }
  }

  toBeFalse(message?: string): void {
    try {
      AssertHelper.isFalse(this.actualValue);
    } catch (err) {
      const error = new Error(message || `Expected ${this.actualValue} to be false`);
      if (err instanceof Error) {
        error.message += `\n${err.message}`;
      }
      throw error;
    }
  }

  toBeGreaterThan(expected: number, message?: string): void {
    try {
      AssertHelper.greaterThan(this.actualValue as any, expected);
    } catch (err) {
      const error = new Error(message || `Expected ${this.actualValue} to be greater than ${expected}`);
      if (err instanceof Error) {
        error.message += `\n${err.message}`;
      }
      throw error;
    }
  }

  toBeLessThan(expected: number, message?: string): void {
    try {
      AssertHelper.lessThan(this.actualValue as any, expected);
    } catch (err) {
      const error = new Error(message || `Expected ${this.actualValue} to be less than ${expected}`);
      if (err instanceof Error) {
        error.message += `\n${err.message}`;
      }
      throw error;
    }
  }
}

/**
 * Unified expect function - works with SanElement (auto-retry), BasePage (page-level), and values (immediate)
 * 
 * @example
 * // Auto-retrying element assertions
 * await expect(element).toBeVisible();
 * await expect(element).toHaveText('hello');
 * 
 * // Auto-retrying page assertions
 * await expect(page).toHaveTitle('My Page');
 * await expect(page).toHaveURL('https://example.com');
 * 
 * // Immediate value assertions
 * expect(await page.getCount()).toBe(3);
 * expect(items).toInclude('apple');
 */
export function expect(target: SanElement, timeout?: number): ElementAssertions;
export function expect(target: BasePage, timeout?: number): PageAssertions;
export function expect<T>(target: T): ValueAssertions<T>;
export function expect<T>(target: SanElement | BasePage | T, timeout?: number): ElementAssertions | PageAssertions | ValueAssertions<T> {
  if (target instanceof SanElement) {
    return new ElementAssertions(target, timeout);
  }
  if (target instanceof BasePage) {
    return new PageAssertions(target, timeout);
  }
  return new ValueAssertions(target as T);
}

/**
 * Assertion functions for use with expectValue
 * These provide a clean API without exposing AssertHelper directly
 * 
 * @deprecated Use expect() instead
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
