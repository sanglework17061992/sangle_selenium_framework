import { BasePage } from '../BasePage';

export class FormInteractionsPage extends BasePage {
  // Text Inputs
  get usernameInput() { return this.byId('username'); }
  get emailInput() { return this.byId('email'); }
  get passwordInput() { return this.byId('password'); }
  get textareaInput() { return this.byId('comments'); }
  
  // Checkboxes
  get newsletterCheckbox() { return this.byId('newsletter'); }
  
  // Radio Buttons
  get genderMale() { return this.byId('gender-male'); }
  get genderFemale() { return this.byId('gender-female'); }
  get genderOther() { return this.byId('gender-other'); }
  
  // Select Dropdown
  get countrySelect() { return this.byId('country'); }
  
  // File Upload
  get fileInput() { return this.byId('file'); }
  
  // Buttons
  get submitBtn() { return this.byId('submitBtn'); }
  get clearBtn() { return this.byId('clearBtn'); }
  
  // Results
  get formState() { return this.byId('formState'); }
  get submitStatus() { return this.byId('submitStatus'); }

  async fillTextInputs(username: string, email: string, password: string): Promise<void> {
    await this.usernameInput.type(username);
    await this.emailInput.type(email);
    await this.passwordInput.type(password);
  }

  async fillComments(text: string): Promise<void> {
    await this.textareaInput.type(text);
  }

  async checkNewsletter(): Promise<void> {
    await this.newsletterCheckbox.scrollIntoView();
    await this.newsletterCheckbox.check({ force: true });
  }

  async selectGender(gender: 'male' | 'female' | 'other'): Promise<void> {
    const radioMap = {
      male: this.genderMale,
      female: this.genderFemale,
      other: this.genderOther
    };
    const radio = radioMap[gender];
    await radio.scrollIntoView();
    await radio.click({ force: true });
  }

  async selectCountry(country: string): Promise<void> {
    await this.countrySelect.selectByText(country);
  }

  async uploadFile(filePath: string): Promise<void> {
    await this.fileInput.type(filePath);
  }

  async submitForm(): Promise<void> {
    await this.submitBtn.scrollIntoView();
    await this.submitBtn.click({ force: true });
  }

  async clearForm(): Promise<void> {
    await this.clearBtn.scrollIntoView();
    await this.clearBtn.click({ force: true });
  }

  async getFormState(): Promise<string> {
    return await this.formState.getText();
  }

  async getSubmitStatus(): Promise<string> {
    return await this.submitStatus.getText();
  }
}
