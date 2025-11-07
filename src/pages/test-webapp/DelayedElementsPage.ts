import { BasePage } from '../BasePage';

export class DelayedElementsPage extends BasePage {
  // Controls
  get delaySlider() { return this.byId('delaySlider'); }
  get delayValue() { return this.byId('delayValue'); }
  get triggerDelayedBtn() { return this.byId('triggerDelayedBtn'); }
  get resetBtn() { return this.byId('resetBtn'); }
  
  // Test Elements
  get delayedButtonContainer() { return this.byId('delayedButtonContainer'); }
  get delayedButton() { return this.byId('delayedButton'); }
  get delayedButtonStatus() { return this.byId('delayedButtonStatus'); }
  
  get triggerInputBtn() { return this.byId('triggerInputBtn'); }
  get delayedInputContainer() { return this.byId('delayedInputContainer'); }
  get delayedInput() { return this.byId('delayedInput'); }
  
  get triggerFadeBtn() { return this.byId('triggerFadeBtn'); }
  get fadeContainer() { return this.byId('fadeContainer'); }
  get fadeTestBtn() { return this.byId('fadeTestBtn'); }
  
  get triggerSlideBtn() { return this.byId('triggerSlideBtn'); }
  get slideContainer() { return this.byId('slideContainer'); }
  get slideTestBtn() { return this.byId('slideTestBtn'); }
  
  get triggerVisibleBtn() { return this.byId('triggerVisibleBtn'); }
  get hiddenElement() { return this.byId('hiddenElement'); }
  get nowVisibleBtn() { return this.byId('nowVisibleBtn'); }
  
  get enableBtn() { return this.byId('enableBtn'); }
  get triggerEnableBtn() { return this.byId('triggerEnableBtn'); }
  
  get results() { return this.byId('results'); }

  async open(): Promise<void> {
    await super.open('http://localhost:3001/delayed-elements');
  }

  async setDelay(milliseconds: number): Promise<void> {
    await this.delaySlider.clear();
    await this.delaySlider.type(milliseconds.toString());
  }

  async getDelayValue(): Promise<string> {
    return await this.delayValue.getText();
  }

  async triggerDelayedButton(): Promise<void> {
    await this.triggerDelayedBtn.scrollIntoView();
    await this.triggerDelayedBtn.click({ force: true });
  }

  async clickDelayedButton(): Promise<void> {
    await this.delayedButton.scrollIntoView();
    await this.delayedButton.click({ force: true });
  }

  async getDelayedButtonStatus(): Promise<string> {
    return await this.delayedButtonStatus.getText();
  }

  async resetAll(): Promise<void> {
    await this.resetBtn.scrollIntoView();
    await this.resetBtn.click({ force: true });
  }
}
