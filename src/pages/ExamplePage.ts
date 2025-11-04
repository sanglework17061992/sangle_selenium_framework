import { BasePage } from './BasePage';
import { configLoader } from '../config/ConfigLoader';

export class ExamplePage extends BasePage {
  // Clean and readable locator declarations
  title = this.byCss('h1');
  moreInfo = this.byCss('a');

  // Alternative shorthand syntax (both work the same)
  // title = this.css('h1');
  // moreInfo = this.css('a');

  async open() {
    const appConfig = configLoader.getAppConfig();
    await this.driver.get(appConfig.baseUrl);
  }
}