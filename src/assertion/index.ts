/**
 * SaniumTS Assertion Library - Main Entry Point
 * 
 * This module provides a unified expect() function that works with:
 * - SanElement (auto-retry element assertions)
 * - BasePage (auto-retry page assertions)
 * - Values (immediate type assertions)
 * 
 * The expect() function intelligently routes to the appropriate assertion class
 * based on the type of the input, providing a seamless API similar to Playwright.
 * 
 * @example
 * // Element assertions (auto-retry)
 * await expect(element).toBeVisible();
 * await expect(element).toHaveText('Welcome');
 * 
 * // Page assertions (auto-retry)
 * await expect(page).toHaveTitle('Dashboard');
 * await expect(page).toHaveURL('https://example.com');
 * 
 * // Value assertions (immediate)
 * expect(count).toBe(5);
 * expect(items).toInclude('apple');
 * expect(status).toBeTrue();
 */

import { SanElement } from '../core/elements/SanElement';
import { BasePage } from '../pages/BasePage';
import { SanElementAssertion } from './SanElementAssertion';
import { SanPageAssertion } from './SanPageAssertion';
import { TypeAssertion } from './TypeAssertion';

// ============================================================================
// SECTION: Main expect() Function with Overloads
// ============================================================================

/**
 * Unified expect() function - intelligently routes to the correct assertion type
 * 
 * This function uses TypeScript overloads to provide different assertion types
 * based on the input. Users don't need to know about the underlying classes.
 * 
 * @param target - Can be SanElement, BasePage, or any value
 * @param timeout - Optional timeout for auto-retry assertions (element/page only)
 * @returns The appropriate assertion instance
 */

// Overload 1: SanElement -> SanElementAssertion (auto-retry)
export function expect(target: SanElement, timeout?: number): SanElementAssertion;

// Overload 2: BasePage -> SanPageAssertion (auto-retry)
export function expect(target: BasePage, timeout?: number): SanPageAssertion;

// Overload 3: Any value -> TypeAssertion (immediate)
export function expect<T>(target: T): TypeAssertion<T>;

// Implementation: Route to the correct assertion class
export function expect<T>(
  target: SanElement | BasePage | T,
  timeout?: number
): SanElementAssertion | SanPageAssertion | TypeAssertion<T> {
  // Check if target is SanElement
  if (target instanceof SanElement) {
    return new SanElementAssertion(target, timeout);
  }
  
  // Check if target is BasePage
  if (target instanceof BasePage) {
    return new SanPageAssertion(target, timeout);
  }
  
  // Otherwise, treat as value assertion
  return new TypeAssertion(target);
}

// ============================================================================
// SECTION: Re-exports - Make assertion classes available if needed
// ============================================================================

export { SanElementAssertion } from './SanElementAssertion';
export { SanPageAssertion } from './SanPageAssertion';
export { TypeAssertion } from './TypeAssertion';

// Export utility functions for advanced usage
export {
  safeAssert,
  waitUntil,
  DEFAULT_TIMEOUT,
  POLL_INTERVAL,
  equal,
  notEqual,
  include,
  notInclude,
  isTrue,
  isFalse,
  isTruthy,
  isFalsy,
  isNull,
  isNotNull,
  isUndefined,
  isDefined,
  greaterThan,
  lessThan,
  greaterThanOrEqual,
  lessThanOrEqual,
  hasMembers
} from './shared/AssertionUtils';
