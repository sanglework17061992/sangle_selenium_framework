package com.automation.healing;

import com.automation.utils.LoggerUtil;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * HealingConfiguration - Configuration management for the healing system
 * Loads settings from properties files and environment variables
 */
public class HealingConfiguration {
    
    private static final String HEALING_PROPERTIES_FILE = "healing.properties";
    private static final String DEFAULT_PROPERTIES_FILE = "healing-default.properties";
    
    // Default values
    private static final boolean DEFAULT_HEALING_ENABLED = true;
    private static final String DEFAULT_HEALING_MODE = "auto";
    private static final double DEFAULT_CONFIDENCE_THRESHOLD = 0.75;
    private static final int DEFAULT_MAX_CANDIDATES = 5;
    private static final long DEFAULT_HEALING_TIMEOUT = 10000;
    private static final boolean DEFAULT_NOTIFICATIONS_ENABLED = false;
    private static final String DEFAULT_LOCATORS_FILE = "healing/locator_repository.json";
    private static final String DEFAULT_SUGGESTIONS_FILE = "healing/healing_suggestions.json";
    
    private final Properties properties;
    private static HealingConfiguration instance;
    
    private HealingConfiguration() {
        this.properties = new Properties();
        loadConfiguration();
    }
    
    /**
     * Gets the singleton instance
     */
    public static synchronized HealingConfiguration getInstance() {
        if (instance == null) {
            instance = new HealingConfiguration();
        }
        return instance;
    }
    
    /**
     * Loads configuration from properties files and system properties
     */
    private void loadConfiguration() {
        try {
            // Load default properties first
            loadPropertiesFile(DEFAULT_PROPERTIES_FILE);
            
            // Load user properties (if exists)
            loadPropertiesFile(HEALING_PROPERTIES_FILE);
            
            // Override with system properties
            loadSystemProperties();
            
            LoggerUtil.info("Healing configuration loaded successfully");
            
        } catch (Exception e) {
            LoggerUtil.error("Error loading healing configuration: " + e.getMessage(), e);
            LoggerUtil.info("Using default configuration values");
        }
    }
    
