/**
 * SaniumTS Assertion Library
 * 
 * Unified expect() function for:
 * - SanElement (auto-retry)
 * - WebDriver (auto-retry)
 * - Values (immediate)
 */

import { WebDriver } from 'selenium-webdriver';
import SanElement from '@core/elements/SanElement';
import { SanElementAssertion } from '@assertion/SanElementAssertion';
import { SanPageAssertion } from '@assertion/SanPageAssertion';
import { TypeAssertion } from '@assertion/TypeAssertion';

export function expect(target: SanElement, timeout?: number): SanElementAssertion;
export function expect(target: WebDriver, timeout?: number): SanPageAssertion;
export function expect<T>(target: T): TypeAssertion<T>;

export function expect<T>(
  target: SanElement | WebDriver | T,
  timeout?: number
): SanElementAssertion | SanPageAssertion | TypeAssertion<T> {
  if (target instanceof SanElement) {
    return new SanElementAssertion(target, timeout);
  }

  if (target instanceof WebDriver) {
    return new SanPageAssertion(target, timeout);
  }

  // For all other values (including null/undefined), use TypeAssertion
  // This allows explicit testing of null/undefined values if needed
  return new TypeAssertion(target);
}
