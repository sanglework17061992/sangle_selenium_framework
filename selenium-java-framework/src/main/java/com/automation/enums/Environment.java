package com.automation.enums;

/**
 * Environment - enum for different test environments
 * 
 * This enum provides standardized environment identifiers for:
 * - Environment-specific configuration
 * - URL and endpoint management
 * - Test data selection
 * - Deployment targeting
 */
public enum Environment {
    LOCAL("local", "Local Development", "http://localhost"),
    DEV("dev", "Development", "https://dev.example.com"),
    QA("qa", "Quality Assurance", "https://qa.example.com"),
    STAGING("staging", "Staging", "https://staging.example.com"),
    UAT("uat", "User Acceptance Testing", "https://uat.example.com"),
    PROD("prod", "Production", "https://www.example.com");

    private final String identifier;
    private final String displayName;
    private final String defaultBaseUrl;

    Environment(String identifier, String displayName, String defaultBaseUrl) {
        this.identifier = identifier;
        this.displayName = displayName;
        this.defaultBaseUrl = defaultBaseUrl;
    }

    /**
     * Gets the environment identifier
     * @return environment identifier for configuration
     */
    public String getIdentifier() {
        return identifier;
    }

    /**
     * Gets the display name for the environment
     * @return human-readable environment name
     */
    public String getDisplayName() {
        return displayName;
    }

    /**
     * Gets the default base URL for the environment
     * @return default base URL
     */
    public String getDefaultBaseUrl() {
        return defaultBaseUrl;
    }

    /**
     * Gets Environment by identifier (case-insensitive)
     * @param identifier the environment identifier
     * @return corresponding Environment
     * @throws IllegalArgumentException if identifier is invalid
     */
    public static Environment fromIdentifier(String identifier) {
        for (Environment env : values()) {
            if (env.identifier.equalsIgnoreCase(identifier)) {
                return env;
            }
        }
        throw new IllegalArgumentException("Unknown environment: " + identifier);
    }

    /**
     * Checks if this is a production environment
     * @return true if this is production
     */
    public boolean isProduction() {
        return this == PROD;
    }

    /**
     * Checks if this is a development/test environment
     * @return true if this is a development or test environment
     */
    public boolean isDevelopment() {
        return this == LOCAL || this == DEV || this == QA || this == STAGING || this == UAT;
    }

    @Override
    public String toString() {
        return displayName;
    }
}