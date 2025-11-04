import { BasePage } from './BasePage';
import { configLoader } from '../config/ConfigLoader';

export class ExamplePage extends BasePage {
  title = this.$({ using: 'css', value: 'h1' });
  moreInfo = this.$({ using: 'css', value: 'a' });

  async open() {
    const appConfig = configLoader.getAppConfig();
    await this.driver.get(appConfig.baseUrl);
  }
}