"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ConfigLoader_1 = require("../src/config/ConfigLoader");
const mocha_1 = require("mocha");
(0, mocha_1.describe)('Configuration Tests', function () {
    (0, mocha_1.it)('should load configuration from .env file', async () => {
        const config = ConfigLoader_1.configLoader.getConfig();
        // Verify browser config
        console.log('Browser config:', config.browser);
        if (config.browser.name !== 'chrome')
            throw new Error('Browser name should be chrome');
        // Verify timeout config
        console.log('Timeout config:', config.timeouts);
        if (config.timeouts.element !== 10000)
            throw new Error('Element timeout should be 10000');
        // Verify app config
        console.log('App config:', config.app);
        if (!config.app.baseUrl.includes('example.com'))
            throw new Error('Base URL should contain example.com');
        console.log('Configuration loaded successfully!');
    });
    (0, mocha_1.it)('should print current configuration', async () => {
        ConfigLoader_1.configLoader.printConfig();
    });
});
