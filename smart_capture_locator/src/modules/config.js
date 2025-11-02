// Configuration and Global State Management
// Centralized configuration and state for Smart Locator Inspector

export class SLIConfig {
    static config = {
        modalId: 'sli-modal',
        highlightId: 'sli-highlight',
        zIndex: 2147483647, // Maximum z-index
        excludeElements: ['sli-modal', 'sli-highlight'],
        ignoreTags: ['HTML', 'BODY']
    };

    static state = {
        isActive: true,
        isFrozen: false,
        currentElement: null,
        modal: null,
        highlightBox: null,
        lastHoveredElement: null
    };

    static getConfig() {
        return this.config;
    }

    static getState() {
        return this.state;
    }

    static setState(newState) {
        Object.assign(this.state, newState);
    }

    static resetState() {
        this.state = {
            isActive: true,
            isFrozen: false,
            currentElement: null,
            modal: null,
            highlightBox: null,
            lastHoveredElement: null
        };
    }
}