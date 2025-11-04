import { Builder } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import firefox from 'selenium-webdriver/firefox.js';
class DefaultChromeFactory {
    async build(options) {
        const opts = new chrome.Options();
        if (options?.headless)
            opts.addArguments('--headless=new');
        if (options?.noSandbox)
            opts.addArguments('--no-sandbox', '--disable-dev-shm-usage');
        return new Builder().forBrowser('chrome').setChromeOptions(opts).build();
    }
}
class DefaultFirefoxFactory {
    async build(options) {
        const opts = new firefox.Options();
        if (options?.headless)
            opts.addArguments('-headless');
        return new Builder().forBrowser('firefox').setFirefoxOptions(opts).build();
    }
}
export class DriverManager {
    static register(name, factory) {
        this.factories.set(name.toLowerCase(), factory);
    }
    static async getDriver(name = 'chrome', options) {
        const factory = this.factories.get(name.toLowerCase());
        if (!factory)
            throw new Error(`No browser registered for: ${name}`);
        return factory.build(options);
    }
}
DriverManager.factories = new Map();
// register defaults
DriverManager.register('chrome', new DefaultChromeFactory());
DriverManager.register('firefox', new DefaultFirefoxFactory());
export default DriverManager;
