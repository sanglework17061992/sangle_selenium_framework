/**
 * Allure Reporting Module for SaniumTS Framework
 *
 * This module provides comprehensive test reporting capabilities using Allure,
 * including screenshots, test steps, attachments, and detailed test execution information.
 *
 * Usage:
 * ```typescript
 * import { AllureReporter, AllureTestHooks } from './reporting';
 *
 * // In test setup
 * AllureTestHooks.setDriver(driver);
 *
 * // In test methods
 * AllureReporter.step('Navigate to login page', async () => {
 *   await page.navigateToLogin();
 * });
 *
 * AllureReporter.attachScreenshot(driver, 'Login page');
 * ```
 */

export { AllureReporter } from './AllureReporter';
export { AllureTestHooks } from './AllureTestHooks';