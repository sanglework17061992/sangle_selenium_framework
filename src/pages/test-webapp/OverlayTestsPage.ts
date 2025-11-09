import { BasePage } from '../BasePage';

export class OverlayTestsPage extends BasePage {
  // Modal Tests
  get openModalBtn() { return this.byId('openModalBtn'); }
  get closeModalBtn() { return this.byId('closeModalBtn'); }
  get targetBtn() { return this.byId('targetBtn'); }
  get modal() { return this.byId('modal'); }
  
  // Loading Overlay Tests
  get triggerLoadingBtn() { return this.byId('triggerLoadingBtn'); }
  get loadingResult() { return this.byId('loadingResult'); }
  get loadingOverlay() { return this.byId('loadingOverlay'); }
  
  // Stacked Overlays Tests
  get stackedOverlayBtn() { return this.byId('stackedOverlayBtn'); }

  // Modal methods
  async openModal(): Promise<void> {
    await this.openModalBtn.click();
  }

  async closeModal(): Promise<void> {
    await this.closeModalBtn.click();
  }

  async clickTargetButton(): Promise<void> {
    await this.targetBtn.click();
  }

  async isModalVisible(): Promise<boolean> {
    const classes = await this.modal.getAttribute('class');
    return !classes.includes('hidden');
  }

  // Loading overlay methods
  async triggerLoading(): Promise<void> {
    await this.triggerLoadingBtn.click();
  }

  async getLoadingResult(): Promise<string> {
    return await this.loadingResult.getText();
  }

  async isLoadingOverlayVisible(): Promise<boolean> {
    const classes = await this.loadingOverlay.getAttribute('class');
    return !classes.includes('hidden');
  }

  // Stacked overlays methods
  async showStackedOverlays(): Promise<void> {
    await this.stackedOverlayBtn.click();
  }
}