    private void loadPropertiesFile(String filename) {
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream(filename)) {
            if (inputStream != null) {
                properties.load(inputStream);
                LoggerUtil.debug("Loaded properties from: " + filename);
            } else {
                LoggerUtil.debug("Properties file not found: " + filename);
            }
        } catch (IOException e) {
            LoggerUtil.debug("Could not load properties from " + filename + ": " + e.getMessage());
        }
    }
    
    private void loadSystemProperties() {
        // Override with system properties if set
        String[] healingProps = {
            "healing.enabled",
            "healing.mode", 
            "healing.confidenceThreshold",
            "healing.maxCandidates",
            "healing.timeout",
            "healing.notifications.enabled",
            "healing.notifications.webhookUrl",
            "healing.locators.file",
            "healing.suggestions.file"
        };
        
        for (String prop : healingProps) {
            String systemValue = System.getProperty(prop);
            if (systemValue != null) {
                properties.setProperty(prop, systemValue);
                LoggerUtil.debug("Override from system property: " + prop + "=" + systemValue);
            }
        }
    }
    
    // Configuration getters
    
    public boolean isHealingEnabled() {
        return getBooleanProperty("healing.enabled", DEFAULT_HEALING_ENABLED);
    }
    
    public String getHealingMode() {
        return getStringProperty("healing.mode", DEFAULT_HEALING_MODE);
    }
    
    public double getConfidenceThreshold() {
        return getDoubleProperty("healing.confidenceThreshold", DEFAULT_CONFIDENCE_THRESHOLD);
    }
    
    public int getMaxCandidates() {
        return getIntProperty("healing.maxCandidates", DEFAULT_MAX_CANDIDATES);
    }
    
    public long getHealingTimeout() {
        return getLongProperty("healing.timeout", DEFAULT_HEALING_TIMEOUT);
    }
    
    public boolean isNotificationsEnabled() {
        return getBooleanProperty("healing.notifications.enabled", DEFAULT_NOTIFICATIONS_ENABLED);
    }
    
    public String getNotificationWebhookUrl() {
        return getStringProperty("healing.notifications.webhookUrl", "");
    }
    
    public String getLocatorsFile() {
        return getStringProperty("healing.locators.file", DEFAULT_LOCATORS_FILE);
    }
    
    public String getSuggestionsFile() {
        return getStringProperty("healing.suggestions.file", DEFAULT_SUGGESTIONS_FILE);
    }
    
    public boolean isPersistSnapshots() {
        return getBooleanProperty("healing.persistSnapshots", true);
    }
    
    public boolean isNotifyOnHeal() {
        return getBooleanProperty("healing.notifyOnHeal", false);
    }
    
    public String getBackupDirectory() {
        return getStringProperty("healing.backup.directory", "healing/backups");
    }
    
    public boolean isAutoBackupEnabled() {
        return getBooleanProperty("healing.backup.auto", true);
    }
    
    public int getBackupRetentionDays() {
        return getIntProperty("healing.backup.retentionDays", 30);
    }
    
    // Configuration setters (for runtime changes)
    
    public void setHealingEnabled(boolean enabled) {
        properties.setProperty("healing.enabled", String.valueOf(enabled));
    }
    
    public void setHealingMode(String mode) {
        properties.setProperty("healing.mode", mode);
    }
    
    public void setConfidenceThreshold(double threshold) {
        properties.setProperty("healing.confidenceThreshold", String.valueOf(threshold));
    }
    
    public void setMaxCandidates(int maxCandidates) {
        properties.setProperty("healing.maxCandidates", String.valueOf(maxCandidates));
    }
    
    public void setNotificationsEnabled(boolean enabled) {
        properties.setProperty("healing.notifications.enabled", String.valueOf(enabled));
    }
    
    public void setNotificationWebhookUrl(String url) {
        properties.setProperty("healing.notifications.webhookUrl", url);
    }
    
    // Helper methods
    
    private String getStringProperty(String key, String defaultValue) {
        return properties.getProperty(key, defaultValue);
    }
    
    private boolean getBooleanProperty(String key, boolean defaultValue) {
        String value = properties.getProperty(key);
        if (value == null) {
            return defaultValue;
        }
        return Boolean.parseBoolean(value);
    }
    
    private int getIntProperty(String key, int defaultValue) {
        String value = properties.getProperty(key);
        if (value == null) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            LoggerUtil.warn("Invalid integer value for property " + key + ": " + value + ". Using default: " + defaultValue);
            return defaultValue;
        }
    }
    
    private long getLongProperty(String key, long defaultValue) {
        String value = properties.getProperty(key);
        if (value == null) {
            return defaultValue;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            LoggerUtil.warn("Invalid long value for property " + key + ": " + value + ". Using default: " + defaultValue);
            return defaultValue;
        }
    }
    
    private double getDoubleProperty(String key, double defaultValue) {
        String value = properties.getProperty(key);
        if (value == null) {
            return defaultValue;
        }
        try {
            return Double.parseDouble(value);
        } catch (NumberFormatException e) {
            LoggerUtil.warn("Invalid double value for property " + key + ": " + value + ". Using default: " + defaultValue);
            return defaultValue;
        }
    }
    
    /**
     * Gets all configuration properties as a map
     */
    public Properties getAllProperties() {
        return new Properties(properties);
    }
    
    /**
     * Validates the current configuration
     */
    public boolean validateConfiguration() {
        try {
            // Validate healing mode
            String mode = getHealingMode();
            if (!"auto".equals(mode) && !"suggest-only".equals(mode)) {
                LoggerUtil.warn("Invalid healing mode: " + mode + ". Should be 'auto' or 'suggest-only'");
                return false;
            }
            
            // Validate confidence threshold
            double threshold = getConfidenceThreshold();
            if (threshold < 0.0 || threshold > 1.0) {
                LoggerUtil.warn("Invalid confidence threshold: " + threshold + ". Should be between 0.0 and 1.0");
                return false;
            }
            
            // Validate max candidates
            int maxCandidates = getMaxCandidates();
            if (maxCandidates < 1 || maxCandidates > 20) {
                LoggerUtil.warn("Invalid max candidates: " + maxCandidates + ". Should be between 1 and 20");
                return false;
            }
            
            // Validate timeout
            long timeout = getHealingTimeout();
            if (timeout < 1000 || timeout > 60000) {
                LoggerUtil.warn("Invalid healing timeout: " + timeout + ". Should be between 1000 and 60000 ms");
                return false;
            }
            
            LoggerUtil.info("Healing configuration validation passed");
            return true;
            
        } catch (Exception e) {
            LoggerUtil.error("Error validating configuration: " + e.getMessage(), e);
            return false;
        }
    }
    
    /**
     * Prints current configuration to log
     */
    public void logConfiguration() {
        LoggerUtil.info("=== Healing Configuration ===");
        LoggerUtil.info("Healing Enabled: " + isHealingEnabled());
        LoggerUtil.info("Healing Mode: " + getHealingMode());
        LoggerUtil.info("Confidence Threshold: " + getConfidenceThreshold());
        LoggerUtil.info("Max Candidates: " + getMaxCandidates());
        LoggerUtil.info("Healing Timeout: " + getHealingTimeout() + "ms");
        LoggerUtil.info("Notifications Enabled: " + isNotificationsEnabled());
        LoggerUtil.info("Locators File: " + getLocatorsFile());
        LoggerUtil.info("Suggestions File: " + getSuggestionsFile());
        LoggerUtil.info("===============================");
    }
}