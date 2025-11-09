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
    await this.showHiddenBtn.click({ force: true });
  }

  async isHiddenButtonVisible(): Promise<boolean> {
    return await this.hiddenBtn.isDisplayed();
  }

  async makeInvisibleVisible(): Promise<void> {
    await this.makeVisibleBtn.click({ force: true });
  }

  async isInvisibleButtonVisible(): Promise<boolean> {
    return await this.invisibleBtn.isDisplayed();
  }

  async makeOpaque(): Promise<void> {
    await this.makeOpaqueBtn.click({ force: true });
  }

  async makeOpacityButtonOpaque(): Promise<void> {
    await this.makeOpaque();
  }

  async isOpacityButtonVisible(): Promise<boolean> {
    return await this.opacityBtn.isDisplayed();
  }

  async restoreSize(): Promise<void> {
    await this.restoreSizeBtn.click({ force: true });
  }

  async restoreZeroSizeButton(): Promise<void> {
    await this.restoreSize();
  }

  async isZeroSizeButtonVisible(): Promise<boolean> {
    return await this.zeroSizeBtn.isDisplayed();
  }

  // Stability Tests
  async stopMoving(): Promise<void> {
    await this.stopMovingBtn.click({ force: true });
  }

  async stopMovement(): Promise<void> {
    await this.stopMoving();
  }

  async isMovingButtonStable(): Promise<boolean> {
    return await this.movingBtn.isDisplayed();
  }

  async clickMovingButton(): Promise<void> {
    await this.movingBtn.click({ force: true });
  }

  async triggerAnimation(): Promise<void> {
    await this.animateBtn.click({ force: true });
  }

  async clickAnimateButton(): Promise<void> {
    await this.triggerAnimation();
  }

  async isAnimationRunning(): Promise<boolean> {
    const container = await this.animatedContainer.raw();
    const className = await container.getAttribute('class');
    return className?.includes('animating') ?? false;
  }

  // Enabled Tests
  async enableDisabledButton(): Promise<void> {
    await this.enableDisabledBtn.click({ force: true });
  }

  async enableDisabledButtonElement(): Promise<void> {
    await this.enableDisabledButton();
  }

  async isDisabledButtonEnabled(): Promise<boolean> {
    return await this.disabledBtn.isEnabled();
  }

  async enableDisabledInput(): Promise<void> {
    await this.enableInputBtn.click({ force: true });
  }

  async enableDisabledInputElement(): Promise<void> {
    await this.enableDisabledInput();
  }

  async isDisabledInputEnabled(): Promise<boolean> {
    return await this.disabledInput.isEnabled();
  }

  async toggleButtonState(): Promise<void> {
    await this.toggleStateBtn.click({ force: true });
  }

  async isToggleButtonEnabled(): Promise<boolean> {
    return await this.toggleBtn.isEnabled();
  }

  // Editable Tests
  async makeReadonlyEditable(): Promise<void> {
    await this.makeEditableBtn.click({ force: true });
  }

  async makeReadonlyInputEditable(): Promise<void> {
    await this.makeReadonlyEditable();
  }

  async isReadonlyInputEditable(): Promise<boolean> {
    const readonly = await this.readonlyInput.getAttribute('readonly');
    return readonly === null;
  }

  async enableDisabledTextarea(): Promise<void> {
    await this.enableTextareaBtn.click({ force: true });
  }

  async enableTextarea(): Promise<void> {
    await this.enableDisabledTextarea();
  }

  async isTextareaEditable(): Promise<boolean> {
    return await this.disabledTextarea.isEnabled();
  }

  async isTextareaEnabled(): Promise<boolean> {
    return await this.isTextareaEditable();
  }

  async toggleReadonlyState(): Promise<void> {
    await this.toggleReadonlyBtn.click({ force: true });
  }

  async isToggleReadonlyInputEditable(): Promise<boolean> {
    const readonly = await this.toggleReadonlyInput.getAttribute('readonly');
    return readonly === null;
  }

  // Pointer Events Tests
  async enablePointerEvents(): Promise<void> {
    await this.enablePointerBtn.click({ force: true });
  }

  async clickNoPointerButton(): Promise<void> {
    await this.noPointerBtn.click({ force: true });
  }

  async removeObscuringLayer(): Promise<void> {
    await this.removeOverlayBtn.click({ force: true });
  }

  async removeOverlay(): Promise<void> {
    await this.removeObscuringLayer();
  }

  async clickObscuredButton(): Promise<void> {
    await this.obscuredBtn.click({ force: true });
  }

  async getAnimatedContainerText(): Promise<string> {
    return await this.animatedContainer.getText();
  }

  async isObscuringLayerVisible(): Promise<boolean> {
    return await this.obscuringLayer.isDisplayed();
  }
}
