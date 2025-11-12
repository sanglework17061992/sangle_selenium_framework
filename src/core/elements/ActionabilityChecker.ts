import { WebElement, ThenableWebDriver } from 'selenium-webdriver';

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
const POLL_INTERVAL = 100;

export async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function getRemainingTimeout(startTime: number, totalTimeout: number): number {
  const elapsed = Date.now() - startTime;
  return Math.max(0, totalTimeout - elapsed);
}

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
  } catch {
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
  } catch {
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
  } catch {
    return false;
  }
}

async function isEditable(element: WebElement): Promise<boolean> {
  try {
    if (!(await isEnabled(element))) return false;

    const driver = element.getDriver() as ThenableWebDriver;
    const isReadonly = await driver.executeScript<boolean>(
      `
      const el = arguments[0];
      return el.hasAttribute('readonly') || el.getAttribute('aria-readonly') === 'true';
      `,
      element
    );

    return !isReadonly;
  } catch {
    return false;
  }
}

const checkMap: Record<Check, (el: WebElement, driver: ThenableWebDriver) => Promise<boolean | string>> = {
  [Check.VISIBLE]: async (el: WebElement, _driver: ThenableWebDriver) =>
    (await isVisible(el)) || 'Element is not visible',
  
  [Check.STABLE]: async (el: WebElement, _driver: ThenableWebDriver) =>
    (await isStable(el)) || 'Element is not stable (still animating)',
  
  [Check.ENABLED]: async (el: WebElement, _driver: ThenableWebDriver) =>
    (await isEnabled(el)) || 'Element is not enabled (disabled)',
  
  [Check.EDITABLE]: async (el: WebElement, _driver: ThenableWebDriver) =>
    (await isEditable(el)) || 'Element is not editable (readonly or disabled)',
};

async function runChecks(
  element: WebElement,
  driver: ThenableWebDriver,
  options: ActionabilityOptions
): Promise<string[]> {
  const errors: string[] = [];
  const checksToRun = options.checks || [];

  for (const checkName of checksToRun) {
    const checkFn = checkMap[checkName];
    if (checkFn) {
      const result = await checkFn(element, driver);
      if (typeof result === 'string') {
        errors.push(result);
        break;
      }
    }
  }

  return errors;
}

export async function waitForActionability(
  element: WebElement,
  driver: ThenableWebDriver,
  options: ActionabilityOptions
): Promise<void> {
  const timeout = options.timeout ?? 10000;
  const startTime = Date.now();
  let lastErrors: string[] = [];

  while (getRemainingTimeout(startTime, timeout) > 0) {
    try {
      const errors = await runChecks(element, driver, options);
      
      if (errors.length === 0) {
        return;
      }

      lastErrors = errors;
      await delay(POLL_INTERVAL);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      lastErrors = [`Element check failed: ${errorMsg}`];
      await delay(POLL_INTERVAL);
    }
  }

  throw new Error(
    `Timeout waiting for element to be actionable after ${timeout}ms. ` +
    `Failed checks: ${lastErrors.join(', ')}`
  );
}
