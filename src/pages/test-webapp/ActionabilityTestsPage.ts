import { BasePage } from '../BasePage';

export class ActionabilityTestsPage extends BasePage {
  // Visibility Test Elements
  get hiddenBtn() { return this.byId('hiddenBtn'); }
  get showHiddenBtn() { return this.byId('showHiddenBtn'); }
  get invisibleBtn() { return this.byId('invisibleBtn'); }
  get makeVisibleBtn() { return this.byId('makeVisibleBtn'); }
  get opacityBtn() { return this.byId('opacityBtn'); }
  get makeOpaqueBtn() { return this.byId('makeOpaqueBtn'); }
  get zeroSizeBtn() { return this.byId('zeroSizeBtn'); }
  get restoreSizeBtn() { return this.byId('restoreSizeBtn'); }

  // Stability Test Elements
  get movingBtn() { return this.byId('movingBtn'); }
  get stopMovingBtn() { return this.byId('stopMovingBtn'); }
  get animateBtn() { return this.byId('animateBtn'); }
  get animatedContainer() { return this.byId('animatedContainer'); }

  // Enabled Test Elements
  get disabledBtn() { return this.byId('disabledBtn'); }
  get enableDisabledBtn() { return this.byId('enableDisabledBtn'); }
  get disabledInput() { return this.byId('disabledInput'); }
  get enableInputBtn() { return this.byId('enableInputBtn'); }
  get toggleBtn() { return this.byId('toggleBtn'); }
  get toggleStateBtn() { return this.byId('toggleStateBtn'); }

  // Editable Test Elements
  get readonlyInput() { return this.byId('readonlyInput'); }
  get makeEditableBtn() { return this.byId('makeEditableBtn'); }
  get disabledTextarea() { return this.byId('disabledTextarea'); }
  get enableTextareaBtn() { return this.byId('enableTextareaBtn'); }
  get toggleReadonlyInput() { return this.byId('toggleReadonlyInput'); }
  get toggleReadonlyBtn() { return this.byId('toggleReadonlyBtn'); }

  // Pointer Events Test Elements
  get noPointerBtn() { return this.byId('noPointerBtn'); }
  get enablePointerBtn() { return this.byId('enablePointerBtn'); }
  get obscuredBtn() { return this.byId('obscuredBtn'); }
  get removeOverlayBtn() { return this.byId('removeOverlayBtn'); }
  get obscuredContainer() { return this.byId('obscuredContainer'); }
  get obscuringLayer() { return this.byId('obscuringLayer'); }
  get multiIssueBtn() { return this.byId('multiIssueBtn'); }

  // Visibility Tests
  async showHiddenElement(): Promise<void> {
    await this.showHiddenBtn.scrollIntoView();
    await this.showHiddenBtn.click({ force: true });
  }

  async isHiddenButtonVisible(): Promise<boolean> {
    return await this.hiddenBtn.isDisplayed();
  }

  async makeInvisibleVisible(): Promise<void> {
    await this.makeVisibleBtn.scrollIntoView();
    await this.makeVisibleBtn.click({ force: true });
  }

  async isInvisibleButtonVisible(): Promise<boolean> {
    return await this.invisibleBtn.isDisplayed();
  }

  async makeOpacityButtonOpaque(): Promise<void> {
    await this.makeOpaqueBtn.scrollIntoView();
    await this.makeOpaqueBtn.click({ force: true });
  }

  async isOpacityButtonVisible(): Promise<boolean> {
    return await this.opacityBtn.isDisplayed();
  }

  async restoreZeroSizeButton(): Promise<void> {
    await this.restoreSizeBtn.scrollIntoView();
    await this.restoreSizeBtn.click({ force: true });
  }

  async isZeroSizeButtonVisible(): Promise<boolean> {
    return await this.zeroSizeBtn.isDisplayed();
  }

  // Stability Tests
  async stopMovement(): Promise<void> {
    await this.stopMovingBtn.scrollIntoView();
    await this.stopMovingBtn.click({ force: true });
  }

  async clickMovingButton(): Promise<void> {
    await this.movingBtn.scrollIntoView();
    await this.movingBtn.click({ force: true });
  }

  async clickAnimateButton(): Promise<void> {
    await this.animateBtn.scrollIntoView();
    await this.animateBtn.click({ force: true });
  }

  async getAnimatedContainerText(): Promise<string> {
    return await this.animatedContainer.getText();
  }

  // Enabled Tests
  async enableDisabledButtonElement(): Promise<void> {
    await this.enableDisabledBtn.scrollIntoView();
    await this.enableDisabledBtn.click({ force: true });
  }

  async isDisabledButtonEnabled(): Promise<boolean> {
    return await this.disabledBtn.isEnabled();
  }

  async enableDisabledInputElement(): Promise<void> {
    await this.enableInputBtn.scrollIntoView();
    await this.enableInputBtn.click({ force: true });
  }

  async isDisabledInputEnabled(): Promise<boolean> {
    return await this.disabledInput.isEnabled();
  }

  async toggleButtonState(): Promise<void> {
    await this.toggleStateBtn.scrollIntoView();
    await this.toggleStateBtn.click({ force: true });
  }

  async isToggleButtonEnabled(): Promise<boolean> {
    return await this.toggleBtn.isEnabled();
  }

  // Editable Tests
  async makeReadonlyInputEditable(): Promise<void> {
    await this.makeEditableBtn.scrollIntoView();
    await this.makeEditableBtn.click({ force: true });
  }

  async isReadonlyInputEditable(): Promise<boolean> {
    const readonly = await this.readonlyInput.getAttribute('readonly');
    return readonly === null || readonly === 'false';
  }

  async enableTextarea(): Promise<void> {
    await this.enableTextareaBtn.scrollIntoView();
    await this.enableTextareaBtn.click({ force: true });
  }

  async isTextareaEnabled(): Promise<boolean> {
    return await this.disabledTextarea.isEnabled();
  }

  async toggleReadonlyState(): Promise<void> {
    await this.toggleReadonlyBtn.scrollIntoView();
    await this.toggleReadonlyBtn.click({ force: true });
  }

  async isToggleReadonlyInputEditable(): Promise<boolean> {
    const readonly = await this.toggleReadonlyInput.getAttribute('readonly');
    return readonly === null || readonly === 'false';
  }

  // Pointer Events Tests
  async enablePointerEvents(): Promise<void> {
    await this.enablePointerBtn.scrollIntoView();
    await this.enablePointerBtn.click({ force: true });
  }

  async clickNoPointerButton(): Promise<void> {
    await this.noPointerBtn.scrollIntoView();
    await this.noPointerBtn.click({ force: true });
  }

  async removeOverlay(): Promise<void> {
    await this.removeOverlayBtn.scrollIntoView();
    await this.removeOverlayBtn.click({ force: true });
  }

  async clickObscuredButton(): Promise<void> {
    await this.obscuredBtn.scrollIntoView();
    await this.obscuredBtn.click({ force: true });
  }

  async isObscuringLayerVisible(): Promise<boolean> {
    return await this.obscuringLayer.isDisplayed();
  }
}
