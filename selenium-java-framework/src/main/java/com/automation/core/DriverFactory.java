package com.automation.core;

import com.automation.constants.DriverConstants;
import com.automation.exceptions.DriverCreationException;
import io.github.bonigarcia.wdm.WebDriverManager;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.edge.EdgeOptions;
import org.openqa.selenium.safari.SafariDriver;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

/**
 * DriverFactory - Factory class for creating WebDriver instances
 * Supports Chrome, Firefox, Edge, Safari with headless mode and thread-safe handling
 */
public class DriverFactory {
    private static final Logger logger = LogManager.getLogger(DriverFactory.class);
    private static final ThreadLocal<WebDriver> driverThreadLocal = new ThreadLocal<>();
    
    private DriverFactory() {
        // Private constructor to hide implicit public one
    }
    
    /**
     * Create WebDriver instance based on browser configuration
     * @param browser Browser name (chrome, firefox, edge, safari)
     * @param headless Whether to run in headless mode
     * @return WebDriver instance
     */
    public static WebDriver createDriver(String browser, boolean headless) {
        WebDriver driver;
        
        try {
            switch (browser.toLowerCase()) {
                case "chrome":
                    driver = createChromeDriver(headless);
                    break;
                case "firefox":
                    driver = createFirefoxDriver(headless);
                    break;
                case "edge":
                    driver = createEdgeDriver(headless);
                    break;
                case "safari":
                    driver = createSafariDriver();
                    break;
                default:
                    logger.warn("Unknown browser '{}', defaulting to Chrome", browser);
                    driver = createChromeDriver(headless);
            }
            
            // Configure driver
            driver.manage().window().maximize();
            driver.manage().deleteAllCookies();
            
            // Store in ThreadLocal for thread-safe access
            driverThreadLocal.set(driver);
            
            logger.info("Created {} driver (headless: {})", browser, headless);
            return driver;
            
        } catch (Exception e) {
            logger.error("Failed to create {} driver: {}", browser, e.getMessage());
            throw new DriverCreationException("Failed to create driver", e);
        }
    }
    
    /**
     * Create WebDriver with default configuration from ConfigManager
     * @return WebDriver instance
     */
    public static WebDriver createDriver() {
        ConfigManager config = ConfigManager.getInstance();
        return createDriver(config.getBrowser(), config.isHeadless());
    }
    
    /**
     * Get current driver from ThreadLocal
     * @return WebDriver instance for current thread
     */
    public static WebDriver getDriver() {
        return driverThreadLocal.get();
    }
    
    /**
     * Quit driver and remove from ThreadLocal
     */
    public static void quitDriver() {
        WebDriver driver = driverThreadLocal.get();
        if (driver != null) {
            try {
                driver.quit();
                logger.info("Driver quit successfully");
            } catch (Exception e) {
                logger.error("Error quitting driver: {}", e.getMessage());
            } finally {
                driverThreadLocal.remove();
            }
        }
    }
    
    /**
     * Create Chrome driver with options
     * @param headless Whether to run in headless mode
     * @return ChromeDriver instance
     */
    private static WebDriver createChromeDriver(boolean headless) {
        WebDriverManager.chromedriver().setup();
        
        ChromeOptions options = new ChromeOptions();
        options.addArguments(DriverConstants.NO_SANDBOX);
        options.addArguments(DriverConstants.DISABLE_DEV_SHM_USAGE);
        options.addArguments("--disable-gpu");
        options.addArguments("--disable-extensions");
        options.addArguments("--disable-blink-features=AutomationControlled");
        
        // Disable password manager popup and other notifications
        options.addArguments("--disable-password-manager-reauthentication");
        options.addArguments("--disable-save-password-bubble");
        options.addArguments("--disable-features=VizDisplayCompositor");
        options.addArguments("--disable-notifications");
        options.addArguments("--disable-popup-blocking");
        options.addArguments("--disable-translate");
        options.addArguments("--disable-background-timer-throttling");
        options.addArguments("--disable-backgrounding-occluded-windows");
        options.addArguments("--disable-renderer-backgrounding");
        options.addArguments("--disable-field-trial-config");
        options.addArguments("--disable-ipc-flooding-protection");
        
        // Disable automation flags and password manager
        options.setExperimentalOption("useAutomationExtension", false);
        options.setExperimentalOption("excludeSwitches", new String[]{"enable-automation"});
        
        // Disable password manager and credentials service
        options.addArguments("--password-store=basic");
        options.addArguments("--use-mock-keychain");
        
        // Set preferences to disable password manager
        java.util.Map<String, Object> prefs = new java.util.HashMap<>();
        prefs.put("credentials_enable_service", false);
        prefs.put("password_manager_enabled", false);
        prefs.put("profile.password_manager_enabled", false);
        prefs.put("profile.default_content_setting_values.notifications", 2);
        prefs.put("profile.default_content_settings.popups", 0);
        options.setExperimentalOption("prefs", prefs);
        
        if (headless) {
            options.addArguments(DriverConstants.HEADLESS);
            options.addArguments(DriverConstants.WINDOW_SIZE);
        }
        
        return new ChromeDriver(options);
    }
    
