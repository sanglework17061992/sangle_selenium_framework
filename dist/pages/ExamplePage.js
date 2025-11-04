import { BasePage } from './BasePage.js';
export class ExamplePage extends BasePage {
    constructor() {
        super(...arguments);
        this.title = this.$({ using: 'css', value: 'h1' });
        this.moreInfo = this.$({ using: 'css', value: 'a' });
    }
    async open() {
        await this.driver.get('https://example.com');
    }
}
