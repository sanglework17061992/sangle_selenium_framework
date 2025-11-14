import { WebElement, ThenableWebDriver } from 'selenium-webdriver';
import { delay, getRemainingTimeout, handleSeleniumError, DEFAULT_RETRY_INTERVAL } from '../../utils/SeleniumUtils';

export enum Check {
  VISIBLE = 'visible',
  STABLE = 'stable',
  ENABLED = 'enabled',
  EDITABLE = 'editable',
}

export interface ActionabilityOptions {
  checks?: readonly Check[];
  timeout?: number;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

const STABILITY_CHECK_INTERVAL = 50;
const STABILITY_REQUIRED_MATCHES = 2;

async function isVisible(element: WebElement): Promise<boolean> {
  try {
    if (!(await element.isDisplayed())) return false;

    const rect = await element.getRect();
    if (rect.width === 0 || rect.height === 0) return false;

    const driver = element.getDriver() as ThenableWebDriver;
    const visibility = await driver.executeScript<string>(
      'return window.getComputedStyle(arguments[0]).visibility;',
      element
    );
    
    return visibility !== 'hidden';
  } catch (error: any) {
    handleSeleniumError(error, 'Visibility check');
    return false;
  }
}

async function isStable(element: WebElement): Promise<boolean> {
  try {
    const boxes: BoundingBox[] = [];
    
    for (let i = 0; i < STABILITY_REQUIRED_MATCHES; i++) {
      const rect = await element.getRect();
      boxes.push({
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      });
      
      if (i < STABILITY_REQUIRED_MATCHES - 1) {
        await delay(STABILITY_CHECK_INTERVAL);
      }
    }

    const first = boxes[0];
    return boxes.every(box => 
      box.x === first.x &&
      box.y === first.y &&
      box.width === first.width &&
      box.height === first.height
    );
  } catch (error: any) {
    handleSeleniumError(error, 'Stability check');
    return false;
  }
}

async function isEnabled(element: WebElement): Promise<boolean> {
  try {
    if (!(await element.isEnabled())) return false;

    const driver = element.getDriver() as ThenableWebDriver;
    const ariaDisabled = await driver.executeScript<boolean>(
      "return arguments[0].getAttribute('aria-disabled') === 'true';",
      element
    );

    return !ariaDisabled;
  } catch (error: any) {
    handleSeleniumError(error, 'Enabled check');
    return false;
  }
}

async function isEditable(element: WebElement): Promise<boolean> {
  try {
    const driver = element.getDriver() as ThenableWebDriver;
    const result = await driver.executeScript<boolean>(
      `
      const el = arguments[0];
      const tagName = el.tagName.toLowerCase();
      const type = el.type ? el.type.toLowerCase() : '';
      const readOnly = el.readOnly;
      const contentEditable = el.contentEditable;
      
      return (
        (tagName === 'input' && ['text', 'password', 'email', 'url', 'tel', 'search', 'number', 'date', 'time', 'datetime-local', 'month', 'week', 'color'].includes(type) && !readOnly) ||
        (tagName === 'textarea' && !readOnly) ||
        contentEditable === 'true'
      );
      `,
      element
    );

    return result;
  } catch (error: any) {
    handleSeleniumError(error, 'Editable check');
    return false;
  }
}

/**
 * Check if element meets all required actionability conditions
 */
export async function checkActionability(element: WebElement, options: ActionabilityOptions): Promise<boolean> {
  const checks = options.checks || [];
  
  for (const check of checks) {
    let passed = false;
    
    switch (check) {
      case Check.VISIBLE:
        passed = await isVisible(element);
        break;
      case Check.STABLE:
        passed = await isStable(element);
        break;
      case Check.ENABLED:
        passed = await isEnabled(element);
        break;
      case Check.EDITABLE:
        passed = await isEditable(element);
        break;
      default:
        throw new Error(`Unknown actionability check: ${check}`);
    }
    
    if (!passed) {
      return false;
    }
  }
  
  return true;
}

/**
 * Wait for element to become actionable according to specified requirements
 */
export async function waitForActionability(element: WebElement, options: ActionabilityOptions): Promise<void> {
  const timeout = options.timeout || 30000;
  const startTime = Date.now();
  
  while (getRemainingTimeout(startTime, timeout) > 0) {
    if (await checkActionability(element, options)) {
      return; // Element is actionable
    }
    
    await delay(DEFAULT_RETRY_INTERVAL);
  }
  
  // Generate error details for timeout
  const failedChecks: string[] = [];
  for (const check of options.checks || []) {
    let passed = false;
    
    try {
      switch (check) {
        case Check.VISIBLE:
          passed = await isVisible(element);
          break;
        case Check.STABLE:
          passed = await isStable(element);
          break;
        case Check.ENABLED:
          passed = await isEnabled(element);
          break;
        case Check.EDITABLE:
          passed = await isEditable(element);
          break;
      }
    } catch (error: any) {
      failedChecks.push(`${check} (error: ${error.message})`);
      continue;
    }
    
    if (!passed) {
      failedChecks.push(check);
    }
  }
  
  throw new Error(
    `Element did not become actionable within ${timeout}ms. ` +
    `Failed checks: ${failedChecks.join(', ')}`
  );
}