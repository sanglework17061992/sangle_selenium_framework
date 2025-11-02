package com.automation.core;

import com.automation.exceptions.ConfigurationException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * ConfigManager - Singleton class for managing application configuration
 * Loads configuration from properties files based on environment
 */
@SuppressWarnings("java:S6548") // Singleton pattern is required for configuration management
public class ConfigManager {
    private static final Logger logger = LogManager.getLogger(ConfigManager.class);
    private static ConfigManager instance;
    private Properties properties;
    
    // Configuration keys
    public static final String BROWSER = "browser";
    public static final String HEADLESS = "headless";
    public static final String BASE_URL = "baseUrl";
    public static final String EXPLICIT_WAIT = "explicitWait";
    public static final String RETRY_COUNT = "retryCount";
    public static final String PARALLEL = "parallel";
    public static final String THREAD_COUNT = "threadCount";
    public static final String ENVIRONMENT = "environment";
    
    private ConfigManager() {
        loadProperties();
    }
    
    /**
     * Get singleton instance of ConfigManager
     * @return ConfigManager instance
     */
    public static synchronized ConfigManager getInstance() {
        if (instance == null) {
            instance = new ConfigManager();
        }
        return instance;
    }
    
    /**
     * Load properties from configuration file
     */
    private void loadProperties() {
        properties = new Properties();
        String environment = System.getProperty("env", "default");
        String configFile = String.format("config.%s.properties", environment);
        
        try {
            // Try to load environment-specific config first
            InputStream inputStream = getClass().getClassLoader().getResourceAsStream(configFile);
            
            if (inputStream == null) {
                // Fall back to default config
                inputStream = getClass().getClassLoader().getResourceAsStream("config.properties");
                logger.warn("Environment-specific config '{}' not found, using default config", configFile);
            }
            
            if (inputStream != null) {
                properties.load(inputStream);
                logger.info("Configuration loaded from: {}", configFile);
            } else {
                logger.error("Configuration file not found: {}", configFile);
                throw new ConfigurationException("Configuration file not found: " + configFile);
            }
            
        } catch (IOException e) {
            logger.error("Error loading configuration: {}", e.getMessage());
            throw new ConfigurationException("Error loading configuration", e);
        }
    }
    
    /**
     * Get property value as String
     * @param key Property key
     * @return Property value
     */
    public String getProperty(String key) {
        String value = System.getProperty(key, properties.getProperty(key));
        if (value == null) {
            logger.warn("Property '{}' not found", key);
        }
        return value;
    }
    
    /**
     * Get property value as String with default value
     * @param key Property key
     * @param defaultValue Default value if property not found
     * @return Property value or default value
     */
    public String getProperty(String key, String defaultValue) {
        return System.getProperty(key, properties.getProperty(key, defaultValue));
    }
    
    /**
     * Get property value as Integer
     * @param key Property key
     * @return Property value as Integer
     */
    public int getIntProperty(String key) {
        String value = getProperty(key);
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            logger.error("Invalid integer property '{}': {}", key, value);
            throw new ConfigurationException("Invalid integer property: " + key);
        }
    }
    
    /**
     * Get property value as Integer with default value
     * @param key Property key
     * @param defaultValue Default value if property not found
     * @return Property value as Integer or default value
     */
    public int getIntProperty(String key, int defaultValue) {
        String value = getProperty(key);
        if (value == null) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            logger.warn("Invalid integer property '{}': {}, using default: {}", key, value, defaultValue);
            return defaultValue;
        }
    }
    
    /**
     * Get property value as Boolean
     * @param key Property key
     * @return Property value as Boolean
     */
    public boolean getBooleanProperty(String key) {
        String value = getProperty(key);
        return Boolean.parseBoolean(value);
    }
    
    /**
     * Get property value as Boolean with default value
     * @param key Property key
     * @param defaultValue Default value if property not found
     * @return Property value as Boolean or default value
     */
    public boolean getBooleanProperty(String key, boolean defaultValue) {
        String value = getProperty(key);
        if (value == null) {
            return defaultValue;
        }
        return Boolean.parseBoolean(value);
    }
    
    // Convenience methods for common properties
    public String getBrowser() {
        return getProperty(BROWSER, "chrome");
    }
    
    public boolean isHeadless() {
        return getBooleanProperty(HEADLESS, false);
    }
    
    public String getBaseUrl() {
        return getProperty(BASE_URL, "http://localhost:8080");
    }
    
    public int getExplicitWait() {
        return getIntProperty(EXPLICIT_WAIT, 10);
    }
    
    public int getRetryCount() {
        return getIntProperty(RETRY_COUNT, 2);
    }
    
    public boolean isParallelExecution() {
        return getBooleanProperty(PARALLEL, false);
    }
    
    public int getThreadCount() {
        return getIntProperty(THREAD_COUNT, 2);
    }
    
    public String getEnvironment() {
        return getProperty(ENVIRONMENT, "qa");
    }
}