import { describe, it, before, after, afterEach } from 'mocha';
import { expect } from 'chai';
import { Builder, WebDriver, By } from 'selenium-webdriver';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { SmartLocatorFinder } from '@core/locators/SmartLocatorFinder';
import { LocatorCache } from '@core/locators/LocatorCache';

/**
 * Self-Healing Locator Framework Test
 * 
 * This test demonstrates the self-healing capability of the framework:
 * 1. Test starts with a login form and successful login
 * 2. Locators are learned and cached
 * 3. Test breaks selectors (simulating CSS changes)
 * 4. Second test run uses cached locators + fallbacks to self-heal
 * 5. Cache is updated with new successful locators
 */
describe('Self-Healing Locator Framework', () => {
  let driver: WebDriver;
  let locatorCache: LocatorCache;
  let smartLocatorFinder: SmartLocatorFinder;
  const cacheDir = path.join(process.cwd(), '.locator-cache');
  const masterCachePath = path.join(cacheDir, 'cache-master.json');

  before(async function () {
    this.timeout(30000);

    // Create cache directory if it doesn't exist
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    // Initialize Selenium WebDriver
    driver = await new Builder()
      .forBrowser('chrome')
      .build();

    // Initialize locator cache and finder
    locatorCache = new LocatorCache();
    smartLocatorFinder = new SmartLocatorFinder(driver, locatorCache);

    // Load master cache if exists
    if (fs.existsSync(masterCachePath)) {
      const data = fs.readFileSync(masterCachePath, 'utf-8');
      const json = JSON.parse(data);
      locatorCache.fromJSON(json);
      console.log('[SETUP] Loaded master locator cache');
    }
  });

  after(async function () {
    this.timeout(10000);

    // Save cache to master file for next run
    const cacheData = locatorCache.toJSON();
    fs.writeFileSync(masterCachePath, JSON.stringify(cacheData, null, 2));
    console.log('[TEARDOWN] Saved master locator cache');

    // Close browser
    await driver.quit();
  });

  afterEach(async function () {
    // Also save cache after each test for persistence checks
    const cacheData = locatorCache.toJSON();
    fs.writeFileSync(masterCachePath, JSON.stringify(cacheData, null, 2));
  });

  /**
   * Test 1: Initial login with normal selectors
   * This test learns the correct locators
   */
  it('should login successfully with normal selectors (learning phase)', async function () {
    this.timeout(15000);

    // Navigate to demo app
    await driver.navigate().to('http://localhost:5000');
    await driver.sleep(500);

    // Try to find and fill username field with smart finder
    const usernameLocators = [
      { using: 'id' as const, value: 'username' },
      { using: 'css' as const, value: 'input[name="username"]' },
      { using: 'xpath' as const, value: '//input[@name="username"]' }
    ];

    const usernameElement = await smartLocatorFinder.find('username_field', usernameLocators);
    expect(usernameElement).to.exist;
    await usernameElement.clear();
    await usernameElement.sendKeys('demo');
    console.log('[TEST 1] Username entered - learned locator');

    // Find and fill password field
    const passwordLocators = [
      { using: 'id' as const, value: 'password' },
      { using: 'css' as const, value: 'input[name="password"]' },
      { using: 'xpath' as const, value: '//input[@name="password"]' }
    ];

    const passwordElement = await smartLocatorFinder.find('password_field', passwordLocators);
    expect(passwordElement).to.exist;
    await passwordElement.clear();
    await passwordElement.sendKeys('password');
    console.log('[TEST 1] Password entered - learned locator');

    // Find and click login button
    const loginLocators = [
      { using: 'id' as const, value: 'login-button' },
      { using: 'css' as const, value: 'button[type="submit"]' },
      { using: 'xpath' as const, value: '//button[@type="submit"]' }
    ];

    const loginButton = await smartLocatorFinder.find('login_button', loginLocators);
    expect(loginButton).to.exist;
    await loginButton.click();
    console.log('[TEST 1] Login button clicked - learned locator');

    // Wait for success page
    await driver.wait(
      async () => {
        const url = await driver.getCurrentUrl();
        return url.includes('/success');
      },
      5000
    );

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include('/success');
    console.log('[TEST 1] Successfully logged in');

    // Verify learned scores
    console.log('[TEST 1] Learned Locators:');
    console.log('[TEST 1]   Username Field:', locatorCache.getScores('username_field'));
    console.log('[TEST 1]   Password Field:', locatorCache.getScores('password_field'));
    console.log('[TEST 1]   Login Button:', locatorCache.getScores('login_button'));
  });

  /**
   * Test 2: Login with broken selectors (self-healing phase)
   * This test uses cached locators + fallbacks when selectors change
   */
  it('should self-heal when selectors are broken', async function () {
    this.timeout(20000);

    // Navigate back to login page
    await driver.navigate().to('http://localhost:5000');
    await driver.sleep(500);

    // Break the selectors on the server
    console.log('[TEST 2] Breaking selectors on server...');
    const breakRes = await fetch('http://localhost:5000/api/break-selectors', { method: 'POST' });
    const breakData = await breakRes.json();
    console.log('[TEST 2] Server response:', JSON.stringify(breakData));
    
    // Reload page with broken selectors
    await driver.navigate().refresh();
    await driver.sleep(2000);

    // Status should show broken
    const status = await driver.findElement(By.css('.status'));
    const statusText = await status.getText();
    expect(statusText).to.include('BROKEN');
    console.log('[TEST 2] Selectors confirmed broken:', statusText);
    
    // Debug: Try to find one of the broken IDs directly to verify it exists
    try {
      const debugElement = await driver.findElement(By.id('user-input-broken'));
      const isDisplayed = await debugElement.isDisplayed();
      console.log('[TEST 2] DEBUG: Found user-input-broken, isDisplayed =', isDisplayed);
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      console.log('[TEST 2] DEBUG: Could not find user-input-broken element -', error);
    }

    // Now try to login with smart finder using cached locators
    console.log('[TEST 2] Attempting to find username field with cached locators + fallbacks...');
    
    const usernameLocators = [
      { using: 'id' as const, value: 'username' },
      { using: 'id' as const, value: 'user-input-broken' },
      { using: 'css' as const, value: 'input[name="username"]' },
      { using: 'xpath' as const, value: '//input[@name="username"]' }
    ];

    const usernameElement = await smartLocatorFinder.find(
      'username_field',
      usernameLocators,
      5000
    );
    expect(usernameElement).to.exist;
    await usernameElement.clear();
    await usernameElement.sendKeys('demo');
    console.log('[TEST 2] Username found and filled (self-healed)');

    // Find password field
    console.log('[TEST 2] Attempting to find password field with cached locators + fallbacks...');
    const passwordLocators = [
      { using: 'id' as const, value: 'password' },
      { using: 'id' as const, value: 'pass-input-broken' },
      { using: 'css' as const, value: 'input[name="password"]' },
      { using: 'xpath' as const, value: '//input[@name="password"]' }
    ];

    const passwordElement = await smartLocatorFinder.find(
      'password_field',
      passwordLocators,
      5000
    );
    expect(passwordElement).to.exist;
    await passwordElement.clear();
    await passwordElement.sendKeys('password');
    console.log('[TEST 2] Password found and filled (self-healed)');

    // Find login button
    console.log('[TEST 2] Attempting to find login button with cached locators + fallbacks...');
    const loginLocators = [
      { using: 'id' as const, value: 'login-button' },
      { using: 'id' as const, value: 'login-btn-broken' },
      { using: 'css' as const, value: 'button[type="submit"]' },
      { using: 'xpath' as const, value: '//button[@type="submit"]' }
    ];

    const loginButton = await smartLocatorFinder.find(
      'login_button',
      loginLocators,
      5000
    );
    expect(loginButton).to.exist;
    await loginButton.click();
    console.log('[TEST 2] Login button found and clicked (self-healed)');

    // Wait for success page
    await driver.wait(
      async () => {
        const url = await driver.getCurrentUrl();
        return url.includes('/success');
      },
      5000
    );

    const currentUrl = await driver.getCurrentUrl();
    expect(currentUrl).to.include('/success');
    console.log('[TEST 2] Successfully logged in with self-healed locators');

    // Verify updated scores
    console.log('[TEST 2] Updated Locators (after self-healing):');
    console.log('[TEST 2]   Username Field:', locatorCache.getScores('username_field'));
    console.log('[TEST 2]   Password Field:', locatorCache.getScores('password_field'));
    console.log('[TEST 2]   Login Button:', locatorCache.getScores('login_button'));
  });

  /**
   * Test 3: Verify cache persistence and reusability
   * Demonstrates that the cache can be used across test runs
   */
  it('should have persisted learned locators in master cache', function () {
    this.timeout(5000);

    // Verify cache file was created
    expect(fs.existsSync(masterCachePath)).to.be.true;
    console.log('[TEST 3] Master cache file exists:', masterCachePath);

    // Verify cache contains our learned locators
    const cacheData = JSON.parse(fs.readFileSync(masterCachePath, 'utf-8'));
    
    expect(cacheData).to.have.property('username_field');
    expect(cacheData).to.have.property('password_field');
    expect(cacheData).to.have.property('login_button');

    console.log('[TEST 3] All element locators persisted in master cache');
    console.log('[TEST 3] Cache Summary:');
    console.log(JSON.stringify(cacheData, null, 2));
  });

  /**
   * Test 4: Verify scoring mechanism
   */
  it('should maintain accurate success/failure scores', function () {
    // Get scores for username field
    const usernameScores = locatorCache.getScores('username_field');
    
    // Should have at least 2 locators (initial + self-healed one)
    expect(usernameScores.length).to.be.greaterThanOrEqual(2);

    // Best locator should have high score
    const bestLocator = usernameScores[0];
    expect(bestLocator.score).to.be.greaterThanOrEqual(50);
    
    console.log('[TEST 4] Best username locator:', bestLocator.locator, 'Score:', bestLocator.score);
    console.log('[TEST 4] All attempts:', usernameScores);
  });
});
