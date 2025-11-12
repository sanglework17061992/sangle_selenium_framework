import { describe, it, before, after, beforeEach, afterEach } from 'mocha';
import { FormInteractionsPage } from '../../src/pages/test-webapp/FormInteractionsPage';
import { expect } from '../../src/assertion';
import { BaseTest as GenericBaseTest, MultiReporter } from '../../src/base/BaseTest';
import { createAllureReporter, createMochawesomeReporter } from '../../src/reporters';
import { ThenableWebDriver } from 'selenium-webdriver';
import { configLoader } from '../../src/config/ConfigLoader';

/**
 * FormInteractionsPage test class
 */
class FormInteractionsTest extends GenericBaseTest<FormInteractionsPage> {
  protected createPage(driver: ThenableWebDriver): FormInteractionsPage {
    return new FormInteractionsPage(driver);
  }

  async setupTest(): Promise<void> {
    await super.setupTest(configLoader.getBaseUrl() + 'form-interactions');
  }
}

describe('Test Webapp - Form Interactions', () => {
  const test = new FormInteractionsTest(
    new MultiReporter([
      createAllureReporter(),
      createMochawesomeReporter()
    ])
  );

  before(async () => {
    await test.setupDriver();
  });

  after(async () => {
    await test.teardownDriver();
  });

  beforeEach(async () => {
    await test.setupTest();
  });

  afterEach(async function() {
    await test.teardownTest(this);
  });

  describe('Text Inputs', () => {
    it('should fill all text input fields', async () => {
      await test.page.fillTextInputs('john_doe', 'john@example.com', 'password123');
      
      const username = await test.page.usernameInput.getAttribute('value');
      const email = await test.page.emailInput.getAttribute('value');
      const password = await test.page.passwordInput.getAttribute('value');
      
      expect(username).toBe('john_doe');
      expect(email).toBe('john@example.com');
      expect(password).toBe('password123');
    });

    it('should fill textarea field', async () => {
      await test.page.fillComments('This is a test comment');
      
      const comments = await test.page.textareaInput.getAttribute('value');
      expect(comments).toBe('This is a test comment');
    });
  });

  describe('Checkboxes', () => {
    it('should check newsletter checkbox', async () => {
      await test.page.checkNewsletter();
      
      const isChecked = await test.page.newsletterCheckbox.isChecked();
      expect(isChecked).toBe(true);
    });

    it('should uncheck newsletter checkbox', async () => {
      await test.page.checkNewsletter();
      await test.page.newsletterCheckbox.scrollIntoView();
      await test.page.newsletterCheckbox.uncheck({ force: true });
      
      const isChecked = await test.page.newsletterCheckbox.isChecked();
      expect(isChecked).toBe(false);
    });
  });

  describe('Radio Buttons', () => {
    it('should select male gender', async () => {
      await test.page.selectGender('male');
      
      const isSelected = await test.page.genderMale.isChecked();
      expect(isSelected).toBe(true);
    });

    it('should select female gender', async () => {
      await test.page.selectGender('female');
      
      const isSelected = await test.page.genderFemale.isChecked();
      expect(isSelected).toBe(true);
    });

    it('should select other gender', async () => {
      await test.page.selectGender('other');
      
      const isSelected = await test.page.genderOther.isChecked();
      expect(isSelected).toBe(true);
    });
  });

  describe('Select Dropdown', () => {
    it('should select country from dropdown', async () => {
      await test.page.selectCountry('United States');
      
      const selected = await test.page.countrySelect.getSelectedValue();
      expect(selected).toBe('us');
    });

    it('should select different countries', async () => {
      await test.page.selectCountry('Canada');
      let selected = await test.page.countrySelect.getSelectedValue();
      expect(selected).toBe('ca');

      await test.page.selectCountry('United Kingdom');
      selected = await test.page.countrySelect.getSelectedValue();
      expect(selected).toBe('uk');
    });
  });

  describe('Form Submission', () => {
    it('should submit complete form with all fields', async () => {
      await test.page.fillTextInputs('jane_smith', 'jane@example.com', 'secure123');
      await test.page.fillComments('Great form!');
      await test.page.checkNewsletter();
      await test.page.selectGender('female');
      await test.page.selectCountry('United States');
      
      await test.page.submitForm();
      
      const submitStatus = await test.page.getSubmitStatus();
      expect(submitStatus).toInclude('Form submitted successfully');
    });

    it('should clear form data', async () => {
      await test.page.fillTextInputs('test_user', 'test@test.com', 'test123');
      await test.page.checkNewsletter();
      
      await test.page.clearForm();
      
      const username = await test.page.usernameInput.getAttribute('value');
      const isChecked = await test.page.newsletterCheckbox.isChecked();
      
      expect(username).toBe('');
      expect(isChecked).toBe(false);
    });
  });
});
