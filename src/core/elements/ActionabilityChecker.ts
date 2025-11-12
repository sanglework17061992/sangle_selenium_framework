import { WebElement, ThenableWebDriver } from 'selenium-webdriver';

export interface ActionabilityOptions {
  visible?: boolean;
  stable?: boolean;
  receivesEvents?: boolean;
  enabled?: boolean;
  editable?: boolean;
  timeout?: number;
}

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Constants for retry logic
const STABILITY_CHECK_INTERVAL = 50; // ms between stability checks
const STABILITY_REQUIRED_MATCHES = 2; // consecutive matching boxes
const POLL_INTERVAL = 100; // ms between retries

/**
 * Generic delay helper
 */
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if element is visible (non-empty bounding box, not visibility:hidden)
 * According to Playwright: element has non-empty bounding box and does not have visibility:hidden
 */
export async function isVisible(element: WebElement): Promise<boolean> {
  try {
    // Check if displayed (Selenium built-in)
    if (!(await element.isDisplayed())) return false;

    // Check bounding box is non-empty
    const rect = await element.getRect();
    if (rect.width === 0 || rect.height === 0) return false;

    // Check computed style visibility
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

/**
 * Check if element is stable (same bounding box for consecutive animation frames)
 * Element is stable when it maintains the same bounding box for at least two consecutive checks
 */
export async function isStable(element: WebElement): Promise<boolean> {
  try {
    const boxes: BoundingBox[] = [];
    
    // Collect bounding boxes over time
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

    // Check all boxes are identical
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

/**
 * Check if element receives pointer events (not obscured by other elements)
 * Uses document.elementFromPoint to check if element is the hit target at its center point
 */
export async function receivesEvents(element: WebElement, driver: ThenableWebDriver): Promise<boolean> {
  try {
    const rect = await element.getRect();
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;

    // Use document.elementFromPoint to check hit target at center point
    return await driver.executeScript<boolean>(
      `
      const [el, cx, cy] = arguments;
      const hit = document.elementFromPoint(cx, cy);
      return !!hit && (el === hit || el.contains(hit) || hit.contains(el));
      `,
      element,
      centerX,
      centerY
    );
  } catch {
    return false;
  }
}

/**
 * Check if element is enabled (not disabled)
 * According to Playwright, element is disabled when:
 * - it has [disabled] attribute
 * - it's part of a <fieldset> with [disabled] attribute
 * - it has [aria-disabled=true] attribute
 */
export async function isEnabled(element: WebElement): Promise<boolean> {
  try {
    // Check Selenium's isEnabled (handles disabled attribute and fieldset)
    if (!(await element.isEnabled())) return false;

    // Check aria-disabled
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

/**
 * Check if element is editable (enabled and not readonly)
 * Element is readonly when:
 * - it has [readonly] attribute
 * - it has [aria-readonly=true] attribute with supporting role
 */
export async function isEditable(element: WebElement): Promise<boolean> {
  try {
    // First check if enabled
    if (!(await isEnabled(element))) return false;

    // Check readonly attributes
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

/**
 * Unified requirement mapping - maps check names to their validation functions
 * Each function returns true on success or an error message string on failure
 */
const checkMap = {
  visible: async (el: WebElement, _driver: ThenableWebDriver) =>
    (await isVisible(el)) || 'Element is not visible',
  
  stable: async (el: WebElement, _driver: ThenableWebDriver) =>
    (await isStable(el)) || 'Element is not stable (still animating)',
  
  enabled: async (el: WebElement, _driver: ThenableWebDriver) =>
    (await isEnabled(el)) || 'Element is not enabled (disabled)',
  
  editable: async (el: WebElement, _driver: ThenableWebDriver) =>
    (await isEditable(el)) || 'Element is not editable (readonly or disabled)',
  
  receivesEvents: async (el: WebElement, driver: ThenableWebDriver) =>
    (await receivesEvents(el, driver)) || 'Element does not receive events (obscured by another element)'
} as const;

/**
 * Run all required actionability checks based on options
 * Returns array of error messages (empty if all checks pass)
 */
async function runChecks(
  element: WebElement,
  driver: ThenableWebDriver,
  options: ActionabilityOptions
): Promise<string[]> {
  const errors: string[] = [];

  // Run checks in order, stop at first failure for fail-fast behavior
  for (const [key, checkFn] of Object.entries(checkMap)) {
    if ((options as any)[key]) {
      const result = await checkFn(element, driver);
      if (typeof result === 'string') {
        errors.push(result);
        break; // Early exit on first failure
      }
    }
  }

  return errors;
}

/**
 * Main function: Wait for element to meet actionability requirements
 * Retries checks until timeout is reached or all checks pass
 */
export async function waitForActionability(
  element: WebElement,
  driver: ThenableWebDriver,
  options: ActionabilityOptions
): Promise<void> {
  const timeout = options.timeout ?? 10000;
  const startTime = Date.now();
  let lastErrors: string[] = [];

  while (Date.now() - startTime < timeout) {
    try {
      // Perform all required checks
      const errors = await runChecks(element, driver, options);
      
      // If all checks passed, return successfully
      if (errors.length === 0) {
        return;
      }

      // Store errors for final error message
      lastErrors = errors;

      // Wait before retrying
      await delay(POLL_INTERVAL);
    } catch (error) {
      // Element might have become stale, add to errors and retry
      const errorMsg = error instanceof Error ? error.message : String(error);
      lastErrors = [`Element check failed: ${errorMsg}`];
      await delay(POLL_INTERVAL);
    }
  }

  // Timeout reached, throw error with details
  throw new Error(
    `Timeout waiting for element to be actionable after ${timeout}ms. ` +
    `Failed checks: ${lastErrors.join(', ')}`
  );
}
