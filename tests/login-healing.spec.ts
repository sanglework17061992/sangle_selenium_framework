/**
 * Login Test - Self-Healing Verification Test
 * 
 * This test demonstrates the self-healing functionality:
 * 1. Test runs with original locators (should pass)
 * 2. Change element IDs in demo-app/public/login.html
 * 3. Run test again → Self-healing triggers!
 * 4. Test still passes with healed locators
 * 
 * HEALING TRIGGER STEPS:
 * 1. Open: demo-app/public/login.html
 * 2. Change: id="username-input" → id="username-field-new"
 * 3. Change: id="password-input" → id="password-field-new"
 * 4. Change: id="login-button" → id="login-btn-new"
 * 5. Run test again
 */

import { describe, it, before, after, beforeEach } from 'mocha';
import { logger } from '@utils/Logger';
import { expect } from 'chai';
import { BaseTest } from '@tests/BaseTest';
import { LoginPage } from '@pages/LoginPage';

class LoginTest extends BaseTest<LoginPage> {
  protected createPage(): LoginPage {
    return new LoginPage();
  }
}

describe('Login Tests - Self-Healing Verification', () => {
  const test = new LoginTest();
  let page: LoginPage;
  let baseUrl: string;

  before(async () => {
    logger.info(`Test Suite Starting`);

    await test.setupDriver();
    page = test.page;
    baseUrl = 'http://localhost:3000';

    logger.info(`Driver initialized`);
    logger.info(`Base URL: ${baseUrl}`);
    logger.info(`Self-Healing: ENABLED`);
  });

  after(async () => {
    logger.info(`Test Suite Completed`);
    await test.teardownDriver();
  });

  beforeEach(async () => {
    await page.open();
    logger.debug(`Navigated to login page`);
  });

  describe('Page Element Visibility', () => {
    it('should display all required form elements', async () => {
      logger.info(`TEST: Page elements are visible`);

      const usernameVisible = await page.isUsernameInputDisplayed();
      const passwordVisible = await page.isPasswordInputDisplayed();
      const loginVisible = await page.isLoginButtonDisplayed();

      logger.debug(`Username input visible: ${usernameVisible}`);
      logger.debug(`Password input visible: ${passwordVisible}`);
      logger.debug(`Login button visible: ${loginVisible}`);

      expect(usernameVisible).to.be.true;
      expect(passwordVisible).to.be.true;
      expect(loginVisible).to.be.true;

      logger.info(`All form elements are visible`);
    });
  });

  describe('Successful Login Flow', () => {
    it('should login successfully with correct credentials', async () => {
      logger.info(`TEST: Login with correct credentials`);
      logger.info(`Username: testuser`);
      logger.info(`Password: password123`);

      await page.login('testuser', 'password123');
      logger.debug(`Login action completed`);

      await page.waitForSuccessMessage(5000);
      logger.debug(`Success message appeared`);

      const message = await page.getSuccessMessage();
      logger.debug(`Message text: "${message}"`);

      expect(message).to.include('successful');
      logger.info(`Login successful - message verified`);
    });
  });

  describe('Failed Login Flow', () => {
    it('should reject login with incorrect credentials', async () => {
      logger.info(`TEST: Login with incorrect credentials`);
      logger.info(`Username: testuser`);
      logger.info(`Password: wrongpassword`);

      await page.login('testuser', 'wrongpassword');
      logger.debug(`Login action completed`);

      await page.waitForErrorMessage(5000);
      logger.debug(`Error message appeared`);

      const message = await page.getErrorMessage();
      logger.debug(`Message text: "${message}"`);

      expect(message).to.include('Invalid');
      logger.info(`Login rejected as expected - error message verified`);
    });
  });

  describe('Self-Healing Verification', () => {
    it('should demonstrate self-healing when element IDs are changed', async () => {
      logger.info(`TEST: Self-Healing Functionality`);
      logger.info(`HEALING VERIFICATION STEPS:`);
      logger.info(`1. First run with original HTML - should PASS`);
      logger.info(`2. Edit: demo-app/public/login.html`);
      logger.info(`3. Change element IDs (see HEALING TRIGGER STEPS in comments)`);
      logger.info(`4. Run test again - should PASS again with HEALING`);

      const usernameVisible = await page.isUsernameInputDisplayed();
      expect(usernameVisible).to.be.true;

      logger.info(`If element locator fails, self-healing will:`);
      logger.info(`1. Try configured fallback locators`);
      logger.info(`2. Extract hints from original locator`);
      logger.info(`3. Scan DOM for matching elements`);
      logger.info(`4. Generate candidate locators`);
      logger.info(`5. Find and return correct element`);
      logger.info(`6. Update config with new locator`);
      logger.info(`Self-healing infrastructure is ready`);
    });
  });

  describe('Complete Login Flow', () => {
    it('should complete full login flow from start to finish', async () => {
      logger.info(`TEST: Complete login workflow`);

      logger.debug(`Navigating to login page`);
      await page.open();

      // Step 2: Verify page elements
      logger.debug(`  2️⃣  Verifying form elements`);
      const usernameVisible = await page.isUsernameInputDisplayed();
      expect(usernameVisible).to.be.true;

      logger.debug(`Entering credentials`);
      await page.login('testuser', 'password123');

      logger.debug(`Waiting for success message`);
      await page.waitForSuccessMessage(5000);

      logger.debug(`Verifying success message`);
      const message = await page.getSuccessMessage();
      expect(message).to.include('successful');

      logger.info(`Complete login flow passed`);
    });
  });
});
