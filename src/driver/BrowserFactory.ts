/**
 * Browser Factory Module - Re-exports
 * 
 * This module serves as the main export point for browser factories.
 * Individual browser implementations are separated into their own files
 * for better organization and maintainability.
 * 
 * Browser-specific logic is located in:
 * - ./browsers/ChromeFactory.ts
 * - ./browsers/FirefoxFactory.ts
 * - ./browsers/BaseBrowserFactory.ts (abstract base)
 * 
 * To add a new browser (Edge, Safari, etc.):
 * 1. Create a new file in ./browsers/ (e.g., EdgeFactory.ts)
 * 2. Extend BaseBrowserFactory
 * 3. Implement getBrowserName() and createBuilder() methods
 * 4. Add browser-specific arguments to Constants.ts
 * 5. Export from ./browsers/index.ts
 * 6. Register factory in DriverManager.createDefaultRegistry()
 */

export { BaseBrowserFactory, type BrowserFactory, ChromeFactory, FirefoxFactory } from './browsers';
