import { BasePage } from '../BasePage';

export class JavaScriptClickTestsPage extends BasePage {
  // Hidden Element Test
  get hiddenBtn() { return this.byId('hiddenBtn'); }
  get hiddenResult() { return this.byId('hiddenResult'); }
  
  // Invisible Element Test
  get invisibleBtn() { return this.byId('invisibleBtn'); }
  get invisibleResult() { return this.byId('invisibleResult'); }
  
  // Zero Opacity Element Test
  get opacityBtn() { return this.byId('opacityBtn'); }
  get opacityResult() { return this.byId('opacityResult'); }
  
  // Overlayed Element Test
  get overlayedBtn() { return this.byId('overlayedBtn'); }
  get overlayedResult() { return this.byId('overlayedResult'); }
  get blocker() { return this.byId('blocker'); }
  
  // Simple Click Event Test
  get simpleClickElement() { return this.byId('simpleClickElement'); }
  get simpleClickResult() { return this.byId('simpleClickResult'); }
  
  // Full Sequence Event Test
  get fullSequenceElement() { return this.byId('fullSequenceElement'); }
  get fullSequenceResult() { return this.byId('fullSequenceResult'); }
  
  // Complex Event Handler Test
  get complexEventElement() { return this.byId('complexEventElement'); }
  get complexEventResult() { return this.byId('complexEventResult'); }
  
  // Counter Test
  get counterBtn() { return this.byId('counterBtn'); }
  get counterResult() { return this.byId('counterResult'); }

  // Hidden button methods
  async clickHiddenButtonWithJS(fullSequence: boolean = false): Promise<void> {
    await this.hiddenBtn.clickWithJavaScript(undefined, fullSequence);
  }

  async getHiddenResult(): Promise<string> {
    return await this.hiddenResult.getText();
  }

  // Invisible button methods
  async clickInvisibleButtonWithJS(fullSequence: boolean = false): Promise<void> {
    await this.invisibleBtn.clickWithJavaScript(undefined, fullSequence);
  }

  async getInvisibleResult(): Promise<string> {
    return await this.invisibleResult.getText();
  }

  // Zero opacity button methods
  async clickOpacityButtonWithJS(fullSequence: boolean = false): Promise<void> {
    await this.opacityBtn.clickWithJavaScript(undefined, fullSequence);
  }

  async getOpacityResult(): Promise<string> {
    return await this.opacityResult.getText();
  }

  // Overlayed button methods
  async clickOverlayedButtonWithJS(fullSequence: boolean = false): Promise<void> {
    await this.overlayedBtn.clickWithJavaScript(undefined, fullSequence);
  }

  async getOverlayedResult(): Promise<string> {
    return await this.overlayedResult.getText();
  }

  // Simple click event methods
  async clickSimpleClickElementWithJS(fullSequence: boolean = false): Promise<void> {
    await this.simpleClickElement.clickWithJavaScript(undefined, fullSequence);
  }

  async getSimpleClickResult(): Promise<string> {
    return await this.simpleClickResult.getText();
  }

  // Full sequence event methods
  async clickFullSequenceElementWithJS(fullSequence: boolean = false): Promise<void> {
    await this.fullSequenceElement.clickWithJavaScript(undefined, fullSequence);
  }

  async getFullSequenceResult(): Promise<string> {
    return await this.fullSequenceResult.getText();
  }

  // Complex event handler methods
  async clickComplexEventElementWithJS(fullSequence: boolean = false): Promise<void> {
    await this.complexEventElement.clickWithJavaScript(undefined, fullSequence);
  }

  async getComplexEventResult(): Promise<string> {
    return await this.complexEventResult.getText();
  }

  // Counter methods
  async clickCounterButtonWithJS(fullSequence: boolean = false): Promise<void> {
    await this.counterBtn.clickWithJavaScript(undefined, fullSequence);
  }

  async getCounterResult(): Promise<string> {
    return await this.counterResult.getText();
  }
}
