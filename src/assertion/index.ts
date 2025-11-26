/**
 * SaniumTS Assertion Library
 * 
 * Unified expect() function for:
 * - SanElement (auto-retry)
 * - WebDriver (auto-retry)
 * - Any object with a driver property (auto-retry page assertions)
 * - Values (immediate)
 */

import { WebDriver } from 'selenium-webdriver';
import SanElement from '@core/elements/SanElement';
import { SanElementAssertion } from '@assertion/SanElementAssertion';
import { SanPageAssertion } from '@assertion/SanPageAssertion';
import { TypeAssertion } from '@assertion/TypeAssertion';

export function expect(target: SanElement, timeout?: number): SanElementAssertion;
export function expect(target: WebDriver, timeout?: number): SanPageAssertion;
export function expect(target: { driver: WebDriver }, timeout?: number): SanPageAssertion;
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

  // Check if target has a driver property that is a WebDriver
  // This works with any object (BasePage, custom page objects, etc.)
  if (target && typeof target === 'object' && 'driver' in target) {
    const driver = (target as any).driver;
    if (driver instanceof WebDriver) {
      return new SanPageAssertion(driver, timeout);
    }
  }

  // For all other values (including null/undefined), use TypeAssertion
  // This allows explicit testing of null/undefined values if needed
  return new TypeAssertion(target);
}
