import { configLoader } from '../src/config/ConfigLoader';

import { describe, it } from 'mocha';

describe('Configuration Tests', function() {
  it('should load configuration from .env file', async () => {
    const config = configLoader.getConfig();

    // Verify browser config
    console.log('Browser config:', config.browser);
    if (config.browser.name !== 'chrome') throw new Error('Browser name should be chrome');

    // Verify timeout config
    console.log('Timeout config:', config.timeouts);
    if (config.timeouts.element !== 10000) throw new Error('Element timeout should be 10000');

    // Verify app config
    console.log('App config:', config.app);
    if (!config.app.baseUrl.includes('example.com')) throw new Error('Base URL should contain example.com');

    console.log('Configuration loaded successfully!');
  });

  it('should print current configuration', async () => {
    configLoader.printConfig();
  });
});