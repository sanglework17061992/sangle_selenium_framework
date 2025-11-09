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
    await this.openModalBtn.scrollIntoView();
    await this.openModalBtn.click({ force: true });
  }

  async closeModal(): Promise<void> {
    await this.closeModalBtn.scrollIntoView();
    await this.closeModalBtn.click({ force: true });
  }

  async clickTargetButton(): Promise<void> {
    await this.targetBtn.scrollIntoView();
    await this.targetBtn.click({ force: true });
  }

  async isModalVisible(): Promise<boolean> {
    const classes = await this.modal.getAttribute('class');
    return !classes.includes('hidden');
  }

  // Loading overlay methods
  async triggerLoading(): Promise<void> {
    await this.triggerLoadingBtn.scrollIntoView();
    await this.triggerLoadingBtn.click({ force: true });
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
    await this.stackedOverlayBtn.scrollIntoView();
    await this.stackedOverlayBtn.click({ force: true });
  }
}
