import { BasePage } from '../BasePage';

export class DynamicContentPage extends BasePage {
  // Add/Remove Elements
  get addElementBtn() { return this.byId('addElementBtn'); }
  get removeElementBtn() { return this.byId('removeElementBtn'); }
  get clearAllBtn() { return this.byId('clearAllBtn'); }
  get dynamicContainer() { return this.byId('dynamicContainer'); }
  
  // Replace Content
  get replaceBtn() { return this.byId('replaceBtn'); }
  get originalContent() { return this.byId('originalContent'); }
  
  // Item List
  get itemInput() { return this.byId('itemInput'); }
  get addItemBtn() { return this.byId('addItemBtn'); }
  get itemList() { return this.byId('itemList'); }
  get itemElements() { return this.byCssAll('#itemList li'); }
  
  async addElement(): Promise<void> {
    await this.addElementBtn.scrollIntoView();
    await this.addElementBtn.click({ force: true });
  }

  async removeElement(): Promise<void> {
    await this.removeElementBtn.scrollIntoView();
    await this.removeElementBtn.click({ force: true });
  }

  async clearAll(): Promise<void> {
    await this.clearAllBtn.scrollIntoView();
    await this.clearAllBtn.click({ force: true });
  }

  async replaceContent(): Promise<void> {
    await this.replaceBtn.scrollIntoView();
    await this.replaceBtn.click({ force: true });
  }

  async addItem(itemName: string): Promise<void> {
    await this.itemInput.scrollIntoView();
    await this.itemInput.type(itemName);
    await this.addItemBtn.click({ force: true });
  }

  async getItemsCount(): Promise<number> {
    try {
      return await this.itemElements.count();
    } catch {
      return 0;
    }
  }

  async getOriginalContentText(): Promise<string> {
    return await this.originalContent.getText();
  }
}
