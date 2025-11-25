/**
 * SaniumTS Assertion Library
 * 
 * Unified expect() function for:
 * - SanElement (auto-retry)
 * - WebDriver (auto-retry)
 * - BasePage (auto-retry page assertions)
 * - Values (immediate)
 */

import { WebDriver } from 'selenium-webdriver';
import SanElement from '@core/elements/SanElement';
import { BasePage } from '@pages/BasePage';
import { SanElementAssertion } from '@assertion/SanElementAssertion';
import { SanPageAssertion } from '@assertion/SanPageAssertion';
import { TypeAssertion } from '@assertion/TypeAssertion';

export function expect(target: SanElement, timeout?: number): SanElementAssertion;
export function expect(target: WebDriver, timeout?: number): SanPageAssertion;
export function expect(target: BasePage, timeout?: number): SanPageAssertion;
export function expect<T>(target: T): TypeAssertion<T>;

export function expect<T>(
  target: SanElement | WebDriver | BasePage | T,
  timeout?: number
): SanElementAssertion | SanPageAssertion | TypeAssertion<T> {
  if (target instanceof SanElement) {
    return new SanElementAssertion(target, timeout);
  }

  if (target instanceof WebDriver) {
    return new SanPageAssertion(target, timeout);
  }

  if (target instanceof BasePage) {
    // Get driver from the page object and create SanPageAssertion
    return new SanPageAssertion((target as any).driver, timeout);
  }

  // For all other values (including null/undefined), use TypeAssertion
  // This allows explicit testing of null/undefined values if needed
  return new TypeAssertion(target);
}
