/**
 * SaniumTS Assertion Library - Main Entry Point
 * 
 * This module provides a unified expect() function that works with:
 * - SanElement (auto-retry element assertions)
 * - WebDriver (auto-retry page assertions)
 * - Values (immediate type assertions)
 * 
 * The expect() function intelligently routes to the appropriate assertion class
 * based on the type of the input, providing a seamless API similar to Playwright.
 * 
 * @example
 * // Element assertions (auto-retry)
 * await expect(element).toHaveText('Welcome');
 * await expect(element).toBeVisible();
 * 
 * // Page assertions (auto-retry)
 * await expect(driver).toHaveTitle('Dashboard');
 * await expect(driver).toHaveURL('https://example.com');
 * 
 * // Value assertions (immediate)
 * expect(count).toBe(5);
 * expect(items).toEqual([1, 2, 3]);
 */

import { WebDriver } from 'selenium-webdriver';
import SanElement from '@core/elements/SanElement';
import { SanElementAssertion } from '@assertion/SanElementAssertion';
import { SanPageAssertion } from '@assertion/SanPageAssertion';
import { TypeAssertion } from '@assertion/TypeAssertion';

// Overload 1: SanElement -> SanElementAssertion (auto-retry)
export function expect(target: SanElement, timeout?: number): SanElementAssertion;

// Overload 2: WebDriver -> SanPageAssertion (auto-retry)
export function expect(target: WebDriver, timeout?: number): SanPageAssertion;

// Overload 3: Any value -> TypeAssertion (immediate)
export function expect<T>(target: T): TypeAssertion<T>;

// Implementation: Route to the correct assertion class
export function expect<T>(
  target: SanElement | WebDriver | T,
  timeout?: number
): SanElementAssertion | SanPageAssertion | TypeAssertion<T> {
  // Check if target is SanElement
  if (target instanceof SanElement) {
    return new SanElementAssertion(target, timeout);
  }
  
  // Check if target is WebDriver
  if (target instanceof WebDriver) {
    return new SanPageAssertion(target, timeout);
  }
  
  // Otherwise, treat as value assertion
  return new TypeAssertion(target);
}

// Re-exports - Make assertion classes available if needed
export { SanElementAssertion } from '@assertion/SanElementAssertion';
export { SanPageAssertion } from '@assertion/SanPageAssertion';
export { TypeAssertion } from '@assertion/TypeAssertion';

// Export utility functions for advanced usage
export {
  safeAssert,
  waitUntil,
  equal
} from '@assertion/shared/AssertionUtils';
