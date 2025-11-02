// Smart Locator Inspector - Modular Template
// This is a template file used by the build script to generate the final injector
// The build script will replace the MODULE_PLACEHOLDER comments with actual module code

(function() {
    'use strict';

    // Prevent multiple injections
    if (window.SmartLocatorInspector) {
        console.log('[SLI] Already injected, refreshing...');
        window.SmartLocatorInspector.cleanup();
    }

    // === MODULES WILL BE INSERTED HERE BY BUILD SCRIPT ===
    // MODULE_PLACEHOLDER: config.js
    // MODULE_PLACEHOLDER: utils.js
    // MODULE_PLACEHOLDER: styles.js
    // MODULE_PLACEHOLDER: hierarchy.js
    // MODULE_PLACEHOLDER: locators.js
    // MODULE_PLACEHOLDER: ui.js
    // MODULE_PLACEHOLDER: events.js
    // MODULE_PLACEHOLDER: main.js

    // === INITIALIZATION ===
    
    // Initialize the inspector
    SmartLocatorInspector.init();

    // Expose global interface
    window.SLI = {
        init: SmartLocatorInspector.init.bind(SmartLocatorInspector),
        toggle: SmartLocatorInspector.toggle.bind(SmartLocatorInspector),
        cleanup: SmartLocatorInspector.cleanup.bind(SmartLocatorInspector),
        getState: SmartLocatorInspector.getState.bind(SmartLocatorInspector),
        getConfig: SmartLocatorInspector.getConfig.bind(SmartLocatorInspector)
    };

    // Store reference for cleanup
    window.SmartLocatorInspector = SmartLocatorInspector;

})();