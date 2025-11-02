// Main Smart Locator Inspector Module
// Entry point that orchestrates all modules

import { SLIConfig } from './modules/config.js';
import { SLIUIComponents } from './modules/ui.js';
import { SLIEventHandlers } from './modules/events.js';

export class SmartLocatorInspector {
    // Initialize the inspector
    static init() {
        console.log('[SLI] Smart Locator Inspector initialized');
        
        // Clean up any existing instances
        this.cleanup();
        
        // Create UI elements
        SLIUIComponents.createModal();
        SLIUIComponents.createHighlightBox();
        
        // Attach event listeners
        SLIEventHandlers.attachEventListeners();
        
        // Show initial message
        SLIUIComponents.updateModal({
            message: 'Hover over elements to inspect them!',
            instructions: [
                'CTRL - Freeze current element',
                'ESC - Toggle inspector on/off', 
                'Click any locator to copy it'
            ]
        });

        // Setup navigation persistence
        SLIEventHandlers.setupNavigationPersistence();
    }

    // Toggle inspector visibility
    static toggle() {
        SLIUIComponents.toggle();
    }

    // Clean up all inspector elements and state
    static cleanup() {
        console.log('[SLI] Cleaning up Smart Locator Inspector...');
        
        // Remove event listeners
        SLIEventHandlers.removeEventListeners();
        
        // Clean up UI
        SLIUIComponents.cleanup();
    }

    // Get current state (for debugging)
    static getState() {
        return SLIConfig.getState();
    }

    // Get configuration (for debugging)
    static getConfig() {
        return SLIConfig.getConfig();
    }
}