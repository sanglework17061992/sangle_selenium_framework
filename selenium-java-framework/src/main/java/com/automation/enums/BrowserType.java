package com.automation.enums;

/**
 * BrowserType - enum for different browser types
 * 
 * This enum provides standardized browser identifiers for:
 * - Browser selection in configuration
 * - Cross-browser testing
 * - Browser-specific handling
 * - Test reporting and logging
 */
public enum BrowserType {
    CHROME("chrome", "Google Chrome"),
    FIREFOX("firefox", "Mozilla Firefox"),
    EDGE("edge", "Microsoft Edge"),
    SAFARI("safari", "Apple Safari"),
    OPERA("opera", "Opera Browser"),
    IE("internetexplorer", "Internet Explorer");

    private final String identifier;
    private final String displayName;

    BrowserType(String identifier, String displayName) {
        this.identifier = identifier;
        this.displayName = displayName;
    }

    /**
     * Gets the browser identifier (lowercase)
     * @return browser identifier for configuration
     */
    public String getIdentifier() {
        return identifier;
    }

    /**
     * Gets the display name for the browser
     * @return human-readable browser name
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * Gets BrowserType by identifier (case-insensitive)
     * @param identifier the browser identifier
     * @return corresponding BrowserType
     * @throws IllegalArgumentException if identifier is invalid
     */
    public static BrowserType fromIdentifier(String identifier) {
        for (BrowserType browser : values()) {
            if (browser.identifier.equalsIgnoreCase(identifier)) {
                return browser;
            }
        }
        throw new IllegalArgumentException("Unsupported browser: " + identifier);
    }

    @Override
    public String toString() {
        return displayName;
    }
}