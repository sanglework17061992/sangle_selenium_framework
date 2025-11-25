/**
 * Browser Factories and Registry
 * Centralized export point for all browser-related functionality
 * 
 * Each factory encapsulates browser-specific setup and configuration.
 * This modular structure makes it easy to add new browsers (Edge, Safari, etc.)
 * in the future by simply creating a new factory class.
 */

export { BaseBrowserFactory, type BrowserFactory } from './BaseBrowserFactory';
export { ChromeFactory } from './ChromeFactory';
export { FirefoxFactory } from './FirefoxFactory';
export { BrowserRegistry } from './BrowserRegistry';
