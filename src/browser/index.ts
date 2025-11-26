/**
 * Browser Factories and Registry
 * Centralized export point for all browser-related functionality
 * 
 * Each factory encapsulates browser-specific setup and configuration.
 * This modular structure makes it easy to add new browsers (Edge, Safari, etc.)
 * in the future by simply creating a new factory class.
 */

export { BaseBrowserFactory, type BrowserFactory } from '@browser/BaseBrowserFactory';
export { ChromeFactory } from '@browser/ChromeFactory';
export { FirefoxFactory } from '@browser/FirefoxFactory';
export { BrowserRegistry } from '@browser/BrowserRegistry';