    /**
     * Create Firefox driver with options
     * @param headless Whether to run in headless mode
     * @return FirefoxDriver instance
     */
    private static WebDriver createFirefoxDriver(boolean headless) {
        WebDriverManager.firefoxdriver().setup();
        
        FirefoxOptions options = new FirefoxOptions();
        options.addArguments(DriverConstants.NO_SANDBOX);
        options.addArguments(DriverConstants.DISABLE_DEV_SHM_USAGE);
        
        // Disable password manager and notifications for Firefox
        options.addPreference("signon.rememberSignons", false);
        options.addPreference("signon.autofillForms", false);
        options.addPreference("dom.webnotifications.enabled", false);
        options.addPreference("dom.push.enabled", false);
        
        if (headless) {
            options.addArguments(DriverConstants.HEADLESS);
            options.addArguments("--width=1920");
            options.addArguments("--height=1080");
        }
        
        return new FirefoxDriver(options);
    }
    
    /**
     * Create Edge driver with options
     * @param headless Whether to run in headless mode
     * @return EdgeDriver instance
     */
    private static WebDriver createEdgeDriver(boolean headless) {
        WebDriverManager.edgedriver().setup();
        
        EdgeOptions options = new EdgeOptions();
        options.addArguments(DriverConstants.NO_SANDBOX);
        options.addArguments(DriverConstants.DISABLE_DEV_SHM_USAGE);
        options.addArguments("--disable-gpu");
        options.addArguments("--disable-extensions");
        
        // Disable password manager popup and other notifications for Edge
        options.addArguments("--disable-password-manager-reauthentication");
        options.addArguments("--disable-save-password-bubble");
        options.addArguments("--disable-notifications");
        options.addArguments("--disable-popup-blocking");
        
        // Set preferences to disable password manager
        java.util.Map<String, Object> prefs = new java.util.HashMap<>();
        prefs.put("credentials_enable_service", false);
        prefs.put("password_manager_enabled", false);
        prefs.put("profile.password_manager_enabled", false);
        prefs.put("profile.default_content_setting_values.notifications", 2);
        options.setExperimentalOption("prefs", prefs);
        
        if (headless) {
            options.addArguments(DriverConstants.HEADLESS);
            options.addArguments(DriverConstants.WINDOW_SIZE);
        }
        
        return new EdgeDriver(options);
    }
    
    /**
     * Create Safari driver
     * Note: Safari doesn't support headless mode
     * @return SafariDriver instance
     */
    private static WebDriver createSafariDriver() {
        // No setup needed for Safari
        return new SafariDriver();
    }
    
    /**
     * Check if driver is available
     * @return true if driver exists and is not null
     */
    public static boolean isDriverAvailable() {
        return driverThreadLocal.get() != null;
    }
    
    /**
     * Restart current driver
     */
    public static void restartDriver() {
        ConfigManager config = ConfigManager.getInstance();
        quitDriver();
        createDriver(config.getBrowser(), config.isHeadless());
    }
}